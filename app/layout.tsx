import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "これよも - あなただけの「はじめの1冊」を見つけよう",
  description: "5つの質問に答えるだけで、AIがあなたにぴったりの小説を3冊推薦します。本を読んだことがない人も、久しぶりに読みたい人も。",
  openGraph: {
    title: "これよも - あなただけの「はじめの1冊」を見つけよう",
    description: "5つの質問に答えるだけで、AIがあなたにぴったりの小説を3冊推薦します。",
    url: "https://erabook.vercel.app",
    siteName: "これよも",
    images: [
      {
        url: "https://erabook.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "これよも",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "これよも - あなただけの「はじめの1冊」を見つけよう",
    description: "5つの質問に答えるだけで、AIがあなたにぴったりの小説を3冊推薦します。",
    images: ["https://erabook.vercel.app/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}