import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '..', 'public', 'apple-icon.png');

const HTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 180px; height: 180px; }
    body {
      background: #1D4ED8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    }
    .s {
      color: #FFFFFF;
      font-weight: 900;
      font-size: 130px;
      line-height: 1;
      letter-spacing: -0.04em;
    }
  </style>
</head>
<body>
  <div class="s">S</div>
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
    await page.setViewport({ width: 180, height: 180, deviceScaleFactor: 1 });
    await page.setContent(HTML, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: OUTPUT_PATH, type: 'png', omitBackground: false });
    console.log(`apple-icon written to ${OUTPUT_PATH}`);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
