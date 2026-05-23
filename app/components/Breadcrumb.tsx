import Link from 'next/link';

type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `https://smaplan.com${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="パンくずリスト" style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
        {items.map((crumb, i) => (
          <span key={i}>
            {i > 0 && <span style={{ margin: '0 6px' }}>/</span>}
            {crumb.href ? (
              <Link href={crumb.href} style={{ color: '#666', textDecoration: 'none' }}>
                {crumb.label}
              </Link>
            ) : (
              <span>{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
