import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { mood, genre, personality, reading, avoid } = await req.json();

  const prompt = `あなたは本のソムリエです。本をほとんど読まない人が「はじめの1冊」を見つけるためのアドバイザーです。

以下の診断結果をもとに、その人にぴったりの小説を3冊おすすめしてください。

診断結果:
- 今の気分: ${mood}
- 好きな映画・ドラマのジャンル: ${Array.isArray(genre) ? genre.join('、') : genre}
- 性格タイプ: ${personality}
- 読書経験: ${reading}
- 苦手なもの: ${Array.isArray(avoid) && avoid.length > 0 ? avoid.join('、') : 'なし'}

条件:
- 実在する日本語で読める小説のみ
- 読書初心者でも読みやすいものを優先
- Kindleで読めるものを優先
- 苦手な要素は必ず避ける

必ずこのJSON形式のみで返答してください。説明文は不要です：
{
  "type": "あなたを一言で表すキャラクター名（例：静かな冒険者）",
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

    if (!data.books || !Array.isArray(data.books)) {
      return NextResponse.json({ error: 'レスポンス形式エラー', raw: text }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'エラーが発生しました', detail: String(e) }, { status: 500 });
  }
}