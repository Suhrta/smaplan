import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'スマホ料金診断｜AIが最安プランを無料で提案【2026年最新】| スマートプラン',
  description:
    '10問答えるだけでAIがあなたに最適なスマホプランを診断。ドコモ・au・ソフトバンク・格安SIM全20プランから年間いくら節約できるか無料でわかります。登録不要・30秒で完了。',
  alternates: { canonical: 'https://smaplan.com/smaho' },
  openGraph: {
    title: 'スマホ料金診断｜AIが最安プランを無料で提案【2026年最新】',
    description:
      '10問でAIがあなたに最適なスマホプランを診断。全20プランから年間の節約額がわかります。',
    url: 'https://smaplan.com/smaho',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'スマホ料金診断｜AIが最安プランを無料で提案【2026年最新】',
    description:
      '10問でAIがあなたに最適なスマホプランを診断。全20プランから年間の節約額がわかります。',
    images: ['/og-image.png'],
  },
};

export default function SmahoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
