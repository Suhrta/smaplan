import type { Metadata } from 'next';
import Link from 'next/link';
import plans from '@/data/plans.json';
import { SiteHeader } from '../components/SiteHeader';
import { Breadcrumb } from '../components/Breadcrumb';

export const metadata: Metadata = {
  title: 'スマホ料金プラン比較一覧｜全20プランの料金・特徴まとめ【2026年最新】',
  description: 'ドコモ・au・ソフトバンク・ahamo・LINEMO・格安SIMなど全20プランの月額料金・データ容量・メリット・デメリットを一覧で比較。あなたに合うプランが10秒で見つかります。',
  alternates: { canonical: 'https://smaplan.com/carriers' },
  openGraph: {
    title: 'スマホ料金プラン比較一覧｜全20プランの料金・特徴まとめ【2026年最新】',
    description: '全20プランの月額料金・データ容量・メリット・デメリットを一覧で比較。',
    url: 'https://smaplan.com/carriers',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'スマホ料金プラン比較一覧｜全20プランの料金・特徴まとめ【2026年最新】',
    description: '全20プランの月額料金・データ容量・メリット・デメリットを一覧で比較。',
    images: ['/og-image.png'],
  },
};

const GROUP_ORDER = ['ドコモ', 'au', 'ソフトバンク', '楽天モバイル'] as const;

function groupPlans(plans: typeof import('@/data/plans.json')) {
  const map = new Map<string, typeof plans>();
  for (const p of plans) {
    const key = p.carrier_parent.startsWith('MVNO') ? 'MVNO' : p.carrier_parent;
    const arr = map.get(key) ?? [];
    arr.push(p);
    map.set(key, arr);
  }
  const ordered: Array<[string, typeof plans]> = [];
  for (const g of GROUP_ORDER) {
    if (map.has(g)) {
      ordered.push([g, map.get(g)!]);
      map.delete(g);
    }
  }
  if (map.has('MVNO')) {
    ordered.push(['MVNO（格安SIM）', map.get('MVNO')!]);
    map.delete('MVNO');
  }
  for (const [k, v] of map) ordered.push([k, v]);
  return ordered;
}

export default function CarriersIndexPage() {
  const groups = groupPlans(plans);
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'スマホ料金プラン一覧',
    numberOfItems: plans.length,
    itemListElement: plans.map((p, i) => ({
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
        { label: 'プラン一覧' },
      ]} />

      <h1 style={{
        fontSize: 26, fontWeight: 800, lineHeight: 1.4,
        margin: '0 0 8px', color: 'var(--text-main)',
      }}>
        スマホ料金プラン一覧
      </h1>
      <p style={{
        fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7,
        margin: '0 0 20px',
      }}>
        主要20プランのメリット・デメリットを中立的にまとめています。<br />
        迷ったら<Link href="/" style={{ color: 'var(--accent)', fontWeight: 700 }}>10問のAI診断</Link>で自分に合うプランを見つけてください。
      </p>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px', color: 'var(--text-main)' }}>
          データ容量から最安を探す
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { slug: '3gb', label: '3GB' },
            { slug: '5gb', label: '5GB' },
            { slug: '10gb', label: '10GB' },
            { slug: '20gb', label: '20GB' },
            { slug: '30gb', label: '30GB' },
            { slug: '50gb', label: '50GB以上' },
            { slug: 'unlimited', label: '無制限' },
          ].map((t) => (
            <Link
              key={t.slug}
              href={`/smaho/data/${t.slug}`}
              style={{
                padding: '8px 14px', background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 999,
                fontSize: 13, fontWeight: 600, textDecoration: 'none', color: 'var(--accent)',
              }}
            >
              {t.label}の最安 →
            </Link>
          ))}
        </div>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {groups.map(([groupName, groupPlans]) => (
          <section key={groupName}>
            <h2 style={{
              fontSize: 18, fontWeight: 700, margin: '0 0 12px',
              color: 'var(--accent)',
              borderLeft: '4px solid var(--accent)', paddingLeft: 10,
            }}>
              {groupName}
            </h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {groupPlans.map(p => {
                const dataLabel = p.data_gb === 999 ? '無制限' : `${p.data_gb}GB`;
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
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', gap: 12, marginBottom: 6,
                    }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
                          {p.carrier}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>
                          {p.plan_name}
                        </div>
                      </div>
                      <div style={{
                        textAlign: 'right', flexShrink: 0,
                      }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>
                          {p.monthly_cost.toLocaleString()}
                          <span style={{ fontSize: 11, fontWeight: 600 }}>円/月</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                          {dataLabel}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      {p.target}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
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
