import kaisenPlans from "./kaisen-plans.json";

type AffiliateEntry = {
  link: string;
  impression: string;
};

const kaisenAffiliateLinks: Record<string, AffiliateEntry> = {
  docomo_hikari: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+AUKDMA+3SPO+NU729",
    impression: "https://www11.a8.net/0.gif?a8mat=4B1OTT+AUKDMA+3SPO+NU729",
  },
  softbank_hikari: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+B1PKVM+348K+1BNYOX",
    impression: "https://www19.a8.net/0.gif?a8mat=4B1OTT+B1PKVM+348K+1BNYOX",
  },
  au_hikari: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+AVR8TU+50+64C3K1",
    impression: "https://www13.a8.net/0.gif?a8mat=4B1OTT+AVR8TU+50+64C3K1",
  },
  nuro_hikari: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+AZXA2A+2VMU+67Z9T",
    impression: "https://www18.a8.net/0.gif?a8mat=4B1OTT+AZXA2A+2VMU+67Z9T",
  },
  gmobb_hikari: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+B8US4Y+50+3H48S2",
    impression: "https://www14.a8.net/0.gif?a8mat=4B1OTT+B8US4Y+50+3H48S2",
  },
  biglobe_hikari: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+AWCOFM+3HKU+1BNYOX",
    impression: "https://www10.a8.net/0.gif?a8mat=4B1OTT+AWCOFM+3HKU+1BNYOX",
  },
  softbank_air: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+ARL7LE+3SPO+3N1I8Y",
    impression: "https://www10.a8.net/0.gif?a8mat=4B1OTT+ARL7LE+3SPO+3N1I8Y",
  },
  wimax_home: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+B5VM42+B4+2BHEG1",
    impression: "https://www14.a8.net/0.gif?a8mat=4B1OTT+B5VM42+B4+2BHEG1",
  },
  wimax_mobile: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+B72HBM+1QFI+2NCKJ6",
    impression: "https://www12.a8.net/0.gif?a8mat=4B1OTT+B72HBM+1QFI+2NCKJ6",
  },
  eo_hikari: {
    link: "https://h.accesstrade.net/sp/cc?rk=0100q48c00or4w",
    impression: "",
  },
};

// 公式サイトURLは kaisen-plans.json の source_url（料金確認に使ったページ）を正とする
const kaisenOfficialLinks: Record<string, string> = Object.fromEntries(
  kaisenPlans.map(p => [p.id, p.source_url]),
);

export function getKaisenLink(id: string): string {
  return kaisenAffiliateLinks[id]?.link ?? kaisenOfficialLinks[id] ?? "#";
}

export function getKaisenImpression(id: string): string | null {
  return kaisenAffiliateLinks[id]?.impression || null;
}

export function isKaisenAffiliate(id: string): boolean {
  return id in kaisenAffiliateLinks;
}
