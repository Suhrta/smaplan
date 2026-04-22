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
  gmobb_hikari: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+B8US4Y+50+3IBBPD",
    impression: "https://www18.a8.net/0.gif?a8mat=4B1OTT+B8US4Y+50+3IBBPD",
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
  plaio_wimax: {
    link: "https://h.accesstrade.net/sp/cc?rk=0100pzk500or4w",
    impression: "",
  },
};

const kaisenOfficialLinks: Record<string, string> = {
  docomo_hikari: "https://www.docomo.ne.jp/hikari/",
  softbank_hikari: "https://www.softbank.jp/internet/sbhikari/",
  au_hikari: "https://www.au.com/internet/",
  nuro_hikari: "https://www.nuro.jp/",
  rakuten_hikari: "https://network.mobile.rakuten.co.jp/hikari/",
  gmobb_hikari: "https://gmobb.jp/lp/gmohikari/",
  biglobe_hikari: "https://join.biglobe.ne.jp/ftth/hikari/",
  otegaru_hikari: "https://otegal.jp/",
  sonet_hikari: "https://www.so-net.ne.jp/access/hikari/collabo/",
  docomo_home5g: "https://www.docomo.ne.jp/home_5g/",
  softbank_air: "https://www.softbank.jp/internet/air/",
  wimax_home: "https://www.uqwimax.jp/wimax/",
  wimax_mobile: "https://www.uqwimax.jp/wimax/",
  rakuten_pocket_wifi: "https://network.mobile.rakuten.co.jp/product/internet/rakuten-wifi-pocket/",
  eo_hikari: "https://eonet.jp/",
  plaio_wimax: "https://plaio.net/",
};

export function getKaisenLink(id: string): string {
  return kaisenAffiliateLinks[id]?.link ?? kaisenOfficialLinks[id] ?? "#";
}

export function getKaisenImpression(id: string): string | null {
  return kaisenAffiliateLinks[id]?.impression ?? null;
}
