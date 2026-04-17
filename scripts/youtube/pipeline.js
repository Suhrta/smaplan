import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

import { generateScript } from "./generate-script.js";
import { generateVoice } from "./generate-voice.js";
import { generateVideo } from "./generate-video.js";
import { generateThumbnail } from "./generate-thumbnail.js";

function makeTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function logError(message) {
  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  const logPath = path.join(outputDir, "error.log");
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`, "utf-8");
}

function selectTopic() {
  const topicsPath = path.join(__dirname, "short-topics.json");
  const data = JSON.parse(fs.readFileSync(topicsPath, "utf-8"));
  const available = data.topics
    .filter(t => !t.used)
    .sort((a, b) => a.priority - b.priority);

  if (available.length === 0) return null;
  return available[0];
}

function markTopicUsed(topicId) {
  const topicsPath = path.join(__dirname, "short-topics.json");
  const data = JSON.parse(fs.readFileSync(topicsPath, "utf-8"));
  const topic = data.topics.find(t => t.id === topicId);
  if (topic) {
    topic.used = true;
    topic.usedAt = new Date().toISOString();
  }
  fs.writeFileSync(topicsPath, JSON.stringify(data, null, 2), "utf-8");
}

async function main() {
  const startTime = Date.now();

  const separator = "\u2501".repeat(60);
  const thinSep = "\u2500".repeat(60);

  console.log(separator);
  console.log("  smaplan YouTube Shorts Pipeline");
  console.log(separator);

  const outputDir = path.join(__dirname, "output");
  if (fs.existsSync(outputDir)) {
    for (const file of fs.readdirSync(outputDir)) {
      const p = path.join(outputDir, file);
      if (fs.statSync(p).isDirectory()) {
        fs.rmSync(p, { recursive: true });
      } else if (["script.json", "video.mp4", "thumbnail.png"].includes(file)) {
        fs.unlinkSync(p);
      }
    }
  } else {
    fs.mkdirSync(outputDir);
  }

  // Step 0
  console.log("\n[STEP 0] Topic selection");
  const topic = selectTopic();
  if (!topic) {
    console.error("[ERROR] No available topics. Check short-topics.json.");
    process.exit(1);
  }
  console.log(`  ID: ${topic.id}`);
  console.log(`  Type: ${topic.type}`);
  console.log(`  Title: ${topic.title}`);
  console.log(`  Priority: ${topic.priority}`);

  let script;
  let voiceResult;

  // Step 1
  try {
    console.log("\n" + thinSep);
    console.log("[STEP 1] Script generation (Claude API)");
    console.log(thinSep);
    script = await generateScript(topic);
  } catch (e) {
    const msg = "Script generation failed: " + e.message;
    console.error("[ERROR] " + msg);
    logError(msg);
    process.exit(1);
  }

  // Step 2
  try {
    console.log("\n" + thinSep);
    console.log("[STEP 2] Voice generation (VOICEVOX)");
    console.log(thinSep);
    voiceResult = await generateVoice(script);
  } catch (e) {
    const msg = "Voice generation failed: " + e.message;
    console.error("[ERROR] " + msg);
    logError(msg);
    process.exit(1);
  }

  // Step 3
  try {
    console.log("\n" + thinSep);
    console.log("[STEP 3] Video generation (Puppeteer + ffmpeg)");
    console.log(thinSep);
    await generateVideo(script, voiceResult.timings);
  } catch (e) {
    const msg = "Video generation failed: " + e.message;
    console.error("[ERROR] " + msg);
    logError(msg);
    process.exit(1);
  }

  // Step 4
  try {
    console.log("\n" + thinSep);
    console.log("[STEP 4] Thumbnail generation (Puppeteer)");
    console.log(thinSep);
    await generateThumbnail(script);
  } catch (e) {
    const msg = "Thumbnail generation failed: " + e.message;
    console.error("[ERROR] " + msg);
    logError(msg);
    process.exit(1);
  }

  // Step 5: Rename output files
  const suffix = `_${topic.id}_${makeTimestamp()}`;
  const renames = [
    ["script.json", `script${suffix}.json`],
    ["video.mp4", `video${suffix}.mp4`],
    ["thumbnail.png", `thumbnail${suffix}.png`],
  ];
  for (const [from, to] of renames) {
    const src = path.join(outputDir, from);
    const dst = path.join(outputDir, to);
    if (fs.existsSync(src)) fs.renameSync(src, dst);
  }

  // Step 6
  markTopicUsed(topic.id);
  console.log("\n[STEP 6] Topic #" + topic.id + " marked as used");

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log("\n" + separator);
  console.log("  Done! (" + elapsed + "s)");
  console.log("  Topic: " + topic.title);
  console.log("  Script: " + path.join(outputDir, `script${suffix}.json`));
  console.log("  Video: " + path.join(outputDir, `video${suffix}.mp4`));
  console.log("  Thumbnail: " + path.join(outputDir, `thumbnail${suffix}.png`));
  console.log(separator);
}

main().catch(e => {
  const msg = "Pipeline error: " + e.message;
  console.error("\n[PIPELINE ERROR] " + msg);
  logError(msg);
  process.exit(1);
});
