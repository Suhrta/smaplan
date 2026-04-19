import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import plans from '@/data/plans.json';
import blogPosts from '@/data/blog-posts.json';
import { checkRateLimit } from '@/lib/rateLimit';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type Answers = {
  q1_carrier?: string;
  q2_monthly_cost?: string | number;
  q3_switch?: string;
  q4_family?: string;
  q5_call?: string;
  q6_data_usage?: string;
  q7_speed_concern?: string;
  q8_usage_types?: string[];
  q9_priority?: string;
  q10_bundle_discount?: string;
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

type RelatedPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
};

type DiagnoseResult = {
  estimated_data_gb: number;
  current_estimated_cost: number;
  recommendations: Recommendation[];
  advice: string;
  related_posts?: RelatedPost[];
};

function getRelatedPosts(recommendations: Recommendation[]): RelatedPost[] {
  const posts = blogPosts as Array<{
    slug: string;
    title: string;
    description: string;
    publishedAt: string;
  }>;

  const keywords = new Set<string>();
  for (const r of recommendations) {
    if (r.carrier) keywords.add(r.carrier);
    if (r.plan_name) {
      for (const token of r.plan_name.split(/[\s　]+/)) {
        if (token.length >= 2) keywords.add(token);
      }
    }
  }

  const scored = posts.map(p => {
    const text = `${p.title} ${p.description}`;
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score += 1;
    }
    return { post: p, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.post.publishedAt.localeCompare(a.post.publishedAt);
  });

  const matched = scored.filter(s => s.score > 0).slice(0, 3);
  const selected =
    matched.length >= 2
      ? matched.map(s => s.post)
      : [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);

  return selected.map(p => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    publishedAt: p.publishedAt,
  }));
}

const VALID_KEYS = new Set(plans.map(p => p.id));

const SYSTEM_PROMPT = `あなたはスマホ料金の専門家「スマプラン」のAIアドバイザーです。
ユーザーの10問診断の回答に基づき、以下のプランデータベースから最適なプランを3つ選んでください。

## ルール
- ユーザーの回答からデータ使用量を推定すること
- Q3で「できれば今のキャリアがいい」なら同キャリア内プラン（同じ carrier_parent のプラン）を優先
- Q4で「まとめてる」「まとめたい」なら family_discount が true のプランを優先
- Q7の通信速度への不満を考慮
  - 「不満あり（遅いと感じる）」→ サブブランド（ahamo / povo / LINEMO / UQ mobile / Y!mobile）および大手キャリア系を優先推薦。MVNO（IIJmio / mineo / 日本通信SIM / イオンモバイル）は順位を下げる
  - 「特に不満なし」「気にしたことがない」→ MVNOを含めて安さ重視で推薦してよい
- Q9の重視ポイントを最優先条件として考慮
  - 「とにかく安さ」→ monthly_cost が低いプラン優先
  - 「通信速度・安定性」→ 大手キャリア/サブブランド優先（MVNO は混雑時に低下する旨、advice に添える）
  - 「データたっぷり」→ data_gb が大きいまたは無制限（999）のプラン優先
  - 「サポートの手厚さ」→ 店舗サポートがある事業者（イオンモバイル、UQ mobile、Y!mobile、大手キャリア）を優先
- Q10で「使ってる」なら bundle_discount が true のプランで比較時にセット割を考慮（monthly_cost_min_with_discounts があればそちらに近い価格で評価）
- 推定データ使用量の目安:
  - Q6「ほぼWi-Fi環境で足りてる」＋Q8主にSNS・ニュース → 1〜3GB
  - Q6「通勤・移動中にそこそこ」＋Q8主にSNS・ニュース → 3〜5GB
  - Q6「通勤・移動中にそこそこ」＋Q8に動画視聴 → 10〜20GB
  - Q6「外でもガンガン使う」＋Q8に動画視聴 → 20GB〜無制限
  - Q8に「仕事・テザリング」→ 20GB〜無制限
- 現在の月額料金（current_estimated_cost）の扱い:
  - Q2に数値（例: 7000）が入っていればそれをそのまま current_estimated_cost に採用する（推定し直さない）
  - Q2が「わからない」の場合のみ、Q1のキャリアから以下の目安で推定する:
    - ドコモ: 7,000円
    - au: 7,000円
    - ソフトバンク: 7,000円
    - 楽天モバイル: 3,000円
    - 格安SIM（MVNO）: 2,000円
    - キャリアも「わからない」: 5,000円
- **おすすめ順序**: ユーザーの current_estimated_cost より monthly_cost が安いプランを優先的に上位（rank 1〜3）に推薦すること。同等以上の価格帯は、データ容量や通話込みなど明確な価値向上がある場合のみ推薦する
- annual_saving の算出:
  - annual_saving = (current_estimated_cost - recommended_monthly_cost) * 12 で算出する
  - マイナス（現在より高い）になる場合、その値（負数）をそのまま annual_saving にセットし、reason に「データ容量が◯倍」「通話込みで従量課金が不要」などコスパ改善の具体的な理由を必ず明記する
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
  const rl = checkRateLimit(req, 'diagnose');
  if (!rl.allowed) {
    return NextResponse.json(
      { error: '短時間に多くのリクエストを受け取りました。しばらく経ってから再度お試しください。' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  const body = await req.json();
  const answers: Answers = body.answers ?? body;

  const q2 = answers.q2_monthly_cost;
  const q2Display =
    typeof q2 === 'number' ? `${q2.toLocaleString()}円（ユーザー入力）` : (q2 ?? '未回答');

  const userMessage = `ユーザーの診断回答:
- Q1 現在のキャリア: ${answers.q1_carrier ?? '未回答'}
- Q2 現在の月額料金: ${q2Display}
- Q3 乗り換え意向: ${answers.q3_switch ?? '未回答'}
- Q4 家族でまとめる: ${answers.q4_family ?? '未回答'}
- Q5 電話利用: ${answers.q5_call ?? '未回答'}
- Q6 外出時データ利用: ${answers.q6_data_usage ?? '未回答'}
- Q7 通信速度への不満: ${answers.q7_speed_concern ?? '未回答'}
- Q8 外出時の主な利用: ${Array.isArray(answers.q8_usage_types) ? answers.q8_usage_types.join('、') : '未回答'}
- Q9 最重視: ${answers.q9_priority ?? '未回答'}
- Q10 セット割: ${answers.q10_bundle_discount ?? '未回答'}

上記の回答から、プランデータベースより最適な3プランを選び、指定のJSON形式で返答してください。`;

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

    data.related_posts = getRelatedPosts(data.recommendations);

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 });
  }
}
