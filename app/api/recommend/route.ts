import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { mood, genre, length, experience, avoid, excludedBooks, replaceIndex } = await req.json();

  const isReplace = replaceIndex !== undefined && excludedBooks && excludedBooks.length > 0;

  const prompt = isReplace
    ? `あなたは本のソムリエです。以下の診断結果をもとに、別の小説を1冊だけ推薦してください。

診断結果:
- 今の気分: ${mood}
- 読みたいジャンル: ${Array.isArray(genre) ? genre.join('、') : genre}
- 本の長さ: ${length}
- 読書経験: ${experience}
- 苦手なもの: ${Array.isArray(avoid) && avoid.length > 0 ? avoid.join('、') : 'なし'}
- 除外する本（読んだことがある・これらと同じタイトルや非常に似た内容の本も推薦しないこと）: ${excludedBooks.join('、')}
- 実在しない本・著者の組み合わせは絶対に推薦しないこと

条件:
- 実在する日本語で読める小説のみ
- 苦手な要素は必ず避ける
- 除外リストの本は絶対に推薦しないこと
- 読書経験が「ほとんど読まない」場合は特に読みやすい本を優先

必ずこのJSON形式のみで返答してください：
{
  "title": "書名",
  "author": "著者名",
  "score": 95,
  "reason": "この人にすすめる理由（80文字以内）",
  "first_page": "この本の最初の数行の雰囲気を説明（60文字以内）",
  "kindle": true
}`
    : `あなたは本のソムリエです。本をほとんど読まない人が「はじめの1冊」を見つけるためのアドバイザーです。

以下の診断結果をもとに、その人にぴったりの小説を3冊おすすめしてください。

診断結果:
- 今の気分: ${mood}
- 読みたいジャンル: ${Array.isArray(genre) ? genre.join('、') : genre}
- 本の長さ: ${length}
- 読書経験: ${experience}
- 苦手なもの: ${Array.isArray(avoid) && avoid.length > 0 ? avoid.join('、') : 'なし'}

【推薦のポイント】
- 気分とジャンルを掛け合わせて最適な本を選ぶこと
  例：ミステリー好き×スカッとしたい→痛快な謎解き系、ミステリー好き×ゾクゾクしたい→心理サスペンス系
- 読書経験が「ほとんど読まない」場合：有名・王道・映画化済みの読みやすい本を優先
- 読書経験が「たまに読む」場合：ベストセラー・話題作を中心に
- 読書経験が「よく読む」場合：質が高ければ多少マイナーな作品もOK
- 本の長さの希望は必ず守ること
- 苦手な要素は必ず避けること
- 3冊は必ず異なる書名・著者の本にすること。同じ本を複数推薦しないこと
- Kindle対応と記載する場合は、実際にKindleストアで購入・読める本のみにすること
- 実在が確実な有名作品のみ推薦すること。マイナーすぎる・実在が不確かな本は推薦しないこと

タイプ名について：
- 思わずXでシェアしたくなる個性的でユニークな名前をつけること
- 例：「深夜に泣ける系感情過多人間」「論理で世界を解読したい隠れ哲学者」「現実逃避のプロフェッショナル」
- 「〇〇タイプ」「〇〇派」などの無難な名前にしないこと
- 20文字以内に収めること

必ずこのJSON形式のみで返答してください。説明文は不要です：
{
  "type": "ユニークなタイプ名",
  "type_reason": "そのタイプである理由（50文字以内）",
  "books": [
    {
      "title": "書名",
      "author": "著者名",
      "score": 95,
      "reason": "この人にすすめる理由（80文字以内）",
      "first_page": "この本の最初の数行の雰囲気を説明（60文字以内）",
      "kindle": true
    }
  ]
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    const data = JSON.parse(cleaned);

    if (isReplace) {
      return NextResponse.json({ book: data, replaceIndex });
    }

    if (!data.books || !Array.isArray(data.books)) {
      return NextResponse.json({ error: 'レスポンス形式エラー', raw: text }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'エラーが発生しました', detail: String(e) }, { status: 500 });
  }
}