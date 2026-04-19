type AffiliateEntry = {
  link: string;
  impression: string;
};

const kaisenAffiliateLinks: Record<string, AffiliateEntry> = {
  // ドコモ光 → GMOとくとくBB経由
  docomo_hikari: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+ATYY0I+50+54LG41",
    impression: "https://www12.a8.net/0.gif?a8mat=4B1OTT+ATYY0I+50+54LG41",
  },
  // ソフトバンク光 → GMOとくとくBB経由
  softbank_hikari: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+AWY41E+50+742JA9",
    impression: "https://www16.a8.net/0.gif?a8mat=4B1OTT+AWY41E+50+742JA9",
  },
  // auひかり → GMOとくとくBB経由
  au_hikari: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+AVR8TU+50+64C3K1",
    impression: "https://www13.a8.net/0.gif?a8mat=4B1OTT+AVR8TU+50+64C3K1",
  },
  // GMOとくとくBB光
  gmobb_hikari: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+B8US4Y+50+3IBBPD",
    impression: "https://www18.a8.net/0.gif?a8mat=4B1OTT+B8US4Y+50+3IBBPD",
  },
  // ビッグローブ光
  biglobe_hikari: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+AWCOFM+3HKU+1BNYOX",
    impression: "https://www10.a8.net/0.gif?a8mat=4B1OTT+AWCOFM+3HKU+1BNYOX",
  },
  // ソフトバンクエアー → GMOとくとくBB経由(ソフトバンク光/エアー共通)
  softbank_air: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+ARL7LE+3SPO+3N1I8Y",
    impression: "https://www10.a8.net/0.gif?a8mat=4B1OTT+ARL7LE+3SPO+3N1I8Y",
  },
  // WiMAX ホームルーター → BIGLOBE WiMAX +5G
  wimax_home: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+B5VM42+B4+2BHEG1",
    impression: "https://www14.a8.net/0.gif?a8mat=4B1OTT+B5VM42+B4+2BHEG1",
  },
  // WiMAX モバイル → BIGLOBE WiMAX +5G
  wimax_mobile: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+B5VM42+B4+2BHEG1",
    impression: "https://www14.a8.net/0.gif?a8mat=4B1OTT+B5VM42+B4+2BHEG1",
  },
  // ドコモ home 5G → GMOとくとくBB経由(ドコモ光と同一代理店)
  docomo_home5g: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+ATYY0I+50+54LG41",
    impression: "https://www12.a8.net/0.gif?a8mat=4B1OTT+ATYY0I+50+54LG41",
  },
  // 楽天ひかり → GMOとくとくBB光で代替(楽天ひかり専用なし)
  rakuten_hikari: {
    link: "https://px.a8.net/svt/ejp?a8mat=4B1OTT+B8US4Y+50+3IBBPD",
    impression: "https://www18.a8.net/0.gif?a8mat=4B1OTT+B8US4Y+50+3IBBPD",
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
};

export function getKaisenLink(id: string): string {
  return kaisenAffiliateLinks[id]?.link ?? kaisenOfficialLinks[id] ?? "#";
}

export function getKaisenImpression(id: string): string | null {
  return kaisenAffiliateLinks[id]?.impression ?? null;
}
