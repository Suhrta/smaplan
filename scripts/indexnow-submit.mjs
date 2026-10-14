// IndexNow（Bing / Yandex 等）へURLの更新を通知する。
// 流入の大半が Bing のため、料金更新・ページ追加の後に実行する。
//
// 使い方:
//   node scripts/indexnow-submit.mjs                 # 本番 sitemap.xml の全URLを送信
//   node scripts/indexnow-submit.mjs /carriers /carrier/ahamo_30gb   # 指定URLだけ送信
//   node scripts/indexnow-submit.mjs --dry-run       # 送信せず対象URLを表示
//
// 鍵ファイル public/<KEY>.txt がデプロイ済みであること（https://smaplan.com/<KEY>.txt で鍵が返る）が前提。

const HOST = 'smaplan.com';
const BASE = `https://${HOST}`;
const KEY = '196e928d3c63db19feed5305b307b218';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 10000; // IndexNow の1リクエスト上限

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const paths = args.filter(a => !a.startsWith('--'));

async function urlsFromSitemap() {
  const res = await fetch(`${BASE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml の取得に失敗: ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
}

async function main() {
  const urlList = paths.length > 0
    ? paths.map(p => (p.startsWith('http') ? p : `${BASE}${p.startsWith('/') ? '' : '/'}${p}`))
    : await urlsFromSitemap();

  if (urlList.length === 0) throw new Error('送信対象のURLがありません');
  if (urlList.length > MAX_URLS) throw new Error(`URLが多すぎます（${urlList.length}件 > ${MAX_URLS}件）`);

  console.log(`対象URL: ${urlList.length}件`);
  if (dryRun) {
    for (const u of urlList) console.log(`  ${u}`);
    return;
  }

  const keyRes = await fetch(`${BASE}/${KEY}.txt`);
  const keyBody = keyRes.ok ? (await keyRes.text()).trim() : '';
  if (keyBody !== KEY) {
    throw new Error(`鍵ファイルが本番で確認できません（${BASE}/${KEY}.txt）。デプロイ後に実行してください`);
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${BASE}/${KEY}.txt`, urlList }),
  });
  // 200: 受理 / 202: 受理（鍵の検証待ち）。それ以外は失敗
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow 送信失敗: ${res.status} ${await res.text()}`);
  }
  console.log(`送信完了: HTTP ${res.status}`);
}

main().catch(e => {
  console.error(e.message);
  process.exit(1);
});
