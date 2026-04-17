import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const VOICEVOX_URL = process.env.VOICEVOX_URL || "http://localhost:50021";
const SPEAKER_ID = 3;
const SPEED_SCALE = 1.3;

const READING_MAP = {
  'LINEMO': 'ラインモ',
  'linemo': 'ラインモ',
  'ahamo': 'アハモ',
  'povo': 'ポヴォ',
  'IIJmio': 'アイアイジェイミオ',
  'mineo': 'マイネオ',
  'UQ mobile': 'ユーキューモバイル',
  'UQモバイル': 'ユーキューモバイル',
  'Y!mobile': 'ワイモバイル',
  'NURO': 'ニューロ',
  'LIBMO': 'リブモ',
  'J:COM': 'ジェイコム',
  'eximo': 'エクシモ',
  'irumo': 'イルモ',
};

function applyReadingMap(text) {
  let result = text;
  for (const [key, val] of Object.entries(READING_MAP)) {
    result = result.replaceAll(key, val);
  }
  return result;
}

async function checkVoicevox() {
  try {
    const res = await fetch(`${VOICEVOX_URL}/version`);
    const version = await res.text();
    console.log(`[VOICEVOX] 接続OK (version: ${version.trim()})`);
    return true;
  } catch {
    console.error(`[ERROR] VOICEVOXに接続できません: ${VOICEVOX_URL}`);
    console.error("  VOICEVOXを起動してから再実行してください");
    return false;
  }
}

async function synthesize(text, outputPath) {
  const queryRes = await fetch(
    `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${SPEAKER_ID}`,
    { method: "POST" }
  );
  if (!queryRes.ok) throw new Error(`audio_query失敗: ${queryRes.status}`);
  const query = await queryRes.json();
  query.speedScale = SPEED_SCALE;

  const synthRes = await fetch(
    `${VOICEVOX_URL}/synthesis?speaker=${SPEAKER_ID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    }
  );
  if (!synthRes.ok) throw new Error(`synthesis失敗: ${synthRes.status}`);

  const buffer = await synthRes.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));

  const wavBuffer = Buffer.from(buffer);
  const dataSize = wavBuffer.readUInt32LE(40);
  const byteRate = wavBuffer.readUInt32LE(28);
  return dataSize / byteRate;
}

function createSilentWav(outputPath, durationSec = 0.5) {
  const sampleRate = 24000;
  const numSamples = Math.floor(sampleRate * durationSec);
  const byteRate = sampleRate * 2;
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize, 0);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  fs.writeFileSync(outputPath, buf);
}

export async function generateVoice(script) {
  if (!(await checkVoicevox())) {
    throw new Error("VOICEVOX未起動");
  }

  const outputDir = path.join(__dirname, "output");
  const audioDir = path.join(outputDir, "audio");
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

  const sections = script.sections;
  const timings = [];
  let currentTime = 0;
  const wavFiles = [];

  console.log(`[VOICE] ${sections.length}セクションの音声を生成します`);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const wavPath = path.join(audioDir, `section_${String(i).padStart(3, "0")}.wav`);
    const silencePath = path.join(audioDir, `silence_${String(i).padStart(3, "0")}.wav`);

    try {
      const voiceText = applyReadingMap(section.text);
      const duration = await synthesize(voiceText, wavPath);

      timings.push({
        index: i,
        type: section.type,
        startTime: currentTime,
        duration,
        displayText: section.displayText,
      });

      wavFiles.push(wavPath);
      currentTime += duration;

      createSilentWav(silencePath, 0.5);
      wavFiles.push(silencePath);
      currentTime += 0.5;

      console.log(
        `  [${i + 1}/${sections.length}] ${section.type}: ${section.text.slice(0, 25)}... (${duration.toFixed(1)}s)`
      );

      await new Promise(r => setTimeout(r, 100));
    } catch (e) {
      console.error(`  [ERROR] section ${i}: ${e.message}`);
      const fallbackDuration = section.duration || Math.max(3, section.text.length * 0.08 + 0.5);
      createSilentWav(wavPath, fallbackDuration);
      timings.push({
        index: i,
        type: section.type,
        startTime: currentTime,
        duration: fallbackDuration,
        displayText: section.displayText,
        error: e.message,
      });
      wavFiles.push(wavPath);
      currentTime += fallbackDuration;
    }
  }

  const combinedPath = path.join(outputDir, "voice_combined.wav");
  const concatList = path.join(audioDir, "concat.txt");
  fs.writeFileSync(
    concatList,
    wavFiles.map(f => `file '${f.replace(/\\/g, "/")}'`).join("\n"),
    "utf-8"
  );

  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${concatList.replace(/\\/g, "/")}" -c copy "${combinedPath.replace(/\\/g, "/")}"`,
    { stdio: "pipe" }
  );

  const totalDuration = timings.reduce((a, t) => Math.max(a, t.startTime + t.duration), 0);
  console.log(`[VOICE] 完了: ${totalDuration.toFixed(1)}秒`);

  return { combinedPath, timings, totalDuration: currentTime };
}

if (process.argv[1] && process.argv[1].includes("generate-voice")) {
  const scriptPath = path.join(__dirname, "output", "script.json");
  if (!fs.existsSync(scriptPath)) {
    console.error("[ERROR] output/script.json が見つかりません。先に generate-script.js を実行してください");
    process.exit(1);
  }
  const script = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));
  generateVoice(script).catch(e => {
    console.error("[ERROR]", e.message);
    process.exit(1);
  });
}
