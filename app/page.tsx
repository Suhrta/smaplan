import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from './components/SiteHeader';
import blogPosts from '@/data/blog-posts.json';

export const metadata: Metadata = {
  title: 'スマートプラン | AIがあなたの固定費を見直します',
  description: 'AIがあなたのスマホ料金・インターネット回線を診断。最適なプランを提案し、年間いくら節約できるかお伝えします。無料・登録不要。',
  openGraph: {
    title: 'スマートプラン | AIがあなたの固定費を見直します',
    description: 'AIがあなたのスマホ料金・インターネット回線を診断。最適なプランを提案します。',
    url: 'https://smaplan.com',
    siteName: 'スマートプラン',
    locale: 'ja_JP',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'スマートプラン' }],
  },
};

type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  headerImage?: string;
};

export default function PortalPage() {
  const posts = (blogPosts as BlogPost[])
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 6);

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <SiteHeader />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #f8f9fc 0%, #eef1f8 100%)',
        padding: 'clamp(60px, 10vw, 120px) 0 clamp(48px, 8vw, 100px)',
      }}>
        <div className="sp-container" style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 999,
            background: 'var(--accent-light)', border: '1px solid var(--accent-border)',
            fontSize: 12, fontWeight: 500, color: 'var(--accent)',
            marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d9f5f' }} />
            無料で診断
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 700, lineHeight: 1.35,
            margin: '0 0 16px', color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}>
            AIがあなたの<br />固定費を見直します
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)', color: 'var(--text-sub)',
            margin: '0 auto 48px', lineHeight: 1.8, maxWidth: 480,
          }}>
            スマホ代もネット回線も、10問に答えるだけ。<br />
            あなたにぴったりのプランをAIが提案します。
          </p>

          {/* Service Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            maxWidth: 720,
            margin: '0 auto',
          }}>
            {/* スマホプラン診断 */}
            <Link href="/smaho" style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '36px 28px',
                textAlign: 'center',
                transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
                cursor: 'pointer',
              }}
              className="sp-portal-card"
              >
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: 'var(--accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" />
                  </svg>
                </div>
                <div style={{
                  fontSize: 20, fontWeight: 700, color: 'var(--text-main)',
                  marginBottom: 10,
                }}>
                  スマホプラン診断
                </div>
                <p style={{
                  fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7,
                  margin: '0 0 20px',
                }}>
                  全20プランから最適な1つを提案。<br />
                  年間5万円以上の節約も。
                </p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 14, fontWeight: 700, color: 'var(--accent)',
                }}>
                  診断スタート →
                </span>
              </div>
            </Link>

            {/* 回線プラン診断 */}
            <Link href="/kaisen" style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '36px 28px',
                textAlign: 'center',
                transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
                cursor: 'pointer',
              }}
              className="sp-portal-card"
              >
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: 'var(--accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <circle cx="12" cy="20" r="1" fill="#4338ca" />
                  </svg>
                </div>
                <div style={{
                  fontSize: 20, fontWeight: 700, color: 'var(--text-main)',
                  marginBottom: 10,
                }}>
                  回線プラン診断
                </div>
                <p style={{
                  fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7,
                  margin: '0 0 20px',
                }}>
                  光回線・ホームルーター・WiFiから<br />
                  ベストな回線を提案。
                </p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 14, fontWeight: 700, color: 'var(--accent)',
                }}>
                  診断スタート →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="sp-block" style={{ background: '#fff' }}>
        <div className="sp-container">
          <h2 className="sp-h2">最新の記事</h2>
          <p className="sp-h2-sub">固定費節約に役立つ情報をお届け</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
            marginBottom: 32,
          }}>
            {posts.map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{
                  display: 'block',
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                className="sp-portal-card"
              >
                <div style={{ padding: '20px 20px 24px' }}>
                  <div style={{
                    fontSize: 12, color: 'var(--text-muted)',
                    marginBottom: 8,
                  }}>
                    {post.publishedAt}
                  </div>
                  <div style={{
                    fontSize: 16, fontWeight: 700,
                    color: 'var(--text-main)', lineHeight: 1.5,
                    marginBottom: 8,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {post.title}
                  </div>
                  <div style={{
                    fontSize: 13, color: 'var(--text-sub)',
                    lineHeight: 1.7,
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
          <div style={{ textAlign: 'center' }}>
            <Link href="/blog" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '12px 28px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 14, fontWeight: 600,
              color: 'var(--text-main)',
              textDecoration: 'none',
            }}>
              すべての記事を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '48px 0 36px',
        background: '#0a0e1a',
        color: 'rgba(255,255,255,0.7)',
      }}>
        <div className="sp-container" style={{
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center',
        }}>
          <div style={{
            display: 'flex', gap: 28, flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <Link href="/smaho" style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 500 }}>
              スマホ診断
            </Link>
            <Link href="/kaisen" style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 500 }}>
              回線診断
            </Link>
            <Link href="/carriers" style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 500 }}>
              プラン一覧
            </Link>
            <Link href="/blog" style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 500 }}>
              ブログ
            </Link>
          </div>
          <div style={{
            display: 'flex', gap: 20, flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <Link href="/legal/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              プライバシーポリシー
            </Link>
            <Link href="/legal/terms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              利用規約
            </Link>
            <Link href="/legal/about" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              運営者情報
            </Link>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            本サイトはアフィリエイト広告（PR）を含みます。掲載情報は各事業者の公開情報に基づきますが、最新性・正確性を保証するものではありません。
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            © {new Date().getFullYear()} スマートプラン
          </div>
        </div>
      </footer>
    </div>
  );
}
