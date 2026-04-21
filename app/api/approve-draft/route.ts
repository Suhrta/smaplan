import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DRAFTS_DIR = resolve(process.cwd(), 'data', 'drafts');

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  if (!id || !token || !action) {
    return html('エラー', 'パラメータが不足しています。', 'error', 400);
  }

  const expectedToken = process.env.APPROVE_TOKEN;
  if (!expectedToken || token !== expectedToken) {
    return html('認証エラー', 'トークンが無効です。', 'error', 403);
  }

  if (!id.match(/^[a-f0-9]{16}$/)) {
    return html('エラー', '無効なドラフトIDです。', 'error', 400);
  }

  if (action !== 'approve' && action !== 'reject') {
    return html('エラー', '無効なアクションです。approve または reject を指定してください。', 'error', 400);
  }

  const draftPath = resolve(DRAFTS_DIR, `${id}.json`);
  if (!existsSync(draftPath)) {
    return html('見つかりません', 'このドラフトは既に処理済みか、存在しません。', 'warning', 404);
  }

  const draft = JSON.parse(await readFile(draftPath, 'utf-8'));

  const ghToken = process.env.GITHUB_PAT;
  if (!ghToken) {
    return html('設定エラー', 'GITHUB_PATが設定されていません。', 'error', 500);
  }

  const repo = process.env.GITHUB_REPO || 'Suhrta/smaplan';
  const res = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/approve-draft.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ghToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: { draft_id: id, action },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    console.error(`GitHub API error: ${res.status} ${body}`);
    return html('エラー', 'GitHub Actionsの起動に失敗しました。しばらくしてからもう一度お試しください。', 'error', 500);
  }

  if (action === 'approve') {
    return html(
      '承認処理を開始しました ✅',
      `「${draft.title}」の公開処理をGitHub Actionsで実行中です。数分後に自動デプロイされます。`,
      'success',
      200,
    );
  }

  return html(
    '却下処理を開始しました ❌',
    `「${draft.title}」の却下処理をGitHub Actionsで実行中です。`,
    'info',
    200,
  );
}

function html(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info', status: number) {
  const colors = {
    success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534', icon: '✅' },
    error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', icon: '❌' },
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', icon: '⚠️' },
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: 'ℹ️' },
  };
  const c = colors[type];

  const body = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} - えらブック管理</title>
<style>
  body{margin:0;padding:40px 20px;font-family:"Noto Sans JP",-apple-system,BlinkMacSystemFont,sans-serif;background:#f9fafb;display:flex;justify-content:center;align-items:center;min-height:100vh}
  .card{max-width:480px;width:100%;background:${c.bg};border:2px solid ${c.border};border-radius:12px;padding:32px;text-align:center}
  h1{color:${c.text};font-size:1.5rem;margin:0 0 12px}
  p{color:#374151;font-size:1rem;line-height:1.6;margin:0}
  .note{margin-top:16px;font-size:0.85rem;color:#6b7280}
</style>
</head>
<body><div class="card"><h1>${title}</h1><p>${message}</p>
${type === 'success' ? '<p class="note">Vercelへの反映には2〜3分かかります。</p>' : ''}
</div></body>
</html>`;

  return new NextResponse(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
