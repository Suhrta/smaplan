import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ネット回線診断｜AIが最適な光回線・WiFiを無料で提案【2026年最新】| スマートプラン',
  description:
    '10問答えるだけでAIがあなたに最適なネット回線を診断。光回線・ホームルーター・モバイルWiFi全16プランの料金・速度を比較。キャッシュバック情報込みで無料診断。',
  alternates: { canonical: 'https://smaplan.com/kaisen' },
  openGraph: {
    title: 'ネット回線診断｜AIが最適な光回線・WiFiを無料で提案【2026年最新】',
    description:
      '10問でAIが最適なネット回線を診断。光回線・ホームルーター全16プランの料金・速度を比較。',
    url: 'https://smaplan.com/kaisen',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ネット回線診断｜AIが最適な光回線・WiFiを無料で提案【2026年最新】',
    description:
      '10問でAIが最適なネット回線を診断。光回線・ホームルーター全16プランの料金・速度を比較。',
    images: ['/og-image.png'],
  },
};

export default function KaisenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
