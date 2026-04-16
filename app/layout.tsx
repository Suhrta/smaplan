import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "スマプラン | AIがあなたに最適なスマホ料金プランを無料診断",
  description: "9つの質問に答えるだけ。AIがあなたの使い方にぴったりのスマホプランを診断し、年間いくら節約できるかお伝えします。全キャリア対応・無料・登録不要。",
  openGraph: {
    title: "スマプラン | AIがあなたに最適なスマホ料金プランを無料診断",
    description: "9つの質問に答えるだけ。AIがあなたの使い方にぴったりのスマホプランを診断します。",
    url: "https://smaplan.com",
    siteName: "スマプラン",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "スマプラン | AIがあなたに最適なスマホ料金プランを無料診断",
    description: "9つの質問に答えるだけ。AIがあなたの使い方にぴったりのスマホプランを診断します。",
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
      </head>
      <body>{children}</body>
    </html>
  );
}
