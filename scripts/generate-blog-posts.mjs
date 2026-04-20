import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import puppeteer from 'puppeteer';
import { generateHeaderImage } from './lib/blog-image.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOPICS_PATH = resolve(ROOT, 'data', 'blog-topics.json');
const POSTS_PATH = resolve(ROOT, 'data', 'blog-posts.json');
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
    const v = vRaw.replace(/^['"]|['"]$/g, '');
    process.env[k] = v;
  }
}
loadEnv(resolve(ROOT, '.env.local'));
loadEnv(resolve(ROOT, '.env'));

const MODEL = 'claude-sonnet-4-6';
const SLEEP_MS = 300;
const MAX_RETRY = 1;

function parseArgs(argv) {
  const args = { count: 2, image: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--count') {
      const v = parseInt(argv[++i], 10);
      if (!Number.isFinite(v) || v < 0) throw new Error(`invalid --count: ${argv[i]}`);
      args.count = v;
    } else if (a === '--no-image') {
      args.image = false;
    }
  }
  return args;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function todayIso() {
  return new Date().toISOString().split('T')[0];
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
- 比較項目（料金/速度/特徴/向き不向き）を整理して順に解説
- 一方を過剰に褒めず、それぞれが向く人物像を明示する
- 数値の差は具体的な金額で示す（例: 月額1,200円差→年間14,400円差）`,
  review: `# 記事タイプ: レビュー記事
- 「使ってみると〜」「実際の使用感では〜」といった体験談トーンで書く
- メリットとデメリットを並列に挙げる
- 良い面だけでなく、不便な点・ハマりやすい落とし穴も具体的に書く
- 「向いている人」「向いていない人」を最後に明示する`,
  guide: `# 記事タイプ: ガイド記事
- 手順は番号付きまたは見出し付きで順を追って解説
- 各ステップで「なにを準備するか」「なにに注意するか」を具体化
- つまずきポイント・よくある失敗例を必ず1セクション含める
- 読者が記事を読み終わったらすぐ行動できるレベルまで落とす`,
  knowledge: `# 記事タイプ: 知識・解説記事
- 用語をはじめて聞く読者にも分かるよう、前提知識ゼロで書く
- 抽象的な説明だけでなく、具体例で理解を補強する
- 「なぜそうなのか」の背景・理由まで踏み込む
- 似た概念との違い・誤解されやすいポイントを明示する`,
};

function buildPrompt(topic, plansContext) {
  const tone = TONE_INSTRUCTIONS[topic.category] || TONE_INSTRUCTIONS.knowledge;
  const isKaisen = topic.type === 'kaisen';
  const writerRole = isKaisen
    ? 'あなたは日本のインターネット回線事情に詳しいライターです。'
    : 'あなたは日本のスマートフォン料金事情に詳しいライターです。';
  const planLabel = isKaisen
    ? '主要光回線・ホームルーター一覧'
    : '主要スマホプラン一覧';
  return `${writerRole}以下のテーマでSEO記事を書いてください。

# 参考: 2026年4月時点の${planLabel}（料金引用時はこのデータを使う）
${plansContext}

# 記事情報
- タイトル: ${topic.title}
- スラッグ: ${topic.slug}

${tone}

# 出力形式（必ずこのJSON形式のみで返答、前後に説明文・コードフェンスは不要）
{
  "description": "meta description（120文字程度・検索結果でクリックされやすい文章）",
  "content": "マークダウン形式の記事本文"
}

# 本文ルール
- 文字数: 2000〜3000文字（厳守）
- 構成: 導入文（150文字程度）→ ## 見出し でセクション3〜5個 → ## まとめ
- セクションのうち1つは必ず「よくある誤解」または「意外な落とし穴」を含む独自視点のセクションにする
- 使用可能マークダウン記法のみ:
  - ## 見出し2
  - ### 見出し3
  - 段落（空行で区切り）
  - - 箇条書き（行頭にハイフン+半角スペース）
  - **太字**（強調用）
- 表・画像・リンク・コードブロックは使わない
- タイトル（# h1）は本文に含めない（ページ側で出すため）
- 中立的なトーン。特定キャリアの過度な称賛・批判は避ける
- 具体的な数値（料金・GB・割引額）を必ず複数含める。料金は上記プラン一覧の数値を使う
- 推測や根拠不明な数字は書かない。曖昧な場合は「目安」「程度」と明示
- 最後の「## まとめ」セクションで内容を端的に振り返る（CTAは書かない。ページ側で挿入する）
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
      const text = msg.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n');
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

async function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(await readFile(path, 'utf-8'));
  } catch {
    return fallback;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const topics = await readJson(TOPICS_PATH, []);
  if (!Array.isArray(topics) || topics.length === 0) {
    throw new Error(`no topics found at ${TOPICS_PATH}`);
  }
  const plans = await readJson(PLANS_PATH, []);
  if (!Array.isArray(plans) || plans.length === 0) {
    throw new Error(`no plans found at ${PLANS_PATH}`);
  }
  const smahoPlansContext = buildPlansContext(plans);

  const kaisenPlans = await readJson(KAISEN_PLANS_PATH, []);
  if (!Array.isArray(kaisenPlans) || kaisenPlans.length === 0) {
    throw new Error(`no kaisen plans found at ${KAISEN_PLANS_PATH}`);
  }
  const kaisenPlansContext = buildKaisenPlansContext(kaisenPlans);

  const posts = await readJson(POSTS_PATH, []);
  if (!Array.isArray(posts)) {
    throw new Error(`blog-posts.json is not an array`);
  }

  const sortByPriority = (arr) => arr.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.originalIndex - b.originalIndex;
  });

  const allPending = topics
    .map((t, originalIndex) => ({ ...t, originalIndex }))
    .filter(t => !t.generated);

  const smahoPending = sortByPriority(allPending.filter(t => t.type !== 'kaisen'));
  const kaisenPending = sortByPriority(allPending.filter(t => t.type === 'kaisen'));

  if (args.count === 0) {
    console.log(`Pending topics: ${allPending.length} (smaho: ${smahoPending.length}, kaisen: ${kaisenPending.length})`);
    for (const t of allPending.slice(0, 10)) {
      console.log(`  [p${t.priority}/${t.type}] ${t.slug} (${t.category}) — ${t.title}`);
    }
    return;
  }

  // Alternate smaho/kaisen picks
  const target = [];
  let si = 0, ki = 0;
  let nextType = 'smaho';
  while (target.length < args.count) {
    if (nextType === 'smaho' && si < smahoPending.length) {
      target.push(smahoPending[si++]);
      nextType = 'kaisen';
    } else if (nextType === 'kaisen' && ki < kaisenPending.length) {
      target.push(kaisenPending[ki++]);
      nextType = 'smaho';
    } else if (si < smahoPending.length) {
      target.push(smahoPending[si++]);
    } else if (ki < kaisenPending.length) {
      target.push(kaisenPending[ki++]);
    } else {
      break;
    }
  }
  if (target.length === 0) {
    console.log('No pending topics. All generated.');
    return;
  }

  const client = new Anthropic({ apiKey });
  console.log(`Generating ${target.length} post(s) (count=${args.count}, available=${pending.length}, image=${args.image})`);

  let browser = null;
  if (args.image) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  try {
    for (const topic of target) {
      const topicType = topic.type || 'smaho';
      const ctx = topicType === 'kaisen' ? kaisenPlansContext : smahoPlansContext;
      console.log(`\ngenerating [p${topic.priority}/${topicType}/${topic.category}] ${topic.slug} (${topic.title})...`);
      const { description, content } = await generateOne(client, topic, ctx);
      const post = {
        slug: topic.slug,
        title: topic.title,
        description,
        category: topic.category,
        type: topicType,
        publishedAt: todayIso(),
        content,
      };
      posts.push(post);
      await mkdir(dirname(POSTS_PATH), { recursive: true });
      await writeFile(POSTS_PATH, JSON.stringify(posts, null, 2) + '\n', 'utf-8');

      if (browser) {
        await generateHeaderImage({
          browser,
          slug: topic.slug,
          title: topic.title,
          category: topic.category,
        });
        console.log(`  ✓ image: public/blog/${topic.slug}.png`);
      }

      topics[topic.originalIndex] = {
        ...topics[topic.originalIndex],
        generated: true,
      };
      await writeFile(TOPICS_PATH, JSON.stringify(topics, null, 2) + '\n', 'utf-8');

      console.log(`  ✓ wrote ${topic.slug}`);
      await sleep(SLEEP_MS);
    }
  } finally {
    if (browser) await browser.close();
  }

  console.log(`\nDone. ${target.length} post(s) generated. Total posts: ${posts.length}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
