import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from './components/SiteHeader';

export const metadata: Metadata = {
  title: 'ページが見つかりません | スマートプラン',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <div className="mb-4 text-5xl">📱</div>
        <div className="mb-2 text-[15px] font-black text-[#4338ca]">404</div>
        <h1 className="mb-3 text-xl font-bold text-[#333]">ページが見つかりません</h1>
        <p className="mb-8 text-sm leading-relaxed text-[#666]">
          お探しのページは削除されたか、URLが変更された可能性があります。
        </p>
        <div className="flex flex-col items-center gap-2.5">
          <Link
            href="/"
            className="inline-block rounded-full bg-[#4338ca] px-6 py-2.5 text-sm font-bold text-white no-underline transition-opacity hover:opacity-90"
          >
            トップへもどる
          </Link>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
            <Link href="/smaho" className="text-[#4338ca] underline underline-offset-2">スマホ診断</Link>
            <Link href="/kaisen" className="text-[#4338ca] underline underline-offset-2">回線診断</Link>
            <Link href="/carriers" className="text-[#4338ca] underline underline-offset-2">プラン一覧</Link>
            <Link href="/blog" className="text-[#4338ca] underline underline-offset-2">ブログ</Link>
          </div>
        </div>
      </main>
    </>
  );
}
