// 料金データの確認日表示。verified_at が空（未確認）のときは何も出さない
export function formatVerifiedAt(verifiedAt: string | undefined | null): string | null {
  if (!verifiedAt) return null;
  const [y, m, d] = verifiedAt.split('-').map(Number);
  if (!y || !m || !d) return null;
  return `${y}年${m}月${d}日`;
}

// 複数プランを並べるページ用：最も古い確認日を出す（全件確認済みのときだけ）
export function oldestVerifiedAt(items: Array<{ verified_at?: string }>): string | null {
  if (items.length === 0 || items.some(i => !i.verified_at)) return null;
  return items.map(i => i.verified_at!).sort()[0];
}

export function VerifiedNote({
  verifiedAt,
  sourceUrl,
  style,
}: {
  verifiedAt: string | undefined | null;
  sourceUrl?: string;
  style?: React.CSSProperties;
}) {
  const label = formatVerifiedAt(verifiedAt);
  if (!label) return null;
  return (
    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px', ...style }}>
      料金確認日：{label}
      {sourceUrl && (
        <>
          （
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
            公式サイト
          </a>
          の公開情報）
        </>
      )}
      。最新の料金・キャンペーンは公式サイトでご確認ください。
    </p>
  );
}
