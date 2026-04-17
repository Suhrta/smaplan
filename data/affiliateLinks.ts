const affiliateLinks: Record<string, string> = {
  ahamo_30gb: "https://px.a8.net/svt/ejp?a8mat=4B1MHQ+B5A6IA+4TIO+5ZEMP",
  ahamo_110gb: "https://px.a8.net/svt/ejp?a8mat=4B1MHQ+B5A6IA+4TIO+5ZEMP",
};

const officialLinks: Record<string, string> = {
  docomo_max: "https://www.docomo.ne.jp/charge/docomo_max/",
  docomo_mini_4gb: "https://www.docomo.ne.jp/charge/docomo_mini/",
  docomo_mini_10gb: "https://www.docomo.ne.jp/charge/docomo_mini/",
  ahamo_30gb: "https://ahamo.com/",
  ahamo_110gb: "https://ahamo.com/plan/",
  povo_3gb: "https://povo.jp/",
  povo_20gb: "https://povo.jp/",
  linemo_best_3gb: "https://www.linemo.jp/plan/",
  linemo_best_10gb: "https://www.linemo.jp/plan/",
  linemo_best_v: "https://www.linemo.jp/lp/0000/",
  uq_komikomi_value: "https://www.uqwimax.jp/mobile/newplan/",
  ymobile_simple3_s: "https://www.ymobile.jp/plan/",
  ymobile_simple3_m: "https://www.ymobile.jp/plan/",
  rakuten_saikyo: "https://network.mobile.rakuten.co.jp/fee/saikyo-plan/",
  iijmio_5gb: "https://www.iijmio.jp/gigaplan/",
  iijmio_20gb: "https://www.iijmio.jp/gigaplan/",
  mineo_mypita_15gb: "https://mineo.jp/price/mypita/",
  nichitsu_minna_20gb: "https://www.nihontsushin.com/plan/planminna.html",
  nichitsu_50gb: "https://www.nihontsushin.com/",
  aeon_saiteki_3gb: "https://aeonmobile.jp/plan/",
};

export function getLink(affiliateKey: string): string {
  return affiliateLinks[affiliateKey] ?? officialLinks[affiliateKey] ?? "#";
}
