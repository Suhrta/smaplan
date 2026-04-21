import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRAFTS_DIR = resolve(ROOT, 'data', 'drafts');

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

async function main() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) throw new Error('DISCORD_WEBHOOK_URL is not set');

  const siteUrl = process.env.SITE_URL || 'https://smaplan.com';
  const approveToken = process.env.APPROVE_TOKEN;
  if (!approveToken) throw new Error('APPROVE_TOKEN is not set');

  const latestPath = resolve(DRAFTS_DIR, '_latest.json');
  if (!existsSync(latestPath)) {
    console.log('No _latest.json found. Nothing to notify.');
    return;
  }

  const draftIds = JSON.parse(await readFile(latestPath, 'utf-8'));
  if (!Array.isArray(draftIds) || draftIds.length === 0) {
    console.log('No drafts to notify.');
    return;
  }

  for (const id of draftIds) {
    const draftPath = resolve(DRAFTS_DIR, `${id}.json`);
    if (!existsSync(draftPath)) {
      console.warn(`Draft not found: ${id}`);
      continue;
    }

    const draft = JSON.parse(await readFile(draftPath, 'utf-8'));
    const preview = draft.content
      .replace(/#{1,3}\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/- /g, '')
      .replace(/\n+/g, ' ')
      .slice(0, 200);

    const approveUrl = `${siteUrl}/api/approve-draft?id=${id}&token=${approveToken}&action=approve`;
    const rejectUrl = `${siteUrl}/api/approve-draft?id=${id}&token=${approveToken}&action=reject`;

    const typeLabel = draft.type === 'kaisen' ? '🌐 回線' : '📱 スマホ';
    const categoryMap = {
      guide: '📖 ガイド',
      review: '⭐ レビュー',
      comparison: '⚖️ 比較',
      knowledge: '💡 知識',
    };

    const embed = {
      title: `📝 新規トレンド記事ドラフト`,
      color: 0x7c3aed,
      fields: [
        { name: '記事タイトル', value: draft.title, inline: false },
        { name: 'キーワード', value: draft.keyword, inline: true },
        { name: 'カテゴリ', value: `${typeLabel} / ${categoryMap[draft.category] || draft.category}`, inline: true },
        { name: 'トレンド理由', value: draft.reason || '—', inline: false },
        { name: 'プレビュー', value: preview + '…', inline: false },
        {
          name: 'アクション',
          value: `[✅ 承認して公開](${approveUrl})\n[❌ 却下](${rejectUrl})`,
          inline: false,
        },
      ],
      footer: { text: `Draft ID: ${id} | ${draft.createdAt}` },
    };

    const body = { embeds: [embed] };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Discord webhook failed for ${id}: ${res.status} ${text}`);
    } else {
      console.log(`✓ Notified Discord: ${draft.title} (${id})`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\nDone. Notified ${draftIds.length} draft(s).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
