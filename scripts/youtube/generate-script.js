import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function loadPlans() {
  const plansPath = path.resolve(__dirname, "../../data/plans.json");
  return JSON.parse(fs.readFileSync(plansPath, "utf-8"));
}

function formatPlansForPrompt(plans) {
  return plans.map(p => {
    let line = `- ${p.plan_name}（${p.carrier}）: 月額${p.monthly_cost.toLocaleString()}円（税込）`;
    if (p.monthly_cost_min_with_discounts) {
      line += `、割引適用時${p.monthly_cost_min_with_discounts.toLocaleString()}円〜`;
    }
    line += `、データ${p.data_gb >= 999 ? "無制限" : p.data_gb + "GB"}`;
    if (p.call_included !== "なし（5分/無制限オプションあり）" &&
        p.call_included !== "なし（5分/10分/無制限オプションあり）" &&
        p.call_included !== "なし（10分/無制限オプションあり）") {
      line += `、通話:${p.call_included}`;
    }
    line += `\n  特徴: ${p.features.join("、")}`;
    return line;
  }).join("\n");
}

function getRelevantPlans(plans, topic) {
  const desc = topic.title + " " + topic.description;
  const relevant = plans.filter(p => {
    const names = [p.plan_name, p.carrier, p.carrier_parent, p.id].join(" ");
    return desc.split(/[\s、。・]/).some(word => word.length >= 2 && names.includes(word));
  });
  return relevant.length > 0 ? relevant : plans;
}

export async function generateScript(topic) {
  console.log(`[SCRIPT] トピック: ${topic.title} (${topic.type})`);

  const plans = loadPlans();
  const relevantPlans = getRelevantPlans(plans, topic);
  const plansText = formatPlansForPrompt(relevantPlans);

  const templatePath = path.join(__dirname, "templates", `${topic.type}.json`);
  const template = JSON.parse(fs.readFileSync(templatePath, "utf-8"));

  const sectionsInstruction = template.sectionStructure
    .map((s, i) => `${i + 1}. ${s.type}: ${s.instruction}`)
    .join("\n");

  const prompt = `${template.systemPrompt}

【トピック】
タイトル: ${topic.title}
説明: ${topic.description}

【使用可能なプランデータ（実データ・正確に引用すること）】
${plansText}

【全プラン一覧（参考）】
${formatPlansForPrompt(plans)}

【動画構成（この順番でセクションを生成）】
${sectionsInstruction}

【制約】
- 合計尺: ${template.constraints.totalDuration}秒以内
- トーン: ${template.constraints.tone}
- ${template.constraints.rules.join("\n- ")}

【出力形式】以下のJSON形式のみで返答してください（説明不要、コードブロック不要）:
{
  "title": "YouTubeショートのタイトル（40文字以内、#Shortsは含めない）",
  "description": "YouTube説明文（200文字程度。smaplan.comへのリンク、AIがあなたに最適なスマホプランを診断という説明、ハッシュタグ5つを含める）",
  "tags": ["スマホ", "格安SIM", "節約", "スマプラン", "料金プラン"],
  "thumbnailText": "サムネイルに表示する短いテキスト（20文字以内）",
  "sections": [
    {
      "type": "セクション種類",
      "text": "読み上げるテキスト（1ポイントのみ、短く）",
      "displayText": "画面に超大きく表示するキーワード（15文字以内）",
      "duration": 秒数（5〜10）
    }
  ]
}

【displayTextのルール】
- 15文字以内。画面全体に巨大フォントで表示される
- 料金は数字のみ大きく表示（例: "3,278円"、"月額990円"）
- 改行したい場合は\\nを使う（例: "楽天モバイル\\n3,278円"）
- 意味のかたまりで区切る。単語の途中で切れないこと
- 1セクション=1ポイントのみ。複数の情報を詰め込まない

sectionsの最後は必ずtype:"cta"で、スマプランへの誘導を含めること。
各sectionのdurationの合計が${template.constraints.totalDuration}秒以内になるようにすること。
セクション数は7〜8個、各セクション5〜10秒が目安。テンポよく画面を切り替える。`;

  console.log("[SCRIPT] Claude API呼び出し中...");
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content[0].text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}") + 1;
  const script = JSON.parse(raw.slice(start, end));

  script.topicId = topic.id;
  script.topicType = topic.type;
  script.generatedAt = new Date().toISOString();

  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  const outputPath = path.join(outputDir, "script.json");
  fs.writeFileSync(outputPath, JSON.stringify(script, null, 2), "utf-8");

  const totalDuration = script.sections.reduce((a, s) => a + (s.duration || 0), 0);
  console.log(`[SCRIPT] 生成完了`);
  console.log(`  タイトル: ${script.title}`);
  console.log(`  セクション数: ${script.sections.length}`);
  console.log(`  推定尺: ${totalDuration}秒`);

  return script;
}

if (process.argv[1] && process.argv[1].includes("generate-script")) {
  const topicsPath = path.join(__dirname, "short-topics.json");
  const { topics } = JSON.parse(fs.readFileSync(topicsPath, "utf-8"));
  const topicId = process.argv[2] ? parseInt(process.argv[2]) : null;
  const topic = topicId
    ? topics.find(t => t.id === topicId)
    : topics.filter(t => !t.used).sort((a, b) => a.priority - b.priority)[0];

  if (!topic) {
    console.error("[ERROR] 使用可能なトピックがありません");
    process.exit(1);
  }
  generateScript(topic).catch(e => {
    console.error("[ERROR]", e.message);
    process.exit(1);
  });
}
