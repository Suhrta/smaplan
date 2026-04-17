import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const UMAPOCKET_VIDEO_DIR = "C:/Users/suhr5/umapocket/scripts/video";
const COMMON_TAGS = ["スマホ", "格安SIM", "節約", "スマプラン", "料金プラン", "スマホ料金", "乗り換え"];

function getYouTubeClient() {
  const credPath = path.join(UMAPOCKET_VIDEO_DIR, "client_secret.json");
  const tokenPath = path.join(UMAPOCKET_VIDEO_DIR, "youtube_token.json");

  if (!fs.existsSync(credPath)) {
    throw new Error(`client_secret.json が見つかりません: ${credPath}`);
  }
  if (!fs.existsSync(tokenPath)) {
    throw new Error(`youtube_token.json が見つかりません: ${tokenPath}\n  → umapocket/scripts/video/auth-youtube.js で認証してください`);
  }

  const credentials = JSON.parse(fs.readFileSync(credPath, "utf-8"));
  const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));
  const { client_id, client_secret } = credentials.installed;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost:3000/callback"
  );
  oauth2Client.setCredentials(tokens);

  return google.youtube({ version: "v3", auth: oauth2Client });
}

export async function uploadShort(script) {
  console.log("[UPLOAD] YouTubeアップロード開始");

  const outputDir = path.join(__dirname, "output");
  const videoPath = path.join(outputDir, "video.mp4");
  const thumbnailPath = path.join(outputDir, "thumbnail.png");

  if (!fs.existsSync(videoPath)) {
    throw new Error(`動画ファイルが見つかりません: ${videoPath}`);
  }

  const youtube = getYouTubeClient();

  const title = `${script.title} #Shorts`;
  const description = `${script.description || ""}

📱 AIがあなたに最適なスマホプランを診断！
🔗 無料診断はこちら → https://smaplan.com

#スマプラン #スマホ料金 #格安SIM #節約 #料金プラン`;

  const tags = [...new Set([...(script.tags || []), ...COMMON_TAGS])];

  console.log(`  タイトル: ${title}`);
  console.log(`  タグ: ${tags.join(", ")}`);

  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description,
        tags,
        categoryId: "28",
        defaultLanguage: "ja",
      },
      status: {
        privacyStatus: "private",
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  const videoId = res.data.id;
  console.log(`  動画アップロード完了: https://youtube.com/shorts/${videoId}`);

  if (fs.existsSync(thumbnailPath)) {
    try {
      await youtube.thumbnails.set({
        videoId,
        media: {
          body: fs.createReadStream(thumbnailPath),
        },
      });
      console.log("  サムネイル設定完了");
    } catch (e) {
      console.log(`  サムネイル設定失敗: ${e.message}`);
    }
  }

  console.log("[UPLOAD] 完了");
  return videoId;
}

if (process.argv[1] && process.argv[1].includes("upload-short")) {
  const scriptPath = path.join(__dirname, "output", "script.json");
  if (!fs.existsSync(scriptPath)) {
    console.error("[ERROR] output/script.json が見つかりません");
    process.exit(1);
  }
  const script = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));
  uploadShort(script).catch(e => {
    console.error("[ERROR]", e.message);
    process.exit(1);
  });
}
