import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import plans from '@/data/kaisen-plans.json';
import contents from '@/data/kaisen-contents.json';
import { getKaisenLink, getKaisenImpression } from '@/data/kaisenAffiliateLinks';
import { SiteHeader } from '../../components/SiteHeader';

type Plan = (typeof plans)[number];
type Content = {
  merits: string[];
  demerits: string[];
  recommended_for: string[];
  summary: string;
};
const contentsMap = contents as Record<string, Content>;

const targetPlans = [
  'docomo_hikari', 'softbank_hikari', 'au_hikari', 'nuro_hikari',
  'gmobb_hikari', 'rakuten_hikari', 'biglobe_hikari',
  'docomo_home5g', 'softbank_air', 'wimax_home',
];

export const dynamicParams = false;

export function generateStaticParams() {
  return targetPlans.map(id => ({ slug: id }));
}

function findPlan(slug: string): Plan | undefined {
  return plans.find(p => p.id === slug);
}

function typeLabel(type: string): string {
  switch (type) {
    case 'hikari': return '光回線';
    case 'home_router': return 'ホームルーター';
    case 'mobile_wifi': return 'モバイルWiFi';
    default: return type;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const plan = findPlan(slug);
  if (!plan) return {};
  const title = `${plan.name}のメリット・デメリット | スマートプラン`;
  const description = `${plan.provider_parent}「${plan.name}」（戸建て月${plan.monthly_cost_house.toLocaleString()}円 / マンション月${plan.monthly_cost_mansion.toLocaleString()}円 / 最大${plan.max_speed}）のメリット・デメリットを中立的に解説。AIが最適な回線プランを無料で診断します。`;
  return {
    title,
    description,
    alternates: { canonical: `https://smaplan.com/kaisen/${plan.id}` },
    openGraph: {
      title,
      description,
      url: `https://smaplan.com/kaisen/${plan.id}`,
      type: 'article',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

export default async function KaisenDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plan = findPlan(slug);
  if (!plan) notFound();
  const content = contentsMap[slug];
  if (!content) notFound();

  const related = plans.filter(p => p.type === plan.type && p.id !== plan.id && targetPlans.includes(p.id)).slice(0, 6);
  const affiliateHref = getKaisenLink(plan.id);
  const impressionSrc = getKaisenImpression(plan.id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${plan.name}のメリット・デメリット`,
    description: content.summary,
    author: { '@type': 'Organization', name: 'スマートプラン' },
    publisher: { '@type': 'Organization', name: 'スマートプラン' },
    mainEntityOfPage: `https://smaplan.com/kaisen/${plan.id}`,
    about: {
      '@type': 'Product',
      name: plan.name,
      brand: { '@type': 'Brand', name: plan.provider_parent },
    },
  };

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 40px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        <Link href="/" style={{ color: 'var(--text-sub)', textDecoration: 'none' }}>ホーム</Link>
        <span style={{ margin: '0 6px' }}>/</span>
        <Link href="/kaisen" style={{ color: 'var(--text-sub)', textDecoration: 'none' }}>回線診断</Link>
        <span style={{ margin: '0 6px' }}>/</span>
        <span>{plan.name}</span>
      </nav>

      <section style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '24px 20px', marginBottom: 24,
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
          {plan.provider_parent} / {typeLabel(plan.type)}
        </div>
        <h1 style={{
          fontSize: 26, fontWeight: 800, lineHeight: 1.4,
          margin: '0 0 16px', color: 'var(--text-main)',
        }}>
          {plan.name}のメリット・デメリット
        </h1>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
          marginBottom: 12,
        }}>
          <div style={{
            padding: '12px 14px', background: 'var(--accent-light)',
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', marginBottom: 4 }}>戸建て</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>
                {plan.monthly_cost_house.toLocaleString()}
              </span>
              <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>円/月</span>
            </div>
          </div>
          <div style={{
            padding: '12px 14px', background: 'var(--accent-light)',
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', marginBottom: 4 }}>マンション</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>
                {plan.monthly_cost_mansion.toLocaleString()}
              </span>
              <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>円/月</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{
            fontSize: 12, padding: '4px 10px',
            background: 'var(--bg)', color: 'var(--text-sub)',
            borderRadius: 6, border: '1px solid var(--border)',
          }}>最大 {plan.max_speed}</span>
          <span style={{
            fontSize: 12, padding: '4px 10px',
            background: 'var(--bg)', color: 'var(--text-sub)',
            borderRadius: 6, border: '1px solid var(--border)',
          }}>実測 {plan.typical_speed}</span>
          {plan.construction_required ? (
            <span style={{
              fontSize: 12, padding: '4px 10px',
              background: 'var(--bg)', color: 'var(--text-sub)',
              borderRadius: 6, border: '1px solid var(--border)',
            }}>工事あり</span>
          ) : (
            <span style={{
              fontSize: 12, padding: '4px 10px',
              background: 'var(--success-light)', color: 'var(--success)',
              borderRadius: 6, border: '1px solid var(--border)',
            }}>工事不要</span>
          )}
          {plan.smartphone_discount.length > 0 && (
            <span style={{
              fontSize: 12, padding: '4px 10px',
              background: 'var(--bg)', color: 'var(--text-sub)',
              borderRadius: 6, border: '1px solid var(--border)',
            }}>{plan.smartphone_discount.join('・')}セット割</span>
          )}
        </div>

        {plan.cashback && plan.cashback !== 'なし' && (
          <div style={{
            padding: '10px 14px', background: '#fef3c7',
            borderRadius: 8, marginBottom: 12,
            fontSize: 13, color: '#92400e', fontWeight: 600,
          }}>
            🎁 キャッシュバック特典あり — 詳細は公式サイトへ
          </div>
        )}

        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)' }}>
          {content.summary}
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{
          fontSize: 20, fontWeight: 700, margin: '0 0 14px',
          color: 'var(--text-main)',
        }}>
          メリット
        </h2>
        <ul style={{
          listStyle: 'none', padding: 0, margin: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 12,
          overflow: 'hidden',
        }}>
          {content.merits.map((m, i) => (
            <li key={i} style={{
              padding: '14px 16px',
              borderBottom: i === content.merits.length - 1 ? 'none' : '1px solid var(--border)',
              fontSize: 14, lineHeight: 1.75, color: 'var(--text-main)',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <span style={{
                flexShrink: 0,
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--success-light)',
                color: 'var(--success)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
                marginTop: 1,
              }}>&#x2713;</span>
              <span style={{ flex: 1 }}>{m}</span>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{
          fontSize: 20, fontWeight: 700, margin: '0 0 14px',
          color: 'var(--text-main)',
        }}>
          デメリット
        </h2>
        <ul style={{
          listStyle: 'none', padding: 0, margin: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 12,
          overflow: 'hidden',
        }}>
          {content.demerits.map((d, i) => (
            <li key={i} style={{
              padding: '14px 16px',
              borderBottom: i === content.demerits.length - 1 ? 'none' : '1px solid var(--border)',
              fontSize: 14, lineHeight: 1.75, color: 'var(--text-main)',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <span style={{
                flexShrink: 0,
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--warning-light)',
                color: 'var(--warning)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
                marginTop: 1,
              }}>!</span>
              <span style={{ flex: 1 }}>{d}</span>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{
          fontSize: 20, fontWeight: 700, margin: '0 0 14px',
          color: 'var(--text-main)',
        }}>
          こんな人におすすめ
        </h2>
        <ul style={{
          listStyle: 'none', padding: 0, margin: 0,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {content.recommended_for.map((r, i) => (
            <li key={i} style={{
              padding: '12px 16px', background: 'var(--accent-light)',
              border: '1px solid var(--border)', borderRadius: 10,
              fontSize: 14, color: 'var(--text-main)', fontWeight: 500,
            }}>
              {r}
            </li>
          ))}
        </ul>
      </section>

      <section style={{
        display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32,
      }}>
        <Link
          href="/kaisen"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', minHeight: 52,
            background: 'var(--accent)', color: '#fff',
            borderRadius: 12, textDecoration: 'none',
            fontSize: 16, fontWeight: 700,
            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
          }}
        >
          AI診断で自分に合う回線を探す
        </Link>
        <a
          href={affiliateHref}
          target="_blank"
          rel="nofollow noopener sponsored"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', minHeight: 48,
            background: 'var(--bg-card)', color: 'var(--accent)',
            border: '2px solid var(--accent)',
            borderRadius: 12, textDecoration: 'none',
            fontSize: 15, fontWeight: 700,
          }}
        >
          公式サイトで詳細を見る →
        </a>
        {impressionSrc && (
          <img src={impressionSrc} width={1} height={1} alt="" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
        )}
      </section>

      {related.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{
            fontSize: 18, fontWeight: 700, margin: '0 0 12px',
            color: 'var(--text-main)',
          }}>
            同じタイプの回線と料金比較
          </h2>
          <div style={{
            overflowX: 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse', fontSize: 13,
            }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  <th style={{
                    padding: '10px 12px', textAlign: 'left',
                    fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
                    borderBottom: '1px solid var(--border)',
                  }}>回線</th>
                  <th style={{
                    padding: '10px 8px', textAlign: 'right',
                    fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>戸建て</th>
                  <th style={{
                    padding: '10px 8px', textAlign: 'right',
                    fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>マンション</th>
                  <th style={{
                    padding: '10px 12px', textAlign: 'right',
                    fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>最大速度</th>
                </tr>
              </thead>
              <tbody>
                {[plan, ...related].map((p, i, arr) => {
                  const isCurrent = p.id === plan.id;
                  const isLast = i === arr.length - 1;
                  const cellBase = {
                    padding: '12px 12px',
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    background: isCurrent ? 'var(--accent-light)' : 'transparent',
                  } as const;
                  return (
                    <tr key={p.id}>
                      <td style={{
                        ...cellBase,
                        fontSize: 13, fontWeight: isCurrent ? 700 : 600,
                        color: 'var(--text-main)',
                      }}>
                        {isCurrent ? (
                          <span>
                            <span style={{
                              fontSize: 10, fontWeight: 800,
                              color: 'var(--accent)',
                              marginRight: 6,
                              verticalAlign: 'middle',
                            }}>&#x25B6; 表示中</span>
                            {p.name}
                          </span>
                        ) : (
                          <Link
                            href={`/kaisen/${p.id}`}
                            style={{ color: 'var(--text-main)', textDecoration: 'none' }}
                          >
                            {p.name}
                          </Link>
                        )}
                      </td>
                      <td style={{
                        ...cellBase,
                        padding: '12px 8px',
                        textAlign: 'right',
                        fontSize: 13, fontWeight: 700,
                        color: 'var(--accent)',
                        whiteSpace: 'nowrap',
                      }}>
                        {p.monthly_cost_house.toLocaleString()}円
                      </td>
                      <td style={{
                        ...cellBase,
                        padding: '12px 8px',
                        textAlign: 'right',
                        fontSize: 13, fontWeight: 700,
                        color: 'var(--accent)',
                        whiteSpace: 'nowrap',
                      }}>
                        {p.monthly_cost_mansion.toLocaleString()}円
                      </td>
                      <td style={{
                        ...cellBase,
                        textAlign: 'right',
                        fontSize: 12, color: 'var(--text-sub)',
                        whiteSpace: 'nowrap',
                      }}>
                        {p.max_speed}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div style={{ textAlign: 'center' }}>
        <Link
          href="/kaisen"
          style={{
            fontSize: 13, color: 'var(--text-sub)',
            textDecoration: 'underline',
          }}
        >
          回線プラン診断に戻る
        </Link>
      </div>
      </main>
    </>
  );
}
