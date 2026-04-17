import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import plans from '@/data/plans.json';
import contents from '@/data/carrier-contents.json';
import { getLink } from '@/data/affiliateLinks';
import { SiteHeader } from '../../components/SiteHeader';

type Plan = (typeof plans)[number];
type Content = {
  merits: string[];
  demerits: string[];
  recommended_for: string[];
  summary: string;
};
const contentsMap = contents as Record<string, Content>;

export const dynamicParams = false;

export function generateStaticParams() {
  return plans.map(p => ({ slug: p.id }));
}

function findPlan(slug: string): Plan | undefined {
  return plans.find(p => p.id === slug);
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const plan = findPlan(slug);
  if (!plan) return {};
  const title = `${plan.plan_name}のメリット・デメリット | スマプラン`;
  const dataLabel = plan.data_gb === 999 ? '無制限' : `${plan.data_gb}GB`;
  const description = `${plan.carrier}「${plan.plan_name}」（月${plan.monthly_cost.toLocaleString()}円 / ${dataLabel}）のメリット・デメリットを中立的に解説。10問のAI診断で本当にあなたに合うプランを無料で確認できます。`;
  return {
    title,
    description,
    alternates: { canonical: `https://smaplan.com/carrier/${plan.id}` },
    openGraph: {
      title,
      description,
      url: `https://smaplan.com/carrier/${plan.id}`,
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

export default async function CarrierDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plan = findPlan(slug);
  if (!plan) notFound();
  const content = contentsMap[slug];
  if (!content) notFound();

  const dataLabel = plan.data_gb === 999 ? '無制限' : `${plan.data_gb}GB`;
  const related = plans.filter(p => p.carrier_parent === plan.carrier_parent && p.id !== plan.id).slice(0, 6);
  const affiliateHref = getLink(plan.affiliate_key);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${plan.plan_name}のメリット・デメリット`,
    description: content.summary,
    author: { '@type': 'Organization', name: 'スマプラン' },
    publisher: { '@type': 'Organization', name: 'スマプラン' },
    mainEntityOfPage: `https://smaplan.com/carrier/${plan.id}`,
    about: {
      '@type': 'Product',
      name: plan.plan_name,
      brand: { '@type': 'Brand', name: plan.carrier },
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
        <Link href="/carriers" style={{ color: 'var(--text-sub)', textDecoration: 'none' }}>プラン一覧</Link>
        <span style={{ margin: '0 6px' }}>/</span>
        <span>{plan.plan_name}</span>
      </nav>

      <section style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '24px 20px', marginBottom: 24,
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
          {plan.carrier_parent} / {plan.carrier}
        </div>
        <h1 style={{
          fontSize: 26, fontWeight: 800, lineHeight: 1.4,
          margin: '0 0 16px', color: 'var(--text-main)',
        }}>
          {plan.plan_name}のメリット・デメリット
        </h1>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8,
          padding: '12px 14px', background: 'var(--accent-light)',
          borderRadius: 10, marginBottom: 12,
        }}>
          <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--accent)' }}>
            {plan.monthly_cost.toLocaleString()}
          </span>
          <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>円/月</span>
          {plan.monthly_cost_min_with_discounts && (
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-sub)' }}>
              各種割引適用時 最安 {plan.monthly_cost_min_with_discounts.toLocaleString()}円
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{
            fontSize: 12, padding: '4px 10px',
            background: 'var(--bg)', color: 'var(--text-sub)',
            borderRadius: 6, border: '1px solid var(--border)',
          }}>📊 {dataLabel}</span>
          <span style={{
            fontSize: 12, padding: '4px 10px',
            background: 'var(--bg)', color: 'var(--text-sub)',
            borderRadius: 6, border: '1px solid var(--border)',
          }}>📞 {plan.call_included}</span>
          <span style={{
            fontSize: 12, padding: '4px 10px',
            background: 'var(--bg)', color: 'var(--text-sub)',
            borderRadius: 6, border: '1px solid var(--border)',
          }}>📡 {plan.network}</span>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)' }}>
          {content.summary}
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{
          fontSize: 20, fontWeight: 700, margin: '0 0 14px',
          color: 'var(--text-main)',
        }}>
          ✅ メリット
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
              }}>✓</span>
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
          ⚠️ デメリット
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
              ✔ {r}
            </li>
          ))}
        </ul>
      </section>

      <section style={{
        display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32,
      }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', minHeight: 52,
            background: 'var(--accent)', color: '#fff',
            borderRadius: 12, textDecoration: 'none',
            fontSize: 16, fontWeight: 700,
            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
          }}
        >
          🤖 AI診断で自分に合うプランを探す
        </Link>
        <a
          href={affiliateHref}
          target="_blank"
          rel="sponsored noopener"
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
      </section>

      {related.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{
            fontSize: 18, fontWeight: 700, margin: '0 0 12px',
            color: 'var(--text-main)',
          }}>
            {plan.carrier_parent}の他プランと料金比較
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
                  }}>プラン</th>
                  <th style={{
                    padding: '10px 8px', textAlign: 'right',
                    fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>月額</th>
                  <th style={{
                    padding: '10px 12px', textAlign: 'right',
                    fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>データ</th>
                </tr>
              </thead>
              <tbody>
                {[plan, ...related].map((p, i, arr) => {
                  const isCurrent = p.id === plan.id;
                  const isLast = i === arr.length - 1;
                  const dLabel = p.data_gb === 999 ? '無制限' : `${p.data_gb}GB`;
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
                            }}>▶ 表示中</span>
                            {p.plan_name}
                          </span>
                        ) : (
                          <Link
                            href={`/carrier/${p.id}`}
                            style={{ color: 'var(--text-main)', textDecoration: 'none' }}
                          >
                            {p.plan_name}
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
                        {p.monthly_cost.toLocaleString()}円
                      </td>
                      <td style={{
                        ...cellBase,
                        textAlign: 'right',
                        fontSize: 12, color: 'var(--text-sub)',
                        whiteSpace: 'nowrap',
                      }}>
                        {dLabel}
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
          href="/carriers"
          style={{
            fontSize: 13, color: 'var(--text-sub)',
            textDecoration: 'underline',
          }}
        >
          すべてのプラン一覧を見る →
        </Link>
      </div>
      </main>
    </>
  );
}
