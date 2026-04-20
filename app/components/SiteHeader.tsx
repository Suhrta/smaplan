import Image from 'next/image';
import Link from 'next/link';

function AffiliateDisclosure() {
  return (
    <div className="border-b border-[#f0f0f0] bg-[#fafafa] px-4 py-1 text-center text-[11px] leading-[1.5] text-[#888]">
      本サイトはアフィリエイト広告（PR）を含みます。
      <Link href="/legal/about" className="ml-1.5 text-[#555] underline underline-offset-2">
        運営者情報
      </Link>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-[12px]">
      <AffiliateDisclosure />
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between border-b border-[#e8e8e8] px-6 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 no-underline">
          <Image src="/logo-28.png" alt="" width={28} height={28} className="block" />
          <span className="text-[24px] font-black tracking-[-1px]" style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>スマートプラン</span>
        </Link>
        <nav aria-label="グローバル" className="flex items-center gap-1">
          <Link href="/smaho" className="px-3 py-2 text-sm text-[#555] transition-colors hover:text-[#4338ca]">
            <span className="hidden sm:inline">スマホ診断</span>
            <span className="inline sm:hidden">スマホ</span>
          </Link>
          <Link href="/kaisen" className="px-3 py-2 text-sm text-[#555] transition-colors hover:text-[#4338ca]">
            <span className="hidden sm:inline">回線診断</span>
            <span className="inline sm:hidden">回線</span>
          </Link>
          <Link href="/blog" className="px-3 py-2 text-sm text-[#555] transition-colors hover:text-[#4338ca]">
            ブログ
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function LogoHeader({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <AffiliateDisclosure />
      <div className={`text-center ${compact ? 'py-5' : 'py-7'}`}>
        <Link href="/" className="inline-flex items-center gap-2 no-underline">
          <Image src="/logo-28.png" alt="" width={28} height={28} className="block" />
          <span className={`font-black tracking-[-1px] ${compact ? 'text-[22px]' : 'text-[24px]'}`} style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            スマートプラン
          </span>
        </Link>
      </div>
    </>
  );
}
