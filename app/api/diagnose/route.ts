import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import plans from '@/data/plans.json';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type Answers = {
  q1_carrier?: string;
  q2_monthly_cost?: string;
  q3_switch?: string;
  q4_family?: string;
  q5_call?: string;
  q6_data_usage?: string;
  q7_usage_types?: string[];
  q8_priority?: string;
  q9_bundle_discount?: string;
};

type Recommendation = {
  rank: number;
  carrier: string;
  plan_name: string;
  monthly_cost: number;
  data_gb: string;
  call_option: string;
  reason: string;
  annual_saving: number;
  affiliate_key: string;
};

type DiagnoseResult = {
  estimated_data_gb: number;
  current_estimated_cost: number;
  recommendations: Recommendation[];
  advice: string;
};

const VALID_KEYS = new Set(plans.map(p => p.id));

const SYSTEM_PROMPT = `あなたはスマホ料金の専門家「スマプラン」のAIアドバイザーです。
ユーザーの9問診断の回答に基づき、以下のプランデータベースから最適なプランを3つ選んでください。

## ルール
- ユーザーの回答からデータ使用量を推定すること
- Q3で「できれば今のキャリアがいい」なら同キャリア内プラン（同じ carrier_parent のプラン）を優先
- Q4で「まとめてる」「まとめたい」なら family_discount が true のプランを優先
- Q8の重視ポイントを最優先条件として考慮
  - 「とにかく安さ」→ monthly_cost が低いプラン優先
  - 「通信速度・安定性」→ 大手キャリア/サブブランド優先（MVNO は混雑時に低下する旨、advice に添える）
  - 「データたっぷり」→ data_gb が大きいまたは無制限（999）のプラン優先
  - 「サポートの手厚さ」→ 店舗サポートがある事業者（イオンモバイル、UQ mobile、Y!mobile、大手キャリア）を優先
- Q9で「使ってる」なら bundle_discount が true のプランで比較時にセット割を考慮（monthly_cost_min_with_discounts があればそちらに近い価格で評価）
- 推定データ使用量の目安:
  - Q6「ほぼWi-Fi環境で足りてる」＋Q7主にSNS・ニュース → 1〜3GB
  - Q6「通勤・移動中にそこそこ」＋Q7主にSNS・ニュース → 3〜5GB
  - Q6「通勤・移動中にそこそこ」＋Q7に動画視聴 → 10〜20GB
  - Q6「外でもガンガン使う」＋Q7に動画視聴 → 20GB〜無制限
  - Q7に「仕事・テザリング」→ 20GB〜無制限
- 現在の月額料金（current_estimated_cost）の推定:
  - Q2で金額レンジが選択されていればその中央値を採用
  - Q2「わからない」の場合、Q1のキャリアの平均的なプラン料金を推定（ドコモ/au/ソフトバンクは7,000〜8,000円、サブブランド・楽天は3,000〜4,000円、格安SIMは1,500〜2,500円）
- annual_saving は (current_estimated_cost - monthly_cost) * 12 で算出。マイナス（現在より高い）の場合は 0 とする
- 3つの推薦は異なるキャリアまたは容量レンジから選ぶこと（同じ事業者の似たプランを並べない）
- affiliate_key は必ずプランデータベースの id と完全一致させること（独自のキーを作らない）

## プランデータベース（JSON）
${JSON.stringify(plans, null, 0)}

## 出力形式（JSON のみ。それ以外のテキストは不要）
{
  "estimated_data_gb": 推定月間データ使用量(数値),
  "current_estimated_cost": 現在の推定月額(数値),
  "recommendations": [
    {
      "rank": 1,
      "carrier": "キャリア名（plansのcarrier）",
      "plan_name": "プラン名（plansのplan_name）",
      "monthly_cost": 月額料金(数値),
      "data_gb": "データ容量の表示テキスト（例: '30GB' や '無制限（段階制）'）",
      "call_option": "通話オプションの説明",
      "reason": "このプランをおすすめする理由（80〜120文字）",
      "annual_saving": 年間節約額(数値),
      "affiliate_key": "plans.jsonのid（必ず存在するidのみ）"
    },
    { "rank": 2, ... },
    { "rank": 3, ... }
  ],
  "advice": "ユーザーへの総合アドバイス（100〜200文字。乗り換え手順のヒントや注意点も含める）"
}`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const answers: Answers = body.answers ?? body;

  const userMessage = `ユーザーの診断回答:
- Q1 現在のキャリア: ${answers.q1_carrier ?? '未回答'}
- Q2 現在の月額料金: ${answers.q2_monthly_cost ?? '未回答'}
- Q3 乗り換え意向: ${answers.q3_switch ?? '未回答'}
- Q4 家族でまとめる: ${answers.q4_family ?? '未回答'}
- Q5 電話利用: ${answers.q5_call ?? '未回答'}
- Q6 外出時データ利用: ${answers.q6_data_usage ?? '未回答'}
- Q7 外出時の主な利用: ${Array.isArray(answers.q7_usage_types) ? answers.q7_usage_types.join('、') : '未回答'}
- Q8 最重視: ${answers.q8_priority ?? '未回答'}
- Q9 セット割: ${answers.q9_bundle_discount ?? '未回答'}

上記の回答から、プランデータベースより最適な3プランを選び、指定のJSON形式で返答してください。`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
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
