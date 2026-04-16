import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const IMAGES_DIR = resolve(__dirname, '..', '..', 'public', 'blog');

const TEMPLATES = {
  comparison: {
    bg: 'linear-gradient(135deg, #1D4ED8 0%, #60A5FA 100%)',
    color: '#FFFFFF',
    badgeStyle: 'background: rgba(255,255,255,0.15); color: #FFFFFF; border: 2px solid rgba(255,255,255,0.45);',
    badgeText: 'COMPARISON',
    brandColor: '#FFFFFF',
    brandSColor: '#1D4ED8',
    brandSBg: '#FFFFFF',
  },
  review: {
    bg: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
    color: '#FFFFFF',
    badgeStyle: 'background: rgba(29, 78, 216, 0.18); color: #93C5FD; border: 2px solid #1D4ED8;',
    badgeText: 'REVIEW',
    brandColor: '#FFFFFF',
    brandSColor: '#FFFFFF',
    brandSBg: '#1D4ED8',
  },
  guide: {
    bg: 'linear-gradient(135deg, #EFF6FF 0%, #BFDBFE 100%)',
    color: '#0F172A',
    badgeStyle: 'background: #1D4ED8; color: #FFFFFF; border: 2px solid #1D4ED8;',
    badgeText: 'GUIDE',
    brandColor: '#1D4ED8',
    brandSColor: '#FFFFFF',
    brandSBg: '#1D4ED8',
  },
  knowledge: {
    bg: 'linear-gradient(135deg, #EFF6FF 0%, #BFDBFE 100%)',
    color: '#0F172A',
    badgeStyle: 'background: #1D4ED8; color: #FFFFFF; border: 2px solid #1D4ED8;',
    badgeText: 'KNOWLEDGE',
    brandColor: '#1D4ED8',
    brandSColor: '#FFFFFF',
    brandSBg: '#1D4ED8',
  },
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(title, category) {
  const t = TEMPLATES[category] || TEMPLATES.knowledge;
  const titleEsc = escapeHtml(title);
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500;700;800;900&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 1200px; height: 630px; }
    body {
      font-family: 'Noto Sans JP', system-ui, -apple-system, 'Segoe UI', sans-serif;
      background: ${t.bg};
      color: ${t.color};
      position: relative;
      overflow: hidden;
    }
    .container {
      position: absolute;
      inset: 0;
      padding: 88px 96px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .top { display: flex; align-items: center; }
    .badge {
      display: inline-block;
      padding: 10px 22px;
      border-radius: 999px;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.18em;
      ${t.badgeStyle}
    }
    .middle {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      padding: 40px 0;
    }
    .title {
      font-size: 64px;
      font-weight: 900;
      line-height: 1.32;
      letter-spacing: 0.01em;
      max-height: calc(64px * 1.32 * 4);
      overflow: hidden;
      word-break: auto-phrase;
      overflow-wrap: anywhere;
    }
    .title.long {
      font-size: 54px;
      max-height: calc(54px * 1.32 * 4);
    }
    .title.xlong {
      font-size: 46px;
      max-height: calc(46px * 1.32 * 5);
    }
    .bottom {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      color: ${t.brandColor};
    }
    .brand-s {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: ${t.brandSBg};
      color: ${t.brandSColor};
      font-weight: 900;
      font-size: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      letter-spacing: -0.04em;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .brand-name {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.04em;
    }
    .brand-url {
      font-size: 13px;
      font-weight: 500;
      opacity: 0.75;
      letter-spacing: 0.06em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="top">
      <span class="badge">${t.badgeText}</span>
    </div>
    <div class="middle">
      <div class="title ${titleEsc.length >= 36 ? 'xlong' : titleEsc.length >= 24 ? 'long' : ''}">${titleEsc}</div>
    </div>
    <div class="bottom">
      <div class="brand">
        <span class="brand-s">S</span>
        <span class="brand-text">
          <span class="brand-name">SmaPlan</span>
          <span class="brand-url">smaplan.com</span>
        </span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function generateHeaderImage({ browser, slug, title, category }) {
  await mkdir(IMAGES_DIR, { recursive: true });
  const outputPath = resolve(IMAGES_DIR, `${slug}.png`);
  const html = buildHtml(title, category);
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await page.screenshot({ path: outputPath, type: 'png', omitBackground: false });
  } finally {
    await page.close();
  }
  return outputPath;
}
