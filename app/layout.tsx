import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const GA_ID = "G-RZ1FHYE0ZG";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: false,
  variable: "--font-noto",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smaplan.com"),
  title: "スマプラン | AIがあなたに最適なスマホ料金プランを無料診断",
  description: "10の質問に答えるだけ。AIがあなたの使い方にぴったりのスマホプランを診断し、年間いくら節約できるかお伝えします。全キャリア対応・無料・登録不要。",
  openGraph: {
    title: "スマプラン | AIがあなたに最適なスマホ料金プランを無料診断",
    description: "10の質問に答えるだけ。AIがあなたの使い方にぴったりのスマホプランを診断します。",
    url: "https://smaplan.com",
    siteName: "スマプラン",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "スマプラン - AIがあなたに最適なスマホプランを無料診断",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "スマプラン | AIがあなたに最適なスマホ料金プランを無料診断",
    description: "10の質問に答えるだけ。AIがあなたの使い方にぴったりのスマホプランを診断します。",
    images: ["/og-image.png"],
  },
  verification: {
    google: "5Jtg1aOY0TlsPNeyVZD8LGBoByK93AgaVqLKAzI8i68",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
