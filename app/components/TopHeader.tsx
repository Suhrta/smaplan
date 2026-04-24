'use client';

import { useState } from 'react';
import Link from 'next/link';

export function TopHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="border-b border-[#f0f0f0] bg-[#fafafa] px-4 py-1 text-center text-[11px] leading-[1.5] text-[#888]">
        本サイトはアフィリエイト広告（PR）を含みます。
        <Link
          href="/legal/about"
          className="ml-1.5 text-[#555] underline underline-offset-2"
        >
          運営者情報
        </Link>
      </div>
      <header className="sticky top-0 z-50 border-b border-[#e8e8e8] bg-white/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 no-underline"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
                fill="#4338ca"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-lg font-black tracking-tight text-[#1a1a2e]">
              SmartPlan
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <a
              href="#service"
              className="px-3 py-2 text-sm text-[#555] transition-colors hover:text-[#4338ca]"
            >
              サービスの特徴
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-2 text-sm text-[#555] transition-colors hover:text-[#4338ca]"
            >
              使い方
            </a>
            <Link
              href="/blog"
              className="px-3 py-2 text-sm text-[#555] no-underline transition-colors hover:text-[#4338ca]"
            >
              ブログ
            </Link>
            <a
              href="#faq"
              className="px-3 py-2 text-sm text-[#555] transition-colors hover:text-[#4338ca]"
            >
              よくある質問
            </a>
            <a
              href="#service"
              className="ml-3 rounded-lg bg-[#4338ca] px-5 py-2 text-sm font-bold text-white transition-all hover:bg-[#3730a3]"
            >
              無料で診断する
            </a>
          </nav>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#555] transition-colors hover:bg-[#f5f5f5] md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="メニュー"
            aria-expanded={open}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
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

        {open && (
          <nav className="border-t border-[#e8e8e8] bg-white px-4 py-3 md:hidden">
            <a
              href="#service"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#333] no-underline hover:bg-[#f8f7ff]"
            >
              サービスの特徴
            </a>
            <a
              href="#how-it-works"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#333] no-underline hover:bg-[#f8f7ff]"
            >
              使い方
            </a>
            <Link
              href="/blog"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-[#333] no-underline hover:bg-[#f8f7ff]"
            >
              ブログ
            </Link>
            <a
              href="#service"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-lg bg-[#4338ca] px-3 py-2.5 text-center text-[15px] font-bold text-white no-underline"
            >
              無料で診断する
            </a>
          </nav>
        )}
      </header>
    </>
  );
}
