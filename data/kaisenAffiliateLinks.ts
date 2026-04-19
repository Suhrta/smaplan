const kaisenAffiliateLinks: Record<string, string> = {
  // アフィリエイトリンクが確定したら追加
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
  return kaisenAffiliateLinks[id] ?? kaisenOfficialLinks[id] ?? "#";
}
