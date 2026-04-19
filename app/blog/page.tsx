import type { Metadata } from 'next';
import Link from 'next/link';
import posts from '@/data/blog-posts.json';
import { SiteHeader } from '../components/SiteHeader';

export const metadata: Metadata = {
  title: 'ブログ｜スマホ料金・節約・乗り換えの最新情報 | スマプラン',
  description: 'スマホ料金の節約術、格安SIMへの乗り換え手順、キャリア比較など、スマホ料金にまつわる役立つ記事をまとめています。',
  alternates: { canonical: 'https://smaplan.com/blog' },
  openGraph: {
    title: 'ブログ｜スマホ料金・節約・乗り換えの最新情報 | スマプラン',
    description: 'スマホ料金にまつわる役立つ記事をまとめています。',
    url: 'https://smaplan.com/blog',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ブログ｜スマホ料金・節約・乗り換えの最新情報 | スマプラン',
    description: 'スマホ料金にまつわる役立つ記事をまとめています。',
    images: ['/og-image.png'],
  },
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
}

export default function BlogIndexPage() {
  const sorted = [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 40px' }}>
      <nav style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        <Link href="/" style={{ color: 'var(--text-sub)', textDecoration: 'none' }}>ホーム</Link>
        <span style={{ margin: '0 6px' }}>/</span>
        <span>ブログ</span>
      </nav>

      <h1 style={{
        fontSize: 26, fontWeight: 800, lineHeight: 1.4,
        margin: '0 0 8px', color: 'var(--text-main)',
      }}>
        ブログ
      </h1>
      <p style={{
        fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7,
        margin: '0 0 24px',
      }}>
        スマホ料金の節約術や乗り換え手順、キャリア比較など、役立つ記事をまとめています。
      </p>

      <div style={{ display: 'grid', gap: 12 }}>
        {sorted.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{
              display: 'flex', gap: 14, padding: '14px 16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 12,
              textDecoration: 'none', color: 'var(--text-main)',
            }}
          >
            <img
              src={(post as typeof post & { headerImage?: string }).headerImage ?? `/blog/${post.slug}.png`}
              alt=""
              width={88}
              height={88}
              loading="lazy"
              decoding="async"
              style={{
                width: 88, height: 88,
                objectFit: 'cover',
                borderRadius: 8,
                flexShrink: 0,
                background: 'var(--accent-light)',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                {formatDate(post.publishedAt)}
              </div>
              <div style={{
                fontSize: 16, fontWeight: 700, lineHeight: 1.45,
                marginBottom: 6, color: 'var(--text-main)',
              }}>
                {post.title}
              </div>
              <div style={{
                fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {post.description}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '14px 32px', minHeight: 52,
            background: 'var(--accent)', color: '#fff',
            borderRadius: 12, textDecoration: 'none',
            fontSize: 16, fontWeight: 700,
            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
          }}
        >
          🤖 AI診断を試す →
        </Link>
      </div>
      </main>
    </>
  );
}
