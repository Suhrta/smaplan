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
import { uploadShort } from "./upload-short.js";

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

  console.log("━".repeat(60));
  console.log("  スマプラン YouTubeショート 自動生成パイプライ��");
  console.log("━".repeat(60));

  // 出力ディレクトリ初期��
  const outputDir = path.join(__dirname, "output");
  if (fs.existsSync(outputDir)) {
    for (const file of fs.readdirSync(outputDir)) {
      const p = path.join(outputDir, file);
      if (fs.statSync(p).isDirectory()) {
        fs.rmSync(p, { recursive: true });
      } else if (file !== "error.log") {
        fs.unlinkSync(p);
      }
    }
  } else {
    fs.mkdirSync(outputDir);
  }

  // Step 0: トピック選択
  console.log("\n[STEP 0] トピック選択");
  const topic = selectTopic();
  if (!topic) {
    console.error("[ERROR] 使用可能なトピックがありません。short-topics.json を確認してくだ���い。");
    process.exit(1);
  }
  console.log(`  ID: ${topic.id}`);
  console.log(`  種類: ${topic.type}`);
  console.log(`  タイ���ル: ${topic.title}`);
  console.log(`  優先度: ${topic.priority}`);

  let script;
  let voiceResult;

  // Step 1: 台本生成
  try {
    console.log(`\n${"─".repeat(60)}`);
    console.log("[STEP 1] 台本生成（Claude API）");
    console.log("─".repeat(60));
    script = await generateScript(topic);
  } catch (e) {
    const msg = `台本生成失敗: ${e.message}`;
    console.error(`[ERROR] ${msg}`);
    logError(msg);
    process.exit(1);
  }

  // Step 2: 音声生成
  try {
    console.log(`\n${"─".repeat(60)}`);
    console.log("[STEP 2] 音声生成（VOICEVOX）");
    console.log("─".repeat(60));
    voiceResult = await generateVoice(script);
  } catch (e) {
    const msg = `音声生���失敗: ${e.message}`;
    console.error(`[ERROR] ${msg}`);
    logError(msg);
    process.exit(1);
  }

  // Step 3: 動画合成
  try {
    console.log(`\n${"─".repeat(60)}`);
    console.log("[STEP 3] 動画合成（Puppeteer + ffmpeg）");
    console.log("─".repeat(60));
    await generateVideo(script, voiceResult.timings);
  } catch (e) {
    const msg = `動画合成失敗: ${e.message}`;
    console.error(`[ERROR] ${msg}`);
    logError(msg);
    process.exit(1);
  }

  // Step 4: サムネイル生成
  try {
    console.log(`\n${"─".repeat(60)}`);
    console.log("[STEP 4] サムネイル生成（Puppeteer）");
    console.log("─".repeat(60));
    await generateThumbnail(script);
  } catch (e) {
    const msg = `サムネイ���生成失敗: ${e.message}`;
    console.error(`[ERROR] ${msg}`);
    logError(msg);
    process.exit(1);
  }

  // Step 5: YouTubeアップロード
  try {
    console.log(`\n${"─".repeat(60)}`);
    console.log("[STEP 5] YouTubeアップロード");
    console.log("��".repeat(60));
    await uploadShort(script);
  } catch (e) {
    const msg = `アップロード失敗: ${e.message}`;
    console.error(`[ERROR] ${msg}`);
    logError(msg);
    process.exit(1);
  }

  // Step 6: トピック更新
  markTopicUsed(topic.id);
  console.log(`\n[STEP 6] トピック #${topic.id} を使用済みに更新`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log("\n" + "━".repeat(60));
  console.log(`  完了！ (${elapsed}秒)`);
  console.log(`  トピック: ${topic.title}`);
  console.log(`  出力: output/ フォルダを確認してください`);
  console.log("━".repeat(60));
}

main().catch(e => {
  const msg = `パイプライ��エラー: ${e.message}`;
  console.error(`\n[PIPELINE ERROR] ${msg}`);
  logError(msg);
  process.exit(1);
});
