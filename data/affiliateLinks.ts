import plans from "./plans.json";

type AffiliateEntry = {
  link: string;
  // A8.net 等のインプレッション計測用 1px 画像。無い ASP は空文字
  impression: string;
};

// ASP 提携が通ったらここに追加するだけで、/carriers・詳細ページ・診断結果の CTA が
// アフィリエイトリンクに切り替わる（/carriers では「公式サイトへ」ボタンが自動で出る）
const affiliateLinks: Record<string, AffiliateEntry> = {
  ahamo_30gb: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1MHQ+B5A6IA+4TIO+5ZEMP",
    impression: "",
  },
  ahamo_110gb: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1MHQ+B5A6IA+4TIO+5ZEMP",
    impression: "",
  },
};

// 公式サイトURLは plans.json の source_url（料金確認に使ったページ）を正とする
const officialLinks: Record<string, string> = Object.fromEntries(
  plans.map(p => [p.affiliate_key, p.source_url]),
);

export function getLink(affiliateKey: string): string {
  return affiliateLinks[affiliateKey]?.link ?? officialLinks[affiliateKey] ?? "#";
}

export function isAffiliate(affiliateKey: string): boolean {
  return affiliateKey in affiliateLinks;
}

export function getImpression(affiliateKey: string): string | null {
  return affiliateLinks[affiliateKey]?.impression || null;
}
