import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export async function generateThumbnail(script) {
  console.log("[THUMBNAIL] サムネイル生成開始");

  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const templatePath = path.join(__dirname, "assets", "thumbnail-template.html");
  const template = fs.readFileSync(templatePath, "utf-8");

  const thumbnailText = script.thumbnailText || script.title || "スマプラン";
  const html = template.replace("{{THUMBNAIL_TEXT}}", thumbnailText);

  const tmpHtml = path.join(__dirname, `_thumbnail_${Date.now()}.html`);
  fs.writeFileSync(tmpHtml, html);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto(`file://${tmpHtml.replace(/\\/g, "/")}`, { waitUntil: "networkidle0" });
  await sleep(500);

  const outputPath = path.join(outputDir, "thumbnail.png");
  await page.screenshot({ path: outputPath, type: "png" });

  await page.close();
  await browser.close();
  fs.unlinkSync(tmpHtml);

  console.log(`[THUMBNAIL] 完了: ${outputPath}`);
  return outputPath;
}

if (process.argv[1] && process.argv[1].includes("generate-thumbnail")) {
  const scriptPath = path.join(__dirname, "output", "script.json");
  if (!fs.existsSync(scriptPath)) {
    console.error("[ERROR] output/script.json が見つかりません");
    process.exit(1);
  }
  const script = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));
  generateThumbnail(script).catch(e => {
    console.error("[ERROR]", e.message);
    process.exit(1);
  });
}
