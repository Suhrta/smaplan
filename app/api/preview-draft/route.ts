import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DRAFTS_DIR = resolve(process.cwd(), 'data', 'drafts');

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  const token = searchParams.get('token');

  if (!id || !token) {
    return new NextResponse(errorHtml('パラメータが不足しています。'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const expectedToken = process.env.APPROVE_TOKEN;
  if (!expectedToken || token !== expectedToken) {
    return new NextResponse(errorHtml('トークンが無効です。'), {
      status: 403,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (!id.match(/^[a-f0-9]{16}$/)) {
    return new NextResponse(errorHtml('無効なドラフトIDです。'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const draftPath = resolve(DRAFTS_DIR, `${id}.json`);
  if (!existsSync(draftPath)) {
    return new NextResponse(errorHtml('このドラフトは存在しないか、既に処理済みです。'), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const draft = JSON.parse(await readFile(draftPath, 'utf-8'));
  const html = renderPreview(draft, id, token);

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function errorHtml(message: string) {
  return `<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>エラー - えらブック管理</title>
<style>body{margin:0;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans JP",sans-serif;background:#f9fafb;display:flex;justify-content:center;align-items:center;min-height:100vh}
.card{max-width:480px;width:100%;background:#fef2f2;border:2px solid #ef4444;border-radius:12px;padding:32px;text-align:center}
h1{color:#991b1b;font-size:1.5rem;margin:0 0 12px}p{color:#374151;font-size:1rem;line-height:1.6;margin:0}</style>
</head><body><div class="card"><h1>エラー</h1><p>${escapeHtml(message)}</p></div></body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderInlineHtml(text: string): string {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  let paraBuf: string[] = [];
  let h2Count = 0;

  const flushPara = () => {
    if (paraBuf.length) {
      out.push(`<p>${renderInlineHtml(paraBuf.join(' ').trim())}</p>`);
      paraBuf = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      flushPara();
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      flushPara();
      out.push(`<h3>${escapeHtml(line.slice(4).trim())}</h3>`);
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      flushPara();
      h2Count++;
      if (h2Count > 1) out.push('<hr>');
      out.push(`<h2 id="section-${h2Count}">${escapeHtml(line.slice(3).trim())}</h2>`);
      i++;
      continue;
    }

    if (line.startsWith('> ')) {
      flushPara();
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        buf.push(lines[i].slice(2).trim());
        i++;
      }
      out.push(`<blockquote>${renderInlineHtml(buf.join(' '))}</blockquote>`);
      continue;
    }

    if (line.startsWith('- ')) {
      flushPara();
      out.push('<ul>');
      while (i < lines.length && lines[i].startsWith('- ')) {
        out.push(`<li>${renderInlineHtml(lines[i].slice(2).trim())}</li>`);
        i++;
      }
      out.push('</ul>');
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      flushPara();
      out.push('<ol>');
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        out.push(`<li>${renderInlineHtml(lines[i].replace(/^\d+\.\s/, '').trim())}</li>`);
        i++;
      }
      out.push('</ol>');
      continue;
    }

    paraBuf.push(line.trim());
    i++;
  }
  flushPara();
  return out.join('\n');
}

function buildToc(md: string): string {
  const headings = [...md.matchAll(/^## (.+)$/gm)];
  if (headings.length < 2) return '';
  const items = headings
    .map((m, i) => `<li><a href="#section-${i + 1}">${escapeHtml(m[1].trim())}</a></li>`)
    .join('\n');
  return `<aside class="toc"><div class="toc-label">📋 この記事でわかること</div><ul>${items}</ul></aside>`;
}

interface Draft {
  id: string;
  slug: string;
  title: string;
  description: string;
  keyword: string;
  category: string;
  type: string;
  reason: string;
  content: string;
  createdAt: string;
  status: string;
}

function renderPreview(draft: Draft, id: string, token: string) {
  const siteUrl = process.env.SITE_URL || 'https://smaplan.com';
  const approveUrl = `${siteUrl}/api/approve-draft?id=${id}&token=${encodeURIComponent(token)}&action=approve`;
  const rejectUrl = `${siteUrl}/api/approve-draft?id=${id}&token=${encodeURIComponent(token)}&action=reject`;

  const contentLen = draft.content.length;
  const minutes = Math.max(1, Math.ceil(contentLen / 500));
  const [y, m, d] = draft.createdAt.split('-');
  const dateStr = `${y}年${Number(m)}月${Number(d)}日`;

  const typeLabel = draft.type === 'kaisen' ? '🌐 回線' : '📱 スマホ';
  const categoryLabels: Record<string, string> = {
    guide: '📖 ガイド', review: '⭐ レビュー',
    comparison: '⚖️ 比較', knowledge: '💡 知識',
  };

  const toc = buildToc(draft.content);
  const bodyHtml = markdownToHtml(draft.content);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>[プレビュー] ${escapeHtml(draft.title)} | えらブック管理</title>
<style>
:root {
  --bg: #ffffff;
  --bg-card: #ffffff;
  --bg-soft: #f8f9fc;
  --text-main: #1a1f36;
  --text-sub: #4a5168;
  --text-muted: #8890a4;
  --accent: #4338ca;
  --accent-hover: #3730a3;
  --accent-light: #f0f0ff;
  --accent-border: #c7c4f3;
  --border: #e8eaf0;
}
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--bg-soft);
  color: var(--text-main);
  font-family: "Noto Sans JP", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  font-weight: 400;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

/* ── Draft banner ── */
.draft-banner {
  position: sticky; top: 0; z-index: 100;
  background: linear-gradient(135deg, #7c3aed 0%, #4338ca 100%);
  color: #fff;
  padding: 12px 20px;
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;
  font-size: 13px;
  box-shadow: 0 2px 12px rgba(67, 56, 202, 0.3);
}
.draft-banner .label {
  font-weight: 700; font-size: 14px;
  background: rgba(255,255,255,0.2); padding: 2px 10px; border-radius: 6px;
}
.draft-banner .meta { opacity: 0.9; }
.draft-actions { display: flex; gap: 8px; }
.draft-actions a {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 8px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 700;
  text-decoration: none; transition: transform 0.1s;
}
.draft-actions a:active { transform: scale(0.97); }
.btn-approve { background: #22c55e; color: #fff; }
.btn-approve:hover { background: #16a34a; }
.btn-reject { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
.btn-reject:hover { background: rgba(255,255,255,0.25); }

/* ── Article container ── */
.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  background: var(--bg);
  min-height: 100vh;
}

/* ── Header ── */
article header { margin-bottom: 24px; }
article h1 {
  font-size: 26px; font-weight: 800; line-height: 1.45;
  margin: 0 0 12px; color: var(--text-main);
}
.post-meta {
  display: flex; flex-wrap: wrap; gap: 14px;
  font-size: 12px; color: var(--text-muted);
  margin-bottom: 12px;
}
.description {
  font-size: 14px; color: var(--text-sub); line-height: 1.7; margin: 0;
}

/* ── TOC ── */
.toc {
  background: var(--accent-light);
  border: 1px solid var(--accent-border);
  border-radius: 12px;
  padding: 16px 20px;
  margin: 0 0 32px;
}
.toc-label {
  font-size: 13px; font-weight: 700;
  color: var(--accent); margin-bottom: 10px;
  letter-spacing: 0.02em;
}
.toc ul {
  margin: 0; padding-left: 20px;
  font-size: 14px; line-height: 1.8;
  color: var(--text-main);
}
.toc li { margin-bottom: 4px; }
.toc a { color: var(--text-main); text-decoration: none; }
.toc a:hover { color: var(--accent); }

/* ── Body ── */
.blog-body h2 {
  font-size: 24px; font-weight: 800; line-height: 1.45;
  margin: 36px 0 18px; color: var(--text-main);
  border-left: 4px solid var(--accent); padding-left: 14px;
  scroll-margin-top: 16px;
}
.blog-body h3 {
  font-size: 18px; font-weight: 700; line-height: 1.5;
  margin: 28px 0 12px; color: var(--text-main);
  border-bottom: 1px solid var(--border); padding-bottom: 8px;
}
.blog-body p {
  font-size: 16px; line-height: 1.85; color: var(--text-main);
  margin: 0 0 24px;
}
.blog-body strong { font-weight: 700; color: var(--accent); }
.blog-body hr {
  border: 0; border-top: 1px solid var(--border); margin: 36px 0 0;
}
.blog-body ul, .blog-body ol {
  font-size: 16px; line-height: 1.85;
  color: var(--text-main);
  margin: 0 0 24px; padding-left: 24px;
}
.blog-body ul li, .blog-body ol li {
  margin-bottom: 8px; padding-left: 4px;
}
.blog-body ul li::marker { color: var(--accent); font-size: 1.1em; }
.blog-body ol li::marker { color: var(--accent); font-weight: 700; }
.blog-body blockquote {
  border-left: 4px solid var(--accent);
  background: var(--accent-light);
  padding: 14px 18px;
  margin: 0 0 24px;
  font-size: 16px; line-height: 1.85;
  color: var(--text-main);
  border-radius: 0 8px 8px 0;
}

/* ── Bottom actions ── */
.bottom-actions {
  margin-top: 40px;
  padding: 24px;
  background: var(--accent-light);
  border: 2px solid var(--accent-border);
  border-radius: 16px;
  text-align: center;
}
.bottom-actions p {
  font-size: 14px; color: var(--text-sub); margin: 0 0 16px;
}
.bottom-actions .btns { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
.bottom-actions a {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 12px 24px; border-radius: 10px;
  font-size: 14px; font-weight: 700;
  text-decoration: none; transition: transform 0.1s;
}
.bottom-actions a:active { transform: scale(0.97); }
.bottom-approve { background: var(--accent); color: #fff; }
.bottom-approve:hover { background: var(--accent-hover); }
.bottom-reject { background: var(--bg); color: var(--text-sub); border: 1px solid var(--border); }
.bottom-reject:hover { background: var(--bg-soft); }

@media (max-width: 600px) {
  .draft-banner { flex-direction: column; align-items: flex-start; }
  article h1 { font-size: 22px; }
  .blog-body h2 { font-size: 20px; }
}
</style>
</head>
<body>

<div class="draft-banner">
  <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
    <span class="label">📋 ドラフトプレビュー</span>
    <span class="meta">${typeLabel} / ${categoryLabels[draft.category] || draft.category} · ${escapeHtml(draft.keyword)} · ${contentLen}文字 · 約${minutes}分</span>
  </div>
  <div class="draft-actions">
    <a href="${escapeHtml(approveUrl)}" class="btn-approve">✅ 承認して公開</a>
    <a href="${escapeHtml(rejectUrl)}" class="btn-reject">❌ 却下</a>
  </div>
</div>

<div class="container">
  <article>
    <header>
      <h1>${escapeHtml(draft.title)}</h1>
      <div class="post-meta">
        <span>📅 ${dateStr}</span>
        <span>📖 約${minutes}分で読めます</span>
        <span>🔑 ${escapeHtml(draft.keyword)}</span>
      </div>
      <p class="description">${escapeHtml(draft.description)}</p>
    </header>

    ${toc}

    <div class="blog-body">
      ${bodyHtml}
    </div>
  </article>

  <div class="bottom-actions">
    <p>この記事を公開しますか？</p>
    <div class="btns">
      <a href="${escapeHtml(approveUrl)}" class="bottom-approve">✅ 承認して公開</a>
      <a href="${escapeHtml(rejectUrl)}" class="bottom-reject">❌ 却下する</a>
    </div>
  </div>
</div>

</body>
</html>`;
}
