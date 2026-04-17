import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, "assets", "logos", "official");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const LOGOS = [
  {
    name: "ahamo",
    html: `
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#4DC8E8" /><circle cx="24" cy="24" r="10" fill="#fff" /></svg>
        <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:72px;font-weight:700;color:#4DC8E8;letter-spacing:-2px;">ahamo</span>
      </div>`,
  },
  {
    name: "povo",
    html: `
      <div style="display:inline-flex;align-items:center;gap:4px;">
        <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:76px;font-weight:800;color:#1A1A1A;letter-spacing:-1px;">povo</span>
        <svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,2 38,38 2,38" fill="#FFD700" /></svg>
      </div>`,
  },
  {
    name: "linemo",
    html: `
      <div style="display:inline-flex;align-items:center;gap:12px;">
        <svg width="52" height="52" viewBox="0 0 52 52"><rect rx="12" width="52" height="52" fill="#06C755"/><path d="M12 28c0-9 6-16 14-16s14 7 14 16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="20" cy="22" r="3" fill="#fff"/><circle cx="32" cy="22" r="3" fill="#fff"/></svg>
        <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:72px;font-weight:700;color:#06C755;letter-spacing:-1px;">LINEMO</span>
      </div>`,
  },
  {
    name: "rakuten",
    html: `
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <svg width="52" height="52" viewBox="0 0 52 52"><rect width="52" height="52" rx="10" fill="#BF0000"/><text x="26" y="38" text-anchor="middle" fill="#fff" font-size="36" font-weight="900" font-family="Arial">R</text></svg>
        <div style="display:flex;flex-direction:column;line-height:1.15;">
          <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:48px;font-weight:800;color:#BF0000;letter-spacing:-1px;">Rakuten</span>
          <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:32px;font-weight:700;color:#BF0000;letter-spacing:0px;">Mobile</span>
        </div>
      </div>`,
  },
  {
    name: "uqmobile",
    html: `
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <svg width="60" height="52" viewBox="0 0 60 52"><text x="0" y="42" fill="#E5006D" font-size="50" font-weight="900" font-family="Arial,sans-serif">UQ</text></svg>
        <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:42px;font-weight:700;color:#E5006D;letter-spacing:0px;">mobile</span>
      </div>`,
  },
  {
    name: "ymobile",
    html: `
      <div style="display:inline-flex;align-items:center;gap:6px;">
        <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:72px;font-weight:800;color:#E4002B;letter-spacing:-2px;">Y!mobile</span>
      </div>`,
  },
  {
    name: "iijmio",
    html: `
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <svg width="52" height="52" viewBox="0 0 52 52"><rect width="52" height="52" rx="8" fill="#D32F2F"/><text x="26" y="36" text-anchor="middle" fill="#fff" font-size="28" font-weight="900" font-family="Arial">IIJ</text></svg>
        <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:64px;font-weight:700;color:#D32F2F;letter-spacing:-1px;">IIJmio</span>
      </div>`,
  },
  {
    name: "mineo",
    html: `
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <svg width="52" height="52" viewBox="0 0 52 52"><rect width="52" height="52" rx="26" fill="#8DC63F"/><text x="26" y="36" text-anchor="middle" fill="#fff" font-size="28" font-weight="900" font-family="Arial">m</text></svg>
        <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:72px;font-weight:700;color:#8DC63F;letter-spacing:-1px;">mineo</span>
      </div>`,
  },
];

async function main() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const logo of LOGOS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 200, deviceScaleFactor: 2 });

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; }
  body { background: transparent; display: flex; align-items: center; justify-content: center; width: 800px; height: 200px; }
</style></head>
<body>${logo.html}</body></html>`;

    await page.setContent(html, { waitUntil: "networkidle0" });

    const el = await page.$("body > div");
    const box = await el.boundingBox();

    const padding = 8;
    const clip = {
      x: Math.max(0, box.x - padding),
      y: Math.max(0, box.y - padding),
      width: box.width + padding * 2,
      height: box.height + padding * 2,
    };

    const pngPath = path.join(outputDir, `${logo.name}.png`);
    await page.screenshot({
      path: pngPath,
      type: "png",
      omitBackground: true,
      clip,
    });

    await page.close();
    console.log(`[OK] ${logo.name}.png (${Math.round(clip.width)}x${Math.round(clip.height)})`);
  }

  await browser.close();
  console.log(`\nDone! ${LOGOS.length} logos saved to ${outputDir}`);
}

main().catch(e => {
  console.error("[ERROR]", e.message);
  process.exit(1);
});
