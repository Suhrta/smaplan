'use client';

import { useState } from 'react';
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
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-[12px]">
      <AffiliateDisclosure />
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between border-b border-[#e8e8e8] px-4 sm:px-6 md:px-8">
        <Link href="/" className="inline-flex items-center gap-1.5 no-underline sm:gap-2">
          <Image src="/logo-28.png" alt="" width={28} height={28} className="block h-6 w-6 sm:h-7 sm:w-7" />
          <span className="text-[18px] font-black tracking-[-1px] sm:text-[24px]" style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>スマートプラン</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="グローバル" className="hidden items-center gap-1 sm:flex">
          <Link href="/smaho" className="px-3 py-2 text-sm text-[#555] transition-colors hover:text-[#4338ca]">スマホ診断</Link>
          <Link href="/kaisen" className="px-3 py-2 text-sm text-[#555] transition-colors hover:text-[#4338ca]">回線診断</Link>
          <Link href="/blog" className="px-3 py-2 text-sm text-[#555] transition-colors hover:text-[#4338ca]">ブログ</Link>
        </nav>

        {/* Hamburger button */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#555] transition-colors hover:bg-[#f5f5f5] sm:hidden"
          onClick={() => setOpen(!open)}
          aria-label="メニュー"
          aria-expanded={open}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? (
              <>
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </>
            ) : (
              <>
                <line x1="3" y1="5" x2="17" y2="5" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="15" x2="17" y2="15" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-b border-[#e8e8e8] bg-white px-4 py-3 sm:hidden">
          <Link href="/smaho" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#333] no-underline transition-colors hover:bg-[#f8f7ff]">スマホ診断</Link>
          <Link href="/kaisen" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#333] no-underline transition-colors hover:bg-[#f8f7ff]">回線診断</Link>
          <Link href="/blog" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#333] no-underline transition-colors hover:bg-[#f8f7ff]">ブログ</Link>
        </nav>
      )}
    </header>
  );
}

export function LogoHeader({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <AffiliateDisclosure />
      <div className={`text-center ${compact ? 'py-5' : 'py-7'}`}>
        <Link href="/" className="inline-flex items-center gap-1.5 no-underline sm:gap-2">
          <Image src="/logo-28.png" alt="" width={28} height={28} className="block h-6 w-6 sm:h-7 sm:w-7" />
          <span className={`font-black tracking-[-1px] ${compact ? 'text-[18px] sm:text-[22px]' : 'text-[20px] sm:text-[24px]'}`} style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            スマートプラン
          </span>
        </Link>
      </div>
    </>
  );
}
