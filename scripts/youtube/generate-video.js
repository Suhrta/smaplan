import puppeteer from "puppeteer";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getAudioDuration(audioPath) {
  try {
    const result = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${audioPath.replace(/\\/g, "/")}"`,
      { encoding: "utf8" }
    );
    return parseFloat(result.trim());
  } catch {
    return 5;
  }
}

async function captureScene(browser, templatePath, sceneType, data, outputPath) {
  const template = fs.readFileSync(templatePath, "utf-8");
  const safeData = JSON.stringify(data).replace(/'/g, "\\'").replace(/\n/g, "\\n");
  const html = template
    .replace("'{{DATA}}'", `'${safeData}'`)
    .replace("{{SCENE_TYPE}}", sceneType);

  const tmpHtml = path.join(__dirname, `_scene_${sceneType}_${Date.now()}.html`);
  fs.writeFileSync(tmpHtml, html);

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(`file://${tmpHtml.replace(/\\/g, "/")}`, { waitUntil: "networkidle0" });
  await sleep(500);
  await page.screenshot({ path: outputPath, type: "png" });
  await page.close();
  fs.unlinkSync(tmpHtml);
}

function makeClip(imagePath, audioPath, outputPath) {
  const img = imagePath.replace(/\\/g, "/");
  const aud = audioPath.replace(/\\/g, "/");
  const out = outputPath.replace(/\\/g, "/");
  execSync(
    `ffmpeg -y -loop 1 -i "${img}" -i "${aud}" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${out}"`,
    { stdio: "pipe" }
  );
}

function generateSilence(durationSec, outputPath) {
  const out = outputPath.replace(/\\/g, "/");
  execSync(
    `ffmpeg -y -f lavfi -i anullsrc=r=24000:cl=mono -t ${durationSec} "${out}"`,
    { stdio: "pipe" }
  );
}

function parsePlanFromDisplay(displayText) {
  const priceMatch = displayText.match(/([\d,]+)\s*円/);
  const price = priceMatch ? priceMatch[1].replace(/,/g, "") : "";
  const planName = price
    ? displayText.replace(/([\d,]+)\s*円.*/, "").trim()
    : displayText;
  const gbMatch = displayText.match(/(\d+)\s*GB|無制限/);
  const dataGb = gbMatch ? gbMatch[0] : "";
  return { planName: planName || displayText, price, dataGb };
}

function extractFeatures(text) {
  const ICON_MAP = [
    { keywords: ["料金", "円", "月額", "税込", "割引", "安"], icon: "💰" },
    { keywords: ["通話", "かけ放題", "5分", "10分", "無料通話", "Rakuten Link"], icon: "📞" },
    { keywords: ["海外", "国", "地域", "ローミング"], icon: "🌏" },
    { keywords: ["速度", "Mbps", "kbps", "制限", "低速"], icon: "⚡" },
    { keywords: ["LINE", "ギガフリー", "カウントフリー"], icon: "💬" },
    { keywords: ["GB", "データ", "容量", "無制限", "段階"], icon: "📱" },
    { keywords: ["回線", "ドコモ", "au", "ソフトバンク", "楽天", "エリア"], icon: "📡" },
  ];

  const sentences = text
    .replace(/(?<![A-Za-z])！(?![A-Za-z])/g, "。")
    .replace(/(?<![A-Za-z])!(?![A-Za-z])/g, "。")
    .split(/[。、]/)
    .map(s => s.trim())
    .filter(s => s.length > 5 && s.length < 60);

  const features = [];
  const usedIcons = new Set();
  for (const s of sentences) {
    if (features.length >= 4) break;
    let icon = "✅";
    for (const m of ICON_MAP) {
      if (!usedIcons.has(m.icon) && m.keywords.some(k => s.includes(k))) {
        icon = m.icon;
        usedIcons.add(icon);
        break;
      }
    }
    features.push({ icon, text: s });
  }
  return features;
}

function parseVerdict(displayText) {
  const parts = displayText.split(/\s*[/／]\s*/);
  if (parts.length >= 2) {
    return { left: parts[0].trim(), right: parts[1].trim() };
  }
  const arrowParts = displayText.split(/→/);
  if (arrowParts.length >= 3) {
    const mid = Math.ceil(arrowParts.length / 2);
    return {
      left: arrowParts.slice(0, mid).join("→").trim(),
      right: arrowParts.slice(mid).join("→").trim(),
    };
  }
  return { left: displayText, right: "" };
}

function buildSceneData(section) {
  const dt = section.displayText || section.text || "";
  const base = { displayText: dt, text: section.text || "" };

  switch (section.type) {
    case "plan_a_name":
    case "plan_b_name":
    case "plan_a":
    case "plan_b": {
      const parsed = parsePlanFromDisplay(dt);
      return {
        ...base,
        planLabel: section.type.includes("plan_a") ? "Plan A" : "Plan B",
        planName: section.planName || parsed.planName || dt,
        price: section.price || parsed.price,
        dataGb: parsed.dataGb,
      };
    }
    case "plan_a_point":
    case "plan_b_point": {
      return {
        ...base,
        label: section.type.includes("plan_a") ? "Plan A の強み" : "Plan B の強み",
      };
    }
    case "rank1":
    case "rank2":
    case "rank3": {
      const rankNum = parseInt(section.type.slice(-1));
      const parsed = parsePlanFromDisplay(dt);
      return {
        ...base,
        rank: rankNum,
        planName: section.planName || parsed.planName || dt,
        price: section.price || parsed.price,
        dataGb: parsed.dataGb,
      };
    }
    case "rank1_name": {
      const parsed = parsePlanFromDisplay(dt);
      return {
        ...base,
        rank: 1,
        planName: section.planName || parsed.planName || dt,
        price: section.price || parsed.price,
        dataGb: parsed.dataGb,
      };
    }
    case "verdict": {
      const verdict = parseVerdict(dt);
      return { ...base, label: "結論", left: verdict.left, right: verdict.right };
    }
    case "opening":
    case "cta":
      return base;
    default:
      return { ...base, label: section.label || section.type };
  }
}

export async function generateVideo(script, voiceTimings) {
  console.log("[VIDEO] 動画生成開始");

  const outputDir = path.join(__dirname, "output");
  const framesDir = path.join(outputDir, "_frames");
  if (fs.existsSync(framesDir)) fs.rmSync(framesDir, { recursive: true });
  fs.mkdirSync(framesDir, { recursive: true });

  const templatePath = path.join(__dirname, "assets", "scene-template.html");
  const audioDir = path.join(outputDir, "audio");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const clips = [];
  const sections = script.sections;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const imgPath = path.join(framesDir, `scene_${i}.png`);
    const clipPath = path.join(framesDir, `clip_${i}.mp4`);

    console.log(`  [${i + 1}/${sections.length}] ${section.type}`);

    const sceneData = buildSceneData(section);
    await captureScene(browser, templatePath, section.type, sceneData, imgPath);

    const sectionAudioPath = path.join(audioDir, `section_${String(i).padStart(3, "0")}.wav`);
    const silenceAudioPath = path.join(framesDir, `silence_${i}.wav`);

    if (fs.existsSync(sectionAudioPath)) {
      const silenceAfter = path.join(audioDir, `silence_${String(i).padStart(3, "0")}.wav`);
      if (fs.existsSync(silenceAfter)) {
        const combinedAudioPath = path.join(framesDir, `audio_${i}.wav`);
        const concatFile = path.join(framesDir, `audio_concat_${i}.txt`);
        fs.writeFileSync(concatFile, [
          `file '${sectionAudioPath.replace(/\\/g, "/")}'`,
          `file '${silenceAfter.replace(/\\/g, "/")}'`,
        ].join("\n"));
        execSync(
          `ffmpeg -y -f concat -safe 0 -i "${concatFile.replace(/\\/g, "/")}" -c copy "${combinedAudioPath.replace(/\\/g, "/")}"`,
          { stdio: "pipe" }
        );
        makeClip(imgPath, combinedAudioPath, clipPath);
      } else {
        makeClip(imgPath, sectionAudioPath, clipPath);
      }
    } else {
      const duration = section.duration || 5;
      generateSilence(duration, silenceAudioPath);
      makeClip(imgPath, silenceAudioPath, clipPath);
    }

    clips.push(clipPath);
  }

  await browser.close();

  console.log("[VIDEO] クリップ結合中...");
  const concatList = path.join(framesDir, "concat.txt");
  fs.writeFileSync(
    concatList,
    clips.map(c => `file '${c.replace(/\\/g, "/")}'`).join("\n")
  );

  const videoPath = path.join(outputDir, "video.mp4");
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${concatList.replace(/\\/g, "/")}" -c copy "${videoPath.replace(/\\/g, "/")}"`,
    { stdio: "pipe" }
  );

  fs.rmSync(framesDir, { recursive: true });

  const sizeMB = (fs.statSync(videoPath).size / 1024 / 1024).toFixed(1);
  console.log(`[VIDEO] 完了: ${videoPath} (${sizeMB}MB)`);

  return videoPath;
}

if (process.argv[1] && process.argv[1].includes("generate-video")) {
  const scriptPath = path.join(__dirname, "output", "script.json");
  if (!fs.existsSync(scriptPath)) {
    console.error("[ERROR] output/script.json が見つかりません");
    process.exit(1);
  }
  const script = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));
  generateVideo(script, null).catch(e => {
    console.error("[ERROR]", e.message);
    process.exit(1);
  });
}
