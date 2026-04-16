import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '..', 'public', 'og-image.png');

const HTML = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500;700;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 1200px; height: 630px; }
    body {
      font-family: 'Noto Sans JP', system-ui, sans-serif;
      background: #FFFFFF;
      color: #0F172A;
      position: relative;
      overflow: hidden;
    }
    .accent-bar {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 10px;
      background: linear-gradient(90deg, #1D4ED8 0%, #2563EB 100%);
    }
    .container {
      position: absolute;
      inset: 0;
      padding: 90px 96px 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .brand {
      font-size: 28px;
      font-weight: 500;
      color: #94A3B8;
      letter-spacing: 0.18em;
      margin-bottom: 24px;
    }
    .title {
      font-size: 144px;
      font-weight: 800;
      color: #1D4ED8;
      letter-spacing: 0.02em;
      line-height: 1;
      margin-bottom: 36px;
    }
    .subtitle {
      font-size: 38px;
      font-weight: 700;
      color: #0F172A;
      line-height: 1.4;
      margin-bottom: 56px;
    }
    .badges {
      display: flex;
      gap: 16px;
    }
    .badge {
      padding: 14px 28px;
      border: 2px solid #1D4ED8;
      border-radius: 999px;
      font-size: 26px;
      font-weight: 700;
      color: #1D4ED8;
      background: #FFFFFF;
      letter-spacing: 0.02em;
    }
    .badge-icon { margin-right: 8px; }
    .corner-mark {
      position: absolute;
      bottom: 40px;
      right: 56px;
      font-size: 18px;
      color: #94A3B8;
      letter-spacing: 0.15em;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="accent-bar"></div>
  <div class="container">
    <div class="brand">SMAPLAN</div>
    <div class="title">スマプラン</div>
    <div class="subtitle">AIがあなたに最適な<br />スマホプランを無料診断</div>
    <div class="badges">
      <div class="badge"><span class="badge-icon">📱</span>9問で診断</div>
      <div class="badge"><span class="badge-icon">⚖️</span>全キャリア対応</div>
      <div class="badge"><span class="badge-icon">💰</span>無料</div>
    </div>
  </div>
  <div class="corner-mark">smaplan.com</div>
</body>
</html>`;

async function main() {
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
    await page.setContent(HTML, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await page.screenshot({ path: OUTPUT_PATH, type: 'png', omitBackground: false });
    console.log(`OG image written to ${OUTPUT_PATH}`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
