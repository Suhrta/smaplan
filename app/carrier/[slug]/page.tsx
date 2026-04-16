import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import plans from '@/data/plans.json';
import contents from '@/data/carrier-contents.json';
import { getLink } from '@/data/affiliateLinks';

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
  const description = `${plan.carrier}「${plan.plan_name}」（月${plan.monthly_cost.toLocaleString()}円 / ${dataLabel}）のメリット・デメリットを中立的に解説。9問のAI診断で本当にあなたに合うプランを無料で確認できます。`;
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

function Header() {
  return (
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
  );
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
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 40px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

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
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {content.merits.map((m, i) => (
            <li key={i} style={{
              padding: '16px 18px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 12,
              fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)',
            }}>
              <span style={{ fontWeight: 700, color: 'var(--success)', marginRight: 6 }}>{i + 1}.</span>
              {m}
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
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {content.demerits.map((d, i) => (
            <li key={i} style={{
              padding: '16px 18px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 12,
              fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)',
            }}>
              <span style={{ fontWeight: 700, color: '#B45309', marginRight: 6 }}>{i + 1}.</span>
              {d}
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
            {plan.carrier_parent}の他のプラン
          </h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {related.map(r => (
              <Link
                key={r.id}
                href={`/carrier/${r.id}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 10,
                  textDecoration: 'none', color: 'var(--text-main)',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{r.plan_name}</span>
                <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>
                  {r.monthly_cost.toLocaleString()}円/月
                </span>
              </Link>
            ))}
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
  );
}
