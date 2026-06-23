import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import plans from '@/data/plans.json';
import { SiteHeader } from '../../../components/SiteHeader';
import { Breadcrumb } from '../../../components/Breadcrumb';

type Plan = (typeof plans)[number];

// データ容量帯ごとの「最安」ランキングページ。
// 検索意図: 「20GB 最安」「3GB 格安SIM」「無制限 スマホ 安い」など
const TIERS: { slug: string; label: string; heading: string; match: (gb: number) => boolean }[] = [
  { slug: '3gb', label: '3GB', heading: '3GB', match: (g) => g <= 3 },
  { slug: '5gb', label: '5GB', heading: '5GB前後', match: (g) => g >= 4 && g <= 7 },
  { slug: '10gb', label: '10GB', heading: '10GB前後', match: (g) => g >= 8 && g <= 14 },
  { slug: '20gb', label: '20GB', heading: '20GB前後', match: (g) => g >= 15 && g <= 25 },
  { slug: '30gb', label: '30GB', heading: '30GB前後', match: (g) => g >= 26 && g <= 45 },
  { slug: '50gb', label: '50GB以上', heading: '50GB以上の大容量', match: (g) => g >= 46 && g !== 999 },
  { slug: 'unlimited', label: 'データ無制限', heading: 'データ無制限', match: (g) => g === 999 },
];

export const dynamicParams = false;

export function generateStaticParams() {
  return TIERS.map((t) => ({ gb: t.slug }));
}

function findTier(slug: string) {
  return TIERS.find((t) => t.slug === slug);
}

function effectivePrice(p: Plan): number {
  return p.monthly_cost_min_with_discounts ?? p.monthly_cost;
}

function rankedPlans(tier: (typeof TIERS)[number]): Plan[] {
  return plans
    .filter((p) => tier.match(p.data_gb))
    .sort((a, b) => effectivePrice(a) - effectivePrice(b));
}

export async function generateMetadata(
  { params }: { params: Promise<{ gb: string }> },
): Promise<Metadata> {
  const { gb } = await params;
  const tier = findTier(gb);
  if (!tier) return {};
  const ranked = rankedPlans(tier);
  const cheapest = ranked[0];
  const title = `${tier.label}のスマホ料金 最安比較ランキング【2026年最新】| スマートプラン`;
  const description = cheapest
    ? `${tier.label}でおすすめのスマホ料金プランを安い順に比較。最安は${cheapest.carrier}の月${effectivePrice(cheapest).toLocaleString()}円〜。${ranked.length}プランの料金・特徴を中立的にまとめました。`
    : `${tier.label}のスマホ料金プランを安い順に比較。`;
  return {
    title,
    description,
    alternates: { canonical: `https://smaplan.com/smaho/data/${tier.slug}` },
    openGraph: {
      title,
      description,
      url: `https://smaplan.com/smaho/data/${tier.slug}`,
      type: 'website',
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

export default async function DataTierPage({
  params,
}: {
  params: Promise<{ gb: string }>;
}) {
  const { gb } = await params;
  const tier = findTier(gb);
  if (!tier) notFound();
  const ranked = rankedPlans(tier);
  const others = TIERS.filter((t) => t.slug !== tier.slug);

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${tier.label}のスマホ料金 最安ランキング`,
    numberOfItems: ranked.length,
    itemListElement: ranked.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://smaplan.com/carrier/${p.id}`,
      name: p.plan_name,
    })),
  };

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 40px' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />

        <Breadcrumb items={[
          { label: 'ホーム', href: '/' },
          { label: 'プラン一覧', href: '/carriers' },
          { label: `${tier.label}で比較` },
        ]} />

        <h1 style={{
          fontSize: 26, fontWeight: 800, lineHeight: 1.4,
          margin: '0 0 8px', color: 'var(--text-main)',
        }}>
          {tier.label}のスマホ料金 最安比較ランキング【2026年最新】
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7, margin: '0 0 24px' }}>
          {tier.heading}で使えるスマホ料金プランを、月額料金の安い順に{ranked.length}件まとめました。
          料金は割引適用後の最安値を基準に比較しています。迷ったら
          <Link href="/smaho" style={{ color: 'var(--accent)', fontWeight: 700 }}>10問のAI診断</Link>
          で自分に最適なプランを確認できます。
        </p>

        <div style={{ display: 'grid', gap: 10 }}>
          {ranked.map((p, i) => {
            const dataLabel = p.data_gb === 999 ? '無制限' : `${p.data_gb}GB`;
            const price = effectivePrice(p);
            return (
              <Link
                key={p.id}
                href={`/carrier/${p.id}`}
                style={{
                  display: 'block', padding: '14px 16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 12,
                  textDecoration: 'none', color: 'var(--text-main)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{
                      flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                      background: i < 3 ? 'var(--accent)' : 'var(--border)',
                      color: i < 3 ? '#fff' : 'var(--text-sub)',
                      fontSize: 13, fontWeight: 800,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>{i + 1}</span>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{p.carrier}</div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{p.plan_name}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>
                      {price.toLocaleString()}
                      <span style={{ fontSize: 11, fontWeight: 600 }}>円/月〜</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>{dataLabel}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.5 }}>{p.target}</div>
              </Link>
            );
          })}
        </div>

        {ranked.length === 0 && (
          <p style={{ fontSize: 14, color: 'var(--text-sub)' }}>
            該当するプランが見つかりませんでした。<Link href="/carriers" style={{ color: 'var(--accent)' }}>プラン一覧</Link>をご覧ください。
          </p>
        )}

        <section style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px', color: 'var(--accent)', borderLeft: '4px solid var(--accent)', paddingLeft: 10 }}>
            他のデータ容量で探す
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {others.map((t) => (
              <Link
                key={t.slug}
                href={`/smaho/data/${t.slug}`}
                style={{
                  padding: '8px 14px', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 999,
                  fontSize: 13, textDecoration: 'none', color: 'var(--text-main)',
                }}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </section>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link
            href="/smaho"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '14px 32px', minHeight: 52,
              background: 'var(--accent)', color: '#fff',
              borderRadius: 12, textDecoration: 'none',
              fontSize: 16, fontWeight: 700,
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
            }}
          >
            🤖 AI診断で自分に合うプランを探す →
          </Link>
        </div>
      </main>
    </>
  );
}
