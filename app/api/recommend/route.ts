import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { mood, want, genre, content, personality, avoid, excludedBooks, replaceIndex } = await req.json();

  const isReplace = replaceIndex !== undefined && excludedBooks && excludedBooks.length > 0;

  const prompt = isReplace
    ? `あなたは本のソムリエです。以下の診断結果をもとに、別の小説を1冊だけ推薦してください。

診断結果:
- 今の気分: ${mood}
- 本に求めるもの: ${want}
- 好きな映画・ドラマのジャンル: ${Array.isArray(genre) ? genre.join('、') : genre}
- 最近ハマったコンテンツ: ${content}
- 性格タイプ: ${personality}
- 苦手なもの: ${Array.isArray(avoid) && avoid.length > 0 ? avoid.join('、') : 'なし'}
- 除外する本（読んだことがある）: ${excludedBooks.join('、')}

条件:
- 実在する日本語で読める小説のみ
- 読書初心者でも読みやすいものを優先
- Kindleで読めるものを優先
- 苦手な要素は必ず避ける
- 除外リストの本は絶対に推薦しないこと

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
- 本に求めるもの: ${want}
- 好きな映画・ドラマのジャンル: ${Array.isArray(genre) ? genre.join('、') : genre}
- 最近ハマったコンテンツ: ${content}
- 性格タイプ: ${personality}
- 苦手なもの: ${Array.isArray(avoid) && avoid.length > 0 ? avoid.join('、') : 'なし'}

条件:
- 実在する日本語で読める小説のみ
- 読書初心者でも読みやすいものを優先
- Kindleで読めるものを優先
- 苦手な要素は必ず避ける
- 診断結果を深く読み取り、その人の内面・好み・生活スタイルを反映した推薦をすること

タイプ名について：
- 「〇〇な△△」という形式で、思わずXでシェアしたくなるような個性的でユニークな名前をつけること
- 例：「深夜に泣ける系感情過多人間」「論理で世界を解読したい隠れ哲学者」「現実逃避のプロフェッショナル」「笑いで人生を乗り切るサバイバー」
- 絶対に「〇〇タイプ」「〇〇派」などの無難な名前にしないこと
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
      model: 'claude-haiku-4-5',
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