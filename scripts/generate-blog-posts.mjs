import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT_PATH = resolve(ROOT, 'data', 'blog-posts.json');

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
const PUBLISHED_AT = '2026-04-17';

const force = process.argv.includes('--force');

const THEMES = [
  {
    slug: 'save-money',
    title: 'スマホ料金を節約する5つの方法【2026年最新】',
    description: 'スマホ料金が高いと感じている方へ。プラン見直し・格安SIM乗り換え・割引活用など、今すぐ実践できる節約術5つを2026年最新情報で解説します。',
    angle: '主要キャリアの料金水準と、誰でも実践できる5つの節約手段（プラン見直し、データ容量の最適化、家族割やセット割の活用、格安SIM/サブブランドへの乗り換え、不要オプションの解約）を順に紹介する。各方法ごとに「いくら節約できるか」の目安を示す。',
  },
  {
    slug: 'how-to-switch',
    title: '格安SIMへの乗り換え手順を完全解説【初心者向け】',
    description: '格安SIMへの乗り換え方法を初心者向けにわかりやすく解説。MNP予約番号の取得から開通までの全ステップ、注意点、必要な持ち物まで2026年最新情報でまとめます。',
    angle: '乗り換え前の準備（SIMロック解除確認、対応バンド確認、メアド対策）→MNP予約番号取得（マイページ/電話/最近はワンストップ方式）→申し込み→SIM到着・開通設定→旧回線解約までを時系列で解説。よくある失敗例と対処法も。',
  },
  {
    slug: 'average-cost',
    title: 'スマホ代の平均はいくら？年代別の料金相場を解説',
    description: '日本人のスマホ代の平均は月いくら？20代/30代/40代/50代/60代の年代別相場、大手キャリア利用者と格安SIM利用者の差、世帯あたりの通信費まで2026年データで解説。',
    angle: '総務省統計や業界調査をベースに、全体平均（おおよそ月7,000〜8,000円）を提示。年代別・キャリア別で差が出る理由、自分の料金が「高い／適正／安い」のどれに当たるか判断する基準を示す。',
  },
  {
    slug: 'carrier-comparison',
    title: '大手キャリアvs格安SIM 料金・速度・サポートを徹底比較',
    description: '大手キャリア（ドコモ・au・ソフトバンク）と格安SIMを料金・通信速度・サポート体制・付帯サービスの4軸で比較。あなたに向いているのはどちらか判断できる比較記事。',
    angle: '料金（月額3〜4倍の差）、速度（混雑時間帯の差・実測値の傾向）、サポート（店舗の有無・対応時間）、付帯サービス（キャリアメール・キャリア決済・割引）を表形式で比較し、それぞれが向く人物像を示す。',
  },
  {
    slug: 'docomo-expensive',
    title: 'ドコモの料金が高いと感じたら？見直しポイント5選',
    description: 'ドコモの月額料金が高いと感じたら、まず確認すべき5つの見直しポイントを解説。プラン変更・割引適用漏れ・ahamoへの移行など、ドコモ内で安くする方法もまとめます。',
    angle: 'ドコモ利用者向けに、(1)現プランとデータ使用量のミスマッチ、(2)家族割・ahamoバンドル・dカードお支払割など割引適用漏れ、(3)不要オプション、(4)ahamo/irumoへの移行、(5)他社（楽天・サブブランド・MVNO）への乗り換え検討を順に解説。',
  },
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function buildPrompt(theme) {
  return `あなたは日本のスマートフォン料金事情に詳しいライターです。以下のテーマでSEO記事を書いてください。

# 記事情報
- タイトル: ${theme.title}
- meta description: ${theme.description}
- 内容の方針: ${theme.angle}

# 出力形式（必ずこのJSON形式のみで返答、前後に説明文・コードフェンスは不要）
{
  "content": "マークダウン形式の記事本文"
}

# 本文ルール
- 文字数: 2000〜3000文字（厳守）
- 構成: 導入文（150文字程度）→ ## 見出し でセクション3〜5個 → ## まとめ
- 使用可能マークダウン記法のみ:
  - ## 見出し2
  - ### 見出し3
  - 段落（空行で区切り）
  - - 箇条書き（行頭にハイフン+半角スペース）
  - **太字**（強調用）
- 表・画像・リンク・コードブロックは使わない
- タイトル（# h1）は本文に含めない（ページ側で出すため）
- 中立的なトーン。特定キャリアの過度な称賛・批判は避け、事実とメリット/デメリットを並列で書く
- 具体的な数値（料金・GB・割引額の目安）を盛り込む
- 推測や根拠不明な数字は書かない。「〜程度」「目安」など曖昧な表現で逃げる場合は明示
- 最後の「## まとめ」セクションで内容を端的に振り返る（CTAは書かない。ページ側で挿入する）
- 2026年4月時点の情報として記述`;
}

function validate(obj) {
  if (!obj || typeof obj !== 'object') return 'not an object';
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

async function generateOne(client, theme) {
  let lastErr = null;
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    try {
      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        messages: [{ role: 'user', content: buildPrompt(theme) }],
      });
      const text = msg.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n');
      const parsed = extractJson(text);
      const err = validate(parsed);
      if (err) throw new Error(`schema: ${err}`);
      return parsed.content;
    } catch (e) {
      lastErr = e;
      console.warn(`  [retry ${attempt + 1}] ${theme.slug}: ${e.message}`);
    }
  }
  throw lastErr;
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  let existing = [];
  if (existsSync(OUTPUT_PATH)) {
    try {
      existing = JSON.parse(await readFile(OUTPUT_PATH, 'utf-8'));
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }
  }
  const existingMap = new Map(existing.map(p => [p.slug, p]));

  const client = new Anthropic({ apiKey });
  const result = [];

  for (const theme of THEMES) {
    if (!force && existingMap.has(theme.slug)) {
      console.log(`skip ${theme.slug} (already exists)`);
      result.push(existingMap.get(theme.slug));
      continue;
    }
    console.log(`generating ${theme.slug} (${theme.title})...`);
    const content = await generateOne(client, theme);
    const post = {
      slug: theme.slug,
      title: theme.title,
      description: theme.description,
      publishedAt: PUBLISHED_AT,
      content,
    };
    result.push(post);
    await mkdir(dirname(OUTPUT_PATH), { recursive: true });
    await writeFile(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf-8');
    await sleep(SLEEP_MS);
  }

  console.log(`\nDone. Wrote ${result.length} posts to ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
