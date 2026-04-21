import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TRENDING_PATH = resolve(ROOT, 'data', 'trending-topics.json');
const DRAFTS_DIR = resolve(ROOT, 'data', 'drafts');
const PLANS_PATH = resolve(ROOT, 'data', 'plans.json');
const KAISEN_PLANS_PATH = resolve(ROOT, 'data', 'kaisen-plans.json');

function loadEnv(path) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf-8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const [, k, vRaw] = m;
    if (process.env[k]) continue;
    process.env[k] = vRaw.replace(/^['"]|['"]$/g, '');
  }
}
loadEnv(resolve(ROOT, '.env.local'));
loadEnv(resolve(ROOT, '.env'));

const MODEL = 'claude-sonnet-4-6';
const MAX_RETRY = 1;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function generateId() {
  return randomBytes(8).toString('hex');
}

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

async function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(await readFile(path, 'utf-8'));
  } catch {
    return fallback;
  }
}

function buildPlansContext(plans) {
  return plans
    .map(p => {
      const data = p.data_gb === 999 ? '無制限' : `${p.data_gb}GB`;
      return `- ${p.carrier} ${p.plan_name}: 月${p.monthly_cost.toLocaleString()}円 / ${data} / ${p.target}`;
    })
    .join('\n');
}

function buildKaisenPlansContext(plans) {
  return plans
    .map(p => {
      const house = p.monthly_cost_house?.toLocaleString() ?? '—';
      const mansion = p.monthly_cost_mansion?.toLocaleString() ?? '—';
      return `- ${p.name}: 戸建て月${house}円 / マンション月${mansion}円 / ${p.max_speed} / ${p.target}`;
    })
    .join('\n');
}

const TONE_INSTRUCTIONS = {
  comparison: `# 記事タイプ: 比較記事
- 客観的なデータと事実に基づいて比較する
- 比較項目を整理して順に解説
- 一方を過剰に褒めず、それぞれが向く人物像を明示する`,
  review: `# 記事タイプ: レビュー記事
- 体験談トーンで書く
- メリットとデメリットを並列に挙げる
- 「向いている人」「向いていない人」を最後に明示する`,
  guide: `# 記事タイプ: ガイド記事
- 手順は番号付きまたは見出し付きで順を追って解説
- つまずきポイント・よくある失敗例を必ず1セクション含める`,
  knowledge: `# 記事タイプ: 知識・解説記事
- 前提知識ゼロで書く
- 「なぜそうなのか」の背景・理由まで踏み込む`,
};

function buildPrompt(topic, plansContext) {
  const tone = TONE_INSTRUCTIONS[topic.category] || TONE_INSTRUCTIONS.knowledge;
  const isKaisen = topic.type === 'kaisen';
  const writerRole = isKaisen
    ? 'あなたは日本のインターネット回線事情に詳しいライターです。'
    : 'あなたは日本のスマートフォン料金事情に詳しいライターです。';
  const planLabel = isKaisen ? '主要光回線・ホームルーター一覧' : '主要スマホプラン一覧';

  return `${writerRole}以下のテーマでSEO記事を書いてください。

# 参考: 2026年4月時点の${planLabel}
${plansContext}

# 記事情報
- タイトル: ${topic.title}
- スラッグ: ${topic.slug}
- トレンドキーワード: ${topic.keyword}

${tone}

# 出力形式（必ずこのJSON形式のみで返答）
{
  "description": "meta description（120文字程度・検索結果でクリックされやすい文章）",
  "content": "マークダウン形式の記事本文"
}

# 本文ルール
- 文字数: 2000〜3000文字（厳守）
- 構成: 導入文 → ## 見出し でセクション3〜5個 → ## まとめ
- セクションのうち1つは必ず「よくある誤解」または「意外な落とし穴」を含む独自視点のセクション
- 使用可能マークダウン記法: ## 見出し2、### 見出し3、段落、- 箇条書き、**太字**
- 表・画像・リンク・コードブロックは使わない
- タイトル（# h1）は本文に含めない
- 中立的なトーン
- 具体的な数値を必ず複数含める
- 2026年4月時点の情報として記述`;
}

function validate(obj) {
  if (!obj || typeof obj !== 'object') return 'not an object';
  if (typeof obj.description !== 'string' || obj.description.length < 60 || obj.description.length > 200) {
    return `description length out of range: ${obj.description?.length}`;
  }
  if (typeof obj.content !== 'string') return 'content must be string';
  const len = obj.content.length;
  if (len < 1500 || len > 4000) return `content length out of range: ${len}`;
  if (!obj.content.includes('##')) return 'content has no h2 heading';
  return null;
}

function extractJson(text) {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const raw = fence ? fence[1] : text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no JSON object in response');
  return JSON.parse(raw.slice(start, end + 1));
}

async function generateOne(client, topic, plansContext) {
  let lastErr = null;
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    try {
      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        messages: [{ role: 'user', content: buildPrompt(topic, plansContext) }],
      });
      const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
      const parsed = extractJson(text);
      const err = validate(parsed);
      if (err) throw new Error(`schema: ${err}`);
      return parsed;
    } catch (e) {
      lastErr = e;
      console.warn(`  [retry ${attempt + 1}] ${topic.slug}: ${e.message}`);
    }
  }
  throw lastErr;
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const topics = await readJson(TRENDING_PATH, []);
  if (!Array.isArray(topics) || topics.length === 0) {
    throw new Error(`No trending topics at ${TRENDING_PATH}`);
  }

  const plans = await readJson(PLANS_PATH, []);
  const kaisenPlans = await readJson(KAISEN_PLANS_PATH, []);
  const smahoCtx = buildPlansContext(plans);
  const kaisenCtx = buildKaisenPlansContext(kaisenPlans);

  const client = new Anthropic({ apiKey });
  await mkdir(DRAFTS_DIR, { recursive: true });

  const drafts = [];

  for (const topic of topics) {
    const ctx = topic.type === 'kaisen' ? kaisenCtx : smahoCtx;
    console.log(`\nGenerating [${topic.type}/${topic.category}] ${topic.slug}...`);

    try {
      const { description, content } = await generateOne(client, topic, ctx);
      const id = generateId();
      const draft = {
        id,
        slug: topic.slug,
        title: topic.title,
        description,
        keyword: topic.keyword,
        category: topic.category,
        type: topic.type || 'smaho',
        reason: topic.reason || '',
        content,
        createdAt: todayIso(),
        status: 'draft',
      };

      const draftPath = resolve(DRAFTS_DIR, `${id}.json`);
      await writeFile(draftPath, JSON.stringify(draft, null, 2) + '\n', 'utf-8');
      drafts.push(draft);
      console.log(`  ✓ saved draft: ${id} (${topic.slug})`);
    } catch (e) {
      console.error(`  ✗ failed: ${topic.slug}: ${e.message}`);
    }

    await sleep(300);
  }

  const manifestPath = resolve(DRAFTS_DIR, '_latest.json');
  await writeFile(manifestPath, JSON.stringify(drafts.map(d => d.id), null, 2) + '\n', 'utf-8');

  console.log(`\nDone. ${drafts.length}/${topics.length} drafts generated.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
