import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRAFTS_DIR = resolve(ROOT, 'data', 'drafts');
const TRENDING_PATH = resolve(ROOT, 'data', 'trending-topics.json');
const EXISTING_POSTS_PATH = resolve(ROOT, 'data', 'blog-posts.json');
const EXISTING_TOPICS_PATH = resolve(ROOT, 'data', 'blog-topics.json');

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

async function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(await readFile(path, 'utf-8'));
  } catch {
    return fallback;
  }
}

async function main() {
  const count = parseInt(process.argv[2] || '3', 10);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const existingPosts = await readJson(EXISTING_POSTS_PATH, []);
  const existingTopics = await readJson(EXISTING_TOPICS_PATH, []);
  const existingSlugs = [
    ...existingPosts.map(p => p.slug),
    ...existingTopics.map(t => t.slug),
  ];

  const client = new Anthropic({ apiKey });
  const today = new Date().toISOString().split('T')[0];

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `あなたは日本のスマートフォン料金・インターネット回線の専門家です。
${today}時点でトレンドになっている、またはユーザーの検索需要が高いと考えられるトピックを${count}件提案してください。

# 既存記事のスラッグ一覧（重複禁止）
${existingSlugs.join(', ')}

# 出力形式（JSONのみ、コードフェンスや説明文は不要）
[
  {
    "slug": "英語ハイフン区切り",
    "title": "日本語タイトル（30文字以内）",
    "keyword": "検索されやすいキーワード",
    "category": "guide|review|comparison|knowledge のいずれか",
    "type": "smaho|kaisen のいずれか",
    "reason": "なぜ今トレンドなのか（1文）"
  }
]

# ルール
- 既存スラッグと重複しないこと
- 2026年4月〜5月に検索需要が高そうなテーマを選ぶ
- スマホプラン見直し、格安SIM、光回線、ホームルーターなどの分野
- 季節要因（新生活、GW前、新料金プラン発表など）を加味する`,
      },
    ],
  });

  const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error('No JSON array in response');
  const topics = JSON.parse(text.slice(start, end + 1));

  if (!Array.isArray(topics) || topics.length === 0) {
    throw new Error('No topics generated');
  }

  for (const t of topics) {
    if (!t.slug || !t.title || !t.keyword || !t.category || !t.type) {
      throw new Error(`Invalid topic: ${JSON.stringify(t)}`);
    }
  }

  await mkdir(DRAFTS_DIR, { recursive: true });
  await writeFile(TRENDING_PATH, JSON.stringify(topics, null, 2) + '\n', 'utf-8');

  console.log(`Fetched ${topics.length} trending topics:`);
  for (const t of topics) {
    console.log(`  [${t.type}/${t.category}] ${t.slug} — ${t.title} (${t.keyword})`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
