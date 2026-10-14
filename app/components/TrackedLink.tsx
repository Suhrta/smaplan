'use client';

import type { AnchorHTMLAttributes, ComponentProps } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';

type TrackProps = {
  event: string;
  params?: Record<string, unknown>;
};

// サーバーコンポーネントのページ（詳細ページ・/carriers 等）から GA4 イベント付きリンクを置くための薄いラッパー
export function TrackedLink({
  event,
  params,
  onClick,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & TrackProps) {
  return (
    <a
      {...rest}
      onClick={e => {
        track(event, params);
        onClick?.(e);
      }}
    />
  );
}

// サイト内遷移用（next/link 版）
export function TrackedNextLink({
  event,
  params,
  onClick,
  ...rest
}: ComponentProps<typeof Link> & TrackProps) {
  return (
    <Link
      {...rest}
      onClick={e => {
        track(event, params);
        onClick?.(e);
      }}
    />
  );
}
