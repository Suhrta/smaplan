import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    // 販売終了・公式サイト消滅で掲載をやめた回線。回線のトップ（/kaisen）へ恒久リダイレクト
    return ['rakuten_pocket_wifi', 'plaio_wimax'].map(id => ({
      source: `/kaisen/${id}`,
      destination: '/kaisen',
      statusCode: 301 as const,
    }));
  },
};

export default nextConfig;