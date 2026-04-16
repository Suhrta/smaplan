import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_ID = "G-RZ1FHYE0ZG";

export const metadata: Metadata = {
  metadataBase: new URL("https://smaplan.com"),
  title: "スマプラン | AIがあなたに最適なスマホ料金プランを無料診断",
  description: "9つの質問に答えるだけ。AIがあなたの使い方にぴったりのスマホプランを診断し、年間いくら節約できるかお伝えします。全キャリア対応・無料・登録不要。",
  openGraph: {
    title: "スマプラン | AIがあなたに最適なスマホ料金プランを無料診断",
    description: "9つの質問に答えるだけ。AIがあなたの使い方にぴったりのスマホプランを診断します。",
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
    description: "9つの質問に答えるだけ。AIがあなたの使い方にぴったりのスマホプランを診断します。",
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
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
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
