import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PLANS_PATH = resolve(ROOT, 'data', 'plans.json');
const OUTPUT_PATH = resolve(ROOT, 'data', 'carrier-contents.json');

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

const force = process.argv.includes('--force');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function buildPrompt(plan) {
  return `あなたはスマートフォン料金プランに詳しいライターです。以下のプラン情報をもとに、読者が判断しやすいよう具体的かつ中立的な記事コンテンツをJSONで出力してください。

# プラン情報
- プラン名: ${plan.plan_name}
- キャリア: ${plan.carrier}（${plan.carrier_parent}）
- 月額料金: ${plan.monthly_cost.toLocaleString()}円${plan.monthly_cost_min_with_discounts ? `（各種割引適用で最安${plan.monthly_cost_min_with_discounts.toLocaleString()}円）` : ''}
- データ容量: ${plan.data_gb === 999 ? '無制限' : `${plan.data_gb}GB`}
- 超過時の速度: ${plan.data_exceeded_speed}
- 通話: ${plan.call_included}
- かけ放題オプション: ${plan.call_unlimited_option ? `${plan.call_unlimited_option.toLocaleString()}円` : 'なし'}
- 回線: ${plan.network}
- 家族割: ${plan.family_discount ? 'あり' : 'なし'}
- セット割: ${plan.bundle_discount ? 'あり' : 'なし'}
- 特徴: ${plan.features.join(' / ')}
- 想定ターゲット: ${plan.target}

# 出力形式（必ずこのJSON形式のみで返答、前後に説明文は不要）
{
  "merits": ["メリット1（80〜120文字）", "メリット2（80〜120文字）", "メリット3（80〜120文字）", "メリット4（80〜120文字）"],
  "demerits": ["デメリット1（80〜120文字）", "デメリット2（80〜120文字）", "デメリット3（80〜120文字）"],
  "recommended_for": ["こんな人におすすめ1（1行・40文字以内）", "こんな人におすすめ2（1行・40文字以内）", "こんな人におすすめ3（1行・40文字以内）"],
  "summary": "プランの一言まとめ（100文字程度）"
}

# ルール
- メリット・デメリットは具体的な数値・競合比較・実使用シーンを盛り込む
- プラン情報から確実に読み取れる事実のみ書く。推測や誇張は避ける
- 広告臭を避け、中立的なトーンで
- "recommended_for"は短く端的に
- 文字数の指示は厳守（短すぎ・長すぎはNG）`;
}

function validate(obj) {
  if (!obj || typeof obj !== 'object') return 'not an object';
  if (!Array.isArray(obj.merits) || obj.merits.length !== 4) return 'merits must be array of 4';
  if (!obj.merits.every(s => typeof s === 'string' && s.length > 0)) return 'merits items invalid';
  if (!Array.isArray(obj.demerits) || obj.demerits.length !== 3) return 'demerits must be array of 3';
  if (!obj.demerits.every(s => typeof s === 'string' && s.length > 0)) return 'demerits items invalid';
  if (!Array.isArray(obj.recommended_for) || obj.recommended_for.length !== 3) return 'recommended_for must be array of 3';
  if (!obj.recommended_for.every(s => typeof s === 'string' && s.length > 0)) return 'recommended_for items invalid';
  if (typeof obj.summary !== 'string' || obj.summary.length === 0) return 'summary invalid';
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

async function generateOne(client, plan) {
  let lastErr = null;
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    try {
      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        messages: [{ role: 'user', content: buildPrompt(plan) }],
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
      console.warn(`  [retry ${attempt + 1}] ${plan.id}: ${e.message}`);
    }
  }
  throw lastErr;
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const plans = JSON.parse(await readFile(PLANS_PATH, 'utf-8'));

  let existing = {};
  if (existsSync(OUTPUT_PATH)) {
    try {
      existing = JSON.parse(await readFile(OUTPUT_PATH, 'utf-8'));
    } catch {
      existing = {};
    }
  }

  const client = new Anthropic({ apiKey });
  const result = { ...existing };

  for (const plan of plans) {
    if (!force && result[plan.id]) {
      console.log(`skip ${plan.id} (already exists)`);
      continue;
    }
    console.log(`generating ${plan.id} (${plan.plan_name})...`);
    const content = await generateOne(client, plan);
    result[plan.id] = content;
    await mkdir(dirname(OUTPUT_PATH), { recursive: true });
    await writeFile(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf-8');
    await sleep(SLEEP_MS);
  }

  console.log(`\nDone. Wrote ${Object.keys(result).length} entries to ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
