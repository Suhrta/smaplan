import { google } from "googleapis";
import { createServer } from "http";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import open from "open";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const credentials = JSON.parse(readFileSync(path.join(__dirname, "client_secret.json"), "utf-8"));
const { client_id, client_secret } = credentials.installed;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  "http://localhost:3000/callback"
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"],
});

console.log("ブラウザで TUT チャンネルの Google アカウントで認証してください...");
open(authUrl);

const server = createServer(async (req, res) => {
  if (req.url.startsWith("/callback")) {
    const code = new URL(req.url, "http://localhost:3000").searchParams.get("code");
    const { tokens } = await oauth2Client.getToken(code);
    writeFileSync(path.join(__dirname, "youtube_token.json"), JSON.stringify(tokens, null, 2));
    res.end("認証完了！このウィンドウを閉じてください。");
    server.close();
    console.log("[DONE] youtube_token.json を保存しました");
  }
});

server.listen(3000);
