import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="sp-site-header">
      <div className="sp-site-header-inner">
        <Link href="/" className="sp-site-logo">
          <span>スマプラン</span>
          <span className="sp-site-logo-en">SmaPlan</span>
        </Link>
        <nav className="sp-site-nav" aria-label="グローバル">
          <Link href="/carriers" className="sp-nav-link">
            <span className="sp-nav-label-full">プラン一覧</span>
            <span className="sp-nav-label-short">プラン</span>
          </Link>
          <Link href="/blog" className="sp-nav-link">ブログ</Link>
          <Link href="/" className="sp-nav-cta">無料診断</Link>
        </nav>
      </div>
    </header>
  );
}

export function LogoHeader({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: compact ? '20px 0 12px' : '28px 0 20px' }}>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 6,
          fontSize: compact ? 22 : 26,
          fontWeight: 700,
          color: 'var(--accent)',
          letterSpacing: '0.02em',
          textDecoration: 'none',
        }}
      >
        <span>スマプラン</span>
        <span style={{ fontSize: compact ? 11 : 12, color: 'var(--text-sub)', fontWeight: 500 }}>
          SmaPlan
        </span>
      </Link>
    </div>
  );
}
