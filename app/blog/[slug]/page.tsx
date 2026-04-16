import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import posts from '@/data/blog-posts.json';

type Post = (typeof posts)[number];

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }));
}

function findPost(slug: string): Post | undefined {
  return posts.find(p => p.slug === slug);
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};
  const title = `${post.title} | スマプラン`;
  return {
    title,
    description: post.description,
    alternates: { canonical: `https://smaplan.com/blog/${post.slug}` },
    openGraph: {
      title,
      description: post.description,
      url: `https://smaplan.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: post.description,
      images: ['/og-image.png'],
    },
  };
}

type Block =
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] };

function parseMarkdown(md: string): Block[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  let paraBuf: string[] = [];
  const flushPara = () => {
    if (paraBuf.length) {
      blocks.push({ kind: 'p', text: paraBuf.join(' ').trim() });
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
      blocks.push({ kind: 'h3', text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      flushPara();
      blocks.push({ kind: 'h2', text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith('- ')) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2).trim());
        i++;
      }
      blocks.push({ kind: 'ul', items });
      continue;
    }
    paraBuf.push(line.trim());
    i++;
  }
  flushPara();
  return blocks;
}

function renderInline(text: string, keyPrefix: string) {
  const nodes: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(<strong key={`${keyPrefix}-s-${idx++}`} style={{ fontWeight: 700 }}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function MarkdownContent({ md }: { md: string }) {
  const blocks = parseMarkdown(md);
  return (
    <div>
      {blocks.map((b, i) => {
        if (b.kind === 'h2') {
          return (
            <h2 key={i} style={{
              fontSize: 22, fontWeight: 800, lineHeight: 1.45,
              margin: '36px 0 14px', color: 'var(--text-main)',
              borderLeft: '4px solid var(--accent)', paddingLeft: 12,
            }}>
              {b.text}
            </h2>
          );
        }
        if (b.kind === 'h3') {
          return (
            <h3 key={i} style={{
              fontSize: 17, fontWeight: 700, lineHeight: 1.5,
              margin: '24px 0 10px', color: 'var(--text-main)',
            }}>
              {b.text}
            </h3>
          );
        }
        if (b.kind === 'p') {
          return (
            <p key={i} style={{
              fontSize: 15, lineHeight: 1.85, color: 'var(--text-main)',
              margin: '0 0 16px',
            }}>
              {renderInline(b.text, `p${i}`)}
            </p>
          );
        }
        return (
          <ul key={i} style={{
            fontSize: 15, lineHeight: 1.85, color: 'var(--text-main)',
            margin: '0 0 16px', paddingLeft: 22,
          }}>
            {b.items.map((it, j) => (
              <li key={j} style={{ marginBottom: 6 }}>
                {renderInline(it, `li${i}-${j}`)}
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  const related = posts.filter(p => p.slug !== slug).slice(0, 3);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Organization', name: 'スマプラン' },
    publisher: {
      '@type': 'Organization',
      name: 'スマプラン',
      logo: { '@type': 'ImageObject', url: 'https://smaplan.com/og-image.png' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://smaplan.com/blog/${post.slug}`,
    },
    image: 'https://smaplan.com/og-image.png',
  };

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 40px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'baseline', gap: 6,
          fontSize: 22, fontWeight: 700, color: 'var(--accent)',
          letterSpacing: '0.02em', textDecoration: 'none',
        }}>
          <span>スマプラン</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>SmaPlan</span>
        </Link>
      </div>

      <nav style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        <Link href="/" style={{ color: 'var(--text-sub)', textDecoration: 'none' }}>ホーム</Link>
        <span style={{ margin: '0 6px' }}>/</span>
        <Link href="/blog" style={{ color: 'var(--text-sub)', textDecoration: 'none' }}>ブログ</Link>
        <span style={{ margin: '0 6px' }}>/</span>
        <span>{post.title}</span>
      </nav>

      <article>
        <header style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            {formatDate(post.publishedAt)}
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, lineHeight: 1.45,
            margin: '0 0 12px', color: 'var(--text-main)',
          }}>
            {post.title}
          </h1>
          <p style={{
            fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7,
            margin: 0,
          }}>
            {post.description}
          </p>
        </header>

        <MarkdownContent md={post.content} />
      </article>

      <aside style={{
        marginTop: 40,
        background: 'var(--accent)',
        color: '#fff',
        padding: '24px 22px',
        borderRadius: 16,
        textAlign: 'center',
        boxShadow: '0 6px 18px rgba(29, 78, 216, 0.25)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>
          自分にぴったりのプランは？
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.5, marginBottom: 16 }}>
          AIがあなたに最適な<br />スマホプランを無料で診断します
        </div>
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '14px 28px', minHeight: 52,
            background: '#fff', color: 'var(--accent)',
            borderRadius: 12, textDecoration: 'none',
            fontSize: 15, fontWeight: 800,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          あなたに最適なプランを10問で診断 →
        </Link>
      </aside>

      {related.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h2 style={{
            fontSize: 18, fontWeight: 700, margin: '0 0 12px',
            color: 'var(--accent)',
            borderLeft: '4px solid var(--accent)', paddingLeft: 10,
          }}>
            関連記事
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {related.map(r => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                style={{
                  display: 'block', padding: '12px 14px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 12,
                  textDecoration: 'none', color: 'var(--text-main)',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  {formatDate(r.publishedAt)}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.5 }}>
                  {r.title}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Link
          href="/blog"
          style={{
            fontSize: 13, color: 'var(--text-sub)', textDecoration: 'none',
          }}
        >
          ← ブログ一覧に戻る
        </Link>
      </div>
    </main>
  );
}
