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

function readingMinutes(content: string) {
  return Math.max(1, Math.ceil(content.length / 500));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};
  const title = `${post.title} | スマプラン`;
  const ogImage = `/blog/${post.slug}.png`;
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
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: post.description,
      images: [ogImage],
    },
  };
}

type Block =
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'blockquote'; text: string };

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
    if (line.startsWith('> ')) {
      flushPara();
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        buf.push(lines[i].slice(2).trim());
        i++;
      }
      blocks.push({ kind: 'blockquote', text: buf.join(' ') });
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
    if (/^\d+\.\s/.test(line)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, '').trim());
        i++;
      }
      blocks.push({ kind: 'ol', items });
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
    nodes.push(
      <strong
        key={`${keyPrefix}-s-${idx++}`}
        style={{ fontWeight: 700, color: 'var(--accent)' }}
      >
        {m[1]}
      </strong>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const BLOG_BODY_CSS = `
.sp-blog-body ul, .sp-blog-body ol {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-main);
  margin: 0 0 24px;
  padding-left: 24px;
}
.sp-blog-body ul li, .sp-blog-body ol li {
  margin-bottom: 8px;
  padding-left: 4px;
}
.sp-blog-body ul li::marker {
  color: var(--accent);
  font-size: 1.1em;
}
.sp-blog-body ol li::marker {
  color: var(--accent);
  font-weight: 700;
}
`;

function renderBlocksWithMidCta(blocks: Block[], midCtaH2Index: number) {
  const out: React.ReactNode[] = [];
  let h2Count = 0;
  let ctaInserted = false;
  blocks.forEach((b, i) => {
    if (b.kind === 'h2') {
      h2Count++;
      // Insert mid-CTA before the h2 that comes AFTER the target index
      if (!ctaInserted && midCtaH2Index > 0 && h2Count === midCtaH2Index + 1) {
        out.push(
          <div key={`midcta-${i}`} style={{
            textAlign: 'center',
            margin: '32px 0',
            padding: '16px 12px',
            borderTop: '1px dashed var(--accent-border)',
            borderBottom: '1px dashed var(--accent-border)',
          }}>
            <Link href="/" style={{
              fontSize: 14, fontWeight: 700,
              color: 'var(--accent)',
              textDecoration: 'none',
            }}>
              💡 あなたのスマホ代、最適ですか？→ <span style={{ textDecoration: 'underline' }}>無料で診断する</span>
            </Link>
          </div>
        );
        ctaInserted = true;
      }
      if (h2Count > 1) {
        out.push(
          <hr
            key={`hr-${i}`}
            style={{
              border: 0,
              borderTop: '1px solid var(--border)',
              margin: '36px 0 0',
            }}
          />
        );
      }
      out.push(
        <h2
          key={i}
          id={`section-${h2Count}`}
          style={{
            fontSize: 24, fontWeight: 800, lineHeight: 1.45,
            margin: '36px 0 18px', color: 'var(--text-main)',
            borderLeft: '4px solid var(--accent)', paddingLeft: 14,
            scrollMarginTop: 16,
          }}
        >
          {b.text}
        </h2>
      );
      return;
    }
    if (b.kind === 'h3') {
      out.push(
        <h3 key={i} style={{
          fontSize: 18, fontWeight: 700, lineHeight: 1.5,
          margin: '28px 0 12px', color: 'var(--text-main)',
          borderBottom: '1px solid var(--border)', paddingBottom: 8,
        }}>
          {b.text}
        </h3>
      );
      return;
    }
    if (b.kind === 'p') {
      out.push(
        <p key={i} style={{
          fontSize: 15, lineHeight: 1.8, color: 'var(--text-main)',
          margin: '0 0 24px',
        }}>
          {renderInline(b.text, `p${i}`)}
        </p>
      );
      return;
    }
    if (b.kind === 'blockquote') {
      out.push(
        <blockquote key={i} style={{
          borderLeft: '4px solid var(--accent)',
          background: 'var(--accent-light)',
          padding: '14px 18px',
          margin: '0 0 24px',
          fontSize: 15, lineHeight: 1.8,
          color: 'var(--text-main)',
          borderRadius: '0 8px 8px 0',
        }}>
          {renderInline(b.text, `bq${i}`)}
        </blockquote>
      );
      return;
    }
    if (b.kind === 'ul') {
      out.push(
        <ul key={i}>
          {b.items.map((it, j) => (
            <li key={j}>{renderInline(it, `li${i}-${j}`)}</li>
          ))}
        </ul>
      );
      return;
    }
    out.push(
      <ol key={i}>
        {b.items.map((it, j) => (
          <li key={j}>{renderInline(it, `li${i}-${j}`)}</li>
        ))}
      </ol>
    );
  });
  return out;
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  const blocks = parseMarkdown(post.content);
  const h2List = blocks
    .filter((b): b is Extract<Block, { kind: 'h2' }> => b.kind === 'h2')
    .map((b, i) => ({ id: `section-${i + 1}`, text: b.text }));
  const showToc = h2List.length >= 2;
  const midCtaH2Index = h2List.length >= 3 ? 2 : 0;
  const minutes = readingMinutes(post.content);

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
      <style dangerouslySetInnerHTML={{ __html: BLOG_BODY_CSS }} />
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
        <img
          src={`/blog/${post.slug}.png`}
          alt={post.title}
          width={1200}
          height={630}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            aspectRatio: '1200 / 630',
            borderRadius: 12,
            marginBottom: 20,
            background: 'var(--accent-light)',
          }}
          loading="eager"
          decoding="async"
        />
        <header style={{ marginBottom: 24 }}>
          <h1 style={{
            fontSize: 26, fontWeight: 800, lineHeight: 1.45,
            margin: '0 0 12px', color: 'var(--text-main)',
          }}>
            {post.title}
          </h1>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 14,
            fontSize: 12, color: 'var(--text-muted)',
            marginBottom: 12,
          }}>
            <span>📅 {formatDate(post.publishedAt)}</span>
            <span>📖 約{minutes}分で読めます</span>
          </div>
          <p style={{
            fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7,
            margin: 0,
          }}>
            {post.description}
          </p>
        </header>

        {showToc && (
          <aside style={{
            background: 'var(--accent-light)',
            border: '1px solid var(--accent-border)',
            borderRadius: 12,
            padding: '16px 20px',
            margin: '0 0 32px',
          }}>
            <div style={{
              fontSize: 13, fontWeight: 700,
              color: 'var(--accent)', marginBottom: 10,
              letterSpacing: '0.02em',
            }}>
              📋 この記事でわかること
            </div>
            <ul style={{
              margin: 0, paddingLeft: 20,
              fontSize: 14, lineHeight: 1.8,
              color: 'var(--text-main)',
            }}>
              {h2List.map(h => (
                <li key={h.id} style={{ marginBottom: 4 }}>
                  <a href={`#${h.id}`} style={{
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                  }}>
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="sp-blog-body">
          {renderBlocksWithMidCta(blocks, midCtaH2Index)}
        </div>
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
