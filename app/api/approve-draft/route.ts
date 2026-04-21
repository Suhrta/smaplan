import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DRAFTS_DIR = resolve(process.cwd(), 'data', 'drafts');
const POSTS_PATH = resolve(process.cwd(), 'data', 'blog-posts.json');

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  if (!id || !token || !action) {
    return new NextResponse(htmlPage('エラー', 'パラメータが不足しています。', 'error'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const expectedToken = process.env.APPROVE_TOKEN;
  if (!expectedToken || token !== expectedToken) {
    return new NextResponse(htmlPage('認証エラー', 'トークンが無効です。', 'error'), {
      status: 403,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const draftPath = resolve(DRAFTS_DIR, `${id}.json`);

  if (!id.match(/^[a-f0-9]{16}$/) || !existsSync(draftPath)) {
    return new NextResponse(htmlPage('見つかりません', 'このドラフトは既に処理済みか、存在しません。', 'warning'), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const draft = JSON.parse(await readFile(draftPath, 'utf-8'));

  if (action === 'approve') {
    const postsRaw = existsSync(POSTS_PATH)
      ? await readFile(POSTS_PATH, 'utf-8')
      : '[]';
    const posts = JSON.parse(postsRaw);

    const duplicate = posts.find((p: { slug: string }) => p.slug === draft.slug);
    if (duplicate) {
      await unlink(draftPath);
      return new NextResponse(
        htmlPage('重複', `「${draft.title}」は既に公開済みです。ドラフトを削除しました。`, 'warning'),
        { status: 409, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
      );
    }

    const post = {
      slug: draft.slug,
      title: draft.title,
      description: draft.description,
      category: draft.category,
      type: draft.type,
      publishedAt: new Date().toISOString().split('T')[0],
      content: draft.content,
    };

    posts.push(post);
    await writeFile(POSTS_PATH, JSON.stringify(posts, null, 2) + '\n', 'utf-8');
    await unlink(draftPath);

    return new NextResponse(
      htmlPage('承認完了 ✅', `「${draft.title}」をblog-posts.jsonに追加しました。次回のデプロイで公開されます。`, 'success'),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  if (action === 'reject') {
    draft.status = 'rejected';
    await writeFile(draftPath, JSON.stringify(draft, null, 2) + '\n', 'utf-8');

    return new NextResponse(
      htmlPage('却下 ❌', `「${draft.title}」を却下しました。`, 'info'),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  return new NextResponse(htmlPage('エラー', '無効なアクションです。approve または reject を指定してください。', 'error'), {
    status: 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function htmlPage(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') {
  const colors = {
    success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534' },
    error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
  };
  const c = colors[type];

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} - えらブック管理</title>
<style>
  body{margin:0;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f9fafb;display:flex;justify-content:center;align-items:center;min-height:100vh}
  .card{max-width:480px;width:100%;background:${c.bg};border:2px solid ${c.border};border-radius:12px;padding:32px;text-align:center}
  h1{color:${c.text};font-size:1.5rem;margin:0 0 12px}
  p{color:#374151;font-size:1rem;line-height:1.6;margin:0}
</style>
</head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body>
</html>`;
}
