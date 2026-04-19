import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import plans from '@/data/kaisen-plans.json';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type Answers = {
  q1_housing?: string;
  q2_region?: string;
  q3_current_line?: string;
  q4_users?: string;
  q5_usage?: string[];
  q6_speed?: string;
  q7_smartphone?: string;
  q8_budget?: string;
  q9_construction?: string;
  q10_priority?: string;
};

type Recommendation = {
  rank: number;
  name: string;
  type: string;
  monthly_cost: number;
  max_speed: string;
  reason: string;
  cashback: string;
  affiliate_key: string;
};

type DiagnoseResult = {
  housing_type: string;
  recommendations: Recommendation[];
  advice: string;
};

const VALID_KEYS = new Set(plans.map(p => p.id));

const SYSTEM_PROMPT = `あなたはインターネット回線の専門家「スマートプラン」のAIアドバイザーです。
ユーザーの10問診断の回答に基づき、以下の回線プランデータベースから最適なプランを3つ選んでください。

## ルール
- Q1の住居タイプに基づき、戸建て料金（monthly_cost_house）またはマンション料金（monthly_cost_mansion）を使う
- Q3で現在の回線がある場合、明確にコスト削減または速度改善になるプランを提案
- Q4の利用人数を考慮:
  - 1人: モバイルWiFi/ホームルーターも選択肢に
  - 2-3人: ホームルーターまたは光回線
  - 4人以上: 光回線を最優先
- Q5の用途を考慮:
  - 動画視聴: 100Mbps以上推奨
  - ゲーム: 低レイテンシの光回線を優先、NURO光やauひかりが有利
  - テレワーク: 安定性重視で光回線を優先
  - SNS・ブラウジング: 速度要件低め、コスパ重視でOK
- Q6の速度重視度:
  - 「とにかく速い」→ NURO光、auひかりなど高速回線を優先
  - 「普通でOK」→ コスパ重視
- Q7のスマホキャリア → smartphone_discount にマッチする回線を優先
  - ドコモ → ドコモ光、ドコモ home 5G
  - au → auひかり、ビッグローブ光、So-net光、WiMAX
  - ソフトバンク → ソフトバンク光、NURO光、ソフトバンクエアー
  - 楽天 → 楽天ひかり、楽天モバイルポケットWiFi
  - 格安SIM → セット割なしでも安いGMOとくとくBB光、おてがる光
- Q8の予算:
  - 3,000円以下 → NURO光マンション、おてがる光マンション、楽天ポケットWiFi
  - 3,000-5,000円 → 光回線マンションプラン、ホームルーター
  - 5,000円以上 → 光回線戸建てプラン含め全選択肢
- Q9の工事可否:
  - 工事NG → ホームルーター（home 5G、ソフトバンクエアー、WiMAX）またはモバイルWiFiのみ
  - 工事OK → 光回線を含めた全選択肢
  - わからない → 両方を提案し、adviceで説明
- Q10の重視ポイント:
  - 料金の安さ → monthly_costが低いプラン優先
  - 速度 → typical_speedが高いプラン優先
  - キャッシュバック → キャッシュバック特典があるプラン優先
  - 手軽さ → 工事不要のホームルーター・モバイルWiFi優先
- 3つの推薦は異なるタイプまたは異なる事業者から選ぶこと
- affiliate_key は必ずプランデータベースの id と完全一致させること

## プランデータベース（JSON）
${JSON.stringify(plans, null, 0)}

## 出力形式（JSON のみ。それ以外のテキストは不要）
{
  "housing_type": "戸建て" or "マンション",
  "recommendations": [
    {
      "rank": 1,
      "name": "回線名（plansのname）",
      "type": "光回線" or "ホームルーター" or "モバイルWiFi",
      "monthly_cost": 月額料金(数値、住居タイプに応じた金額),
      "max_speed": "最大速度",
      "reason": "このプランをおすすめする理由（80〜120文字）",
      "cashback": "キャッシュバックあり or 特典あり or なし（具体的な金額は記載しない）",
      "affiliate_key": "plans.jsonのid（必ず存在するidのみ）"
    },
    { "rank": 2, ... },
    { "rank": 3, ... }
  ],
  "advice": "ユーザーへの総合アドバイス（100〜200文字。工事の流れや注意点も含める）"
}`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const answers: Answers = body.answers ?? body;

  const userMessage = `ユーザーの診断回答:
- Q1 住居タイプ: ${answers.q1_housing ?? '未回答'}
- Q2 地域: ${answers.q2_region ?? '未回答'}
- Q3 現在の回線: ${answers.q3_current_line ?? '未回答'}
- Q4 利用人数: ${answers.q4_users ?? '未回答'}
- Q5 主な用途: ${Array.isArray(answers.q5_usage) ? answers.q5_usage.join('、') : '未回答'}
- Q6 速度の重視度: ${answers.q6_speed ?? '未回答'}
- Q7 スマホキャリア: ${answers.q7_smartphone ?? '未回答'}
- Q8 月額予算: ${answers.q8_budget ?? '未回答'}
- Q9 工事の可否: ${answers.q9_construction ?? '未回答'}
- Q10 重視すること: ${answers.q10_priority ?? '未回答'}

上記の回答から、回線プランデータベースより最適な3プランを選び、指定のJSON形式で返答してください。`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: [
        { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    const data: DiagnoseResult = JSON.parse(cleaned);

    if (!Array.isArray(data.recommendations) || data.recommendations.length === 0) {
      console.error('Invalid response format. Raw text:', text);
      return NextResponse.json({ error: 'レスポンス形式エラー' }, { status: 500 });
    }

    data.recommendations = data.recommendations.map(rec => {
      if (!VALID_KEYS.has(rec.affiliate_key)) {
        console.warn('Unknown affiliate_key from AI:', rec.affiliate_key);
        return { ...rec, affiliate_key: '' };
      }
      return rec;
    });

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}
