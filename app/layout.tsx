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
  title: "スマートプラン｜スマホ料金・ネット回線をAIが無料診断【2026年】",
  description: "スマホ料金もネット回線も、10問の質問に答えるだけでAIが最適プランを診断。全36プランから年間いくら節約できるかわかります。完全無料・登録不要・30秒で結果表示。",
  openGraph: {
    title: "スマートプラン｜スマホ料金・ネット回線をAIが無料診断【2026年】",
    description: "10問でAIが最適なスマホ・ネット回線プランを診断。全36プランから年間の節約額がわかります。",
    url: "https://smaplan.com",
    siteName: "スマートプラン",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "スマートプラン｜スマホ料金・ネット回線をAIが無料診断",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "スマートプラン｜スマホ料金・ネット回線をAIが無料診断【2026年】",
    description: "10問でAIが最適なスマホ・ネット回線プランを診断。全36プランから年間の節約額がわかります。",
    images: ["/og-image.png"],
  },
  verification: {
    google: "5Jtg1aOY0TlsPNeyVZD8LGBoByK93AgaVqLKAzI8i68",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1657546819928079"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
