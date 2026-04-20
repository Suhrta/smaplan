import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from './components/SiteHeader';
import { FadeIn } from './components/FadeIn';
import { SavingsChart } from './components/SavingsChart';
import blogPosts from '@/data/blog-posts.json';

export const metadata: Metadata = {
  title: 'スマートプラン | AIがあなたの固定費を見直します',
  description: 'AIがあなたのスマホ料金・インターネット回線を診断。最適なプランを提案し、年間いくら節約できるかお伝えします。無料・登録不要。',
  openGraph: {
    title: 'スマートプラン | AIがあなたの固定費を見直します',
    description: 'AIがあなたのスマホ料金・インターネット回線を診断。最適なプランを提案します。',
    url: 'https://smaplan.com',
    siteName: 'スマートプラン',
    locale: 'ja_JP',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'スマートプラン' }],
  },
};

type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${y}.${m}.${d}`;
}

export default function PortalPage() {
  const posts = (blogPosts as BlogPost[])
    .slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <SiteHeader />

      {/* ───────────────── HERO ───────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #f8f7ff 0%, #ede9fe 40%, #ffffff 100%)',
        }}
      >
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 md:px-8 md:pt-32 md:pb-28">
          <div className="grid items-center gap-16 md:grid-cols-2 md:gap-10 lg:gap-16">
            <div>
              <FadeIn>
                <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#4338ca]">
                  SMART PLAN
                </div>
              </FadeIn>
              <FadeIn delayMs={80}>
                <h1 className="mt-6 text-[44px] leading-[1.1] text-[#111] md:text-[56px] lg:text-[64px]">
                  固定費、ちゃんと<br />見直してますか？
                </h1>
              </FadeIn>
              <FadeIn delayMs={160}>
                <p className="mt-7 max-w-xl text-[15px] leading-[1.9] text-[#555] md:text-[16px]">
                  スマホ代もネット回線も、10問に答えるだけ。
                  <br className="hidden md:inline" />
                  AIがあなたに最適なプランを無料で診断します。
                </p>
              </FadeIn>
              <FadeIn delayMs={240}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link
                    href="/smaho"
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium text-white shadow-[0_4px_16px_rgba(67,56,202,0.2)] transition-all duration-200 hover:shadow-[0_6px_20px_rgba(67,56,202,0.3)] hover:brightness-110"
                    style={{
                      background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                    }}
                  >
                    スマホ診断を始める
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/kaisen"
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium text-white shadow-[0_4px_16px_rgba(67,56,202,0.2)] transition-all duration-200 hover:shadow-[0_6px_20px_rgba(67,56,202,0.3)] hover:brightness-110"
                    style={{
                      background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                    }}
                  >
                    回線診断を始める
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeIn>
            </div>

            <FadeIn delayMs={200}>
              <div className="flex items-center justify-center">
                <SavingsChart />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ──────────────── SERVICE CARDS ──────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:px-8 md:py-32">
        <FadeIn>
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#888]">
            Services
          </div>
          <h2 className="mt-4 text-[28px] font-medium tracking-[-0.01em] text-[#111] md:text-[40px]">
            2つの診断で、固定費をまるごと見直す。
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <FadeIn delayMs={80}>
            <ServiceCard
              href="/smaho"
              label="For Smartphone"
              title="スマホプラン診断"
              description="大手キャリアからサブブランド・格安SIMまで20プラン以上を比較。あなたのデータ使用量から最適な1つを提案します。"
              icon={<PhoneGlyph />}
            />
          </FadeIn>
          <FadeIn delayMs={160}>
            <ServiceCard
              href="/kaisen"
              label="For Internet"
              title="回線プラン診断"
              description="光回線・ホームルーター・モバイルWiFiを住居タイプや使い方から診断。工事の有無まで含めてベストな選択肢を提示します。"
              icon={<WifiGlyph />}
            />
          </FadeIn>
        </div>
      </section>

      {/* ──────────────── STATS ──────────────── */}
      <section
        className="border-y border-[#e8e8e8]"
        style={{
          background: 'linear-gradient(180deg, #fafafe 0%, #ffffff 100%)',
        }}
      >
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
          <div className="grid gap-12 text-center md:grid-cols-3">
            {[
              { num: '34', caption: '比較できるプラン' },
              { num: '30', unit: '秒', caption: 'たったこれだけ' },
              { num: '0', unit: '円', caption: '完全無料' },
            ].map((s, i) => (
              <FadeIn key={s.num} delayMs={i * 100}>
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-[64px] font-medium leading-none tracking-[-0.03em] md:text-[88px]"
                      style={{
                        background:
                          'linear-gradient(135deg, #4338ca, #7c3aed)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {s.num}
                    </span>
                    {s.unit && (
                      <span className="text-[20px] font-medium text-[#555] md:text-[24px]">
                        {s.unit}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-[#888]">{s.caption}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── HOW IT WORKS ──────────────── */}
      <section
        className="mx-auto max-w-6xl px-6 py-24 md:px-8 md:py-32"
        style={{
          background: 'linear-gradient(180deg, #f8f7ff 0%, #ffffff 100%)',
        }}
      >
        <FadeIn>
          <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#888]">
            How it works
          </div>
          <h2 className="mt-4 text-[28px] font-medium tracking-[-0.01em] text-[#111] md:text-[40px]">
            3ステップで、<br className="md:hidden" />
            最適プランに出会える。
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              n: '01',
              title: '質問に答える',
              desc: 'データ使用量・通話頻度・こだわりなど、10問の質問にチェックするだけ。',
            },
            {
              n: '02',
              title: 'AIが診断',
              desc: '最新のプラン情報をもとに、あなたの使い方に合う候補をAIが抽出します。',
            },
            {
              n: '03',
              title: '最適プランを提案',
              desc: '年間でいくら節約できるかまで含めて、おすすめ上位3プランを提示します。',
            },
          ].map((step, i) => (
            <FadeIn key={step.n} delayMs={i * 100}>
              <div className={i === 1 ? 'md:pt-4' : i === 2 ? 'md:pt-8' : ''}>
                <div className="h-full rounded-2xl border border-[#eeeeee] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(67,56,202,0.08)]">
                  <div
                    className="text-[13px] font-medium tracking-[0.2em]"
                    style={{
                      background:
                        'linear-gradient(135deg, #4338ca, #7c3aed)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {step.n}
                  </div>
                  <h3 className="mt-4 text-[19px] font-medium text-[#111]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.85] text-[#555]">
                    {step.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ──────────────── BLOG LIST ──────────────── */}
      <section
        className="border-t border-[#e8e8e8]"
        style={{
          background: 'linear-gradient(180deg, #fafafe 0%, #ffffff 100%)',
        }}
      >
        <div className="mx-auto max-w-4xl px-6 py-24 md:px-8 md:py-32">
          <FadeIn>
            <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#888]">
              Journal
            </div>
            <h2 className="mt-4 text-[28px] font-medium tracking-[-0.01em] text-[#111] md:text-[40px]">
              最新の記事
            </h2>
          </FadeIn>

          <ul className="mt-14 divide-y divide-[#e8e8e8] border-y border-[#e8e8e8]">
            {posts.map((post, i) => (
              <FadeIn key={post.slug} delayMs={i * 50} as="div">
                <li className="list-none">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex items-start gap-6 py-6 no-underline transition-all duration-200 hover:translate-x-1"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium tracking-[0.15em] text-[#888]">
                        {formatDate(post.publishedAt)}
                      </div>
                      <div className="mt-2 text-[17px] font-medium leading-[1.5] text-[#111] transition-colors group-hover:text-[#4338ca]">
                        {post.title}
                      </div>
                      <p className="mt-1.5 line-clamp-1 text-sm text-[#555]">
                        {post.description}
                      </p>
                    </div>
                    <div className="flex h-8 items-center text-[#888] transition-colors group-hover:text-[#4338ca]">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                </li>
              </FadeIn>
            ))}
          </ul>

          <div className="mt-10 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#4338ca] no-underline transition-colors hover:text-[#3730a3]"
            >
              すべての記事を見る
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer className="border-t border-[#e8e8e8] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12 md:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Link href="/" className="inline-flex items-center gap-2 no-underline">
              <span className="block h-1.5 w-1.5 rounded-full bg-[#4338ca]" />
              <span className="text-[14px] font-medium text-[#111]">スマートプラン</span>
            </Link>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#555]">
              <Link href="/smaho" className="no-underline transition-colors hover:text-[#4338ca]">スマホ診断</Link>
              <Link href="/kaisen" className="no-underline transition-colors hover:text-[#4338ca]">回線診断</Link>
              <Link href="/blog" className="no-underline transition-colors hover:text-[#4338ca]">ブログ</Link>
              <Link href="/legal/privacy" className="no-underline transition-colors hover:text-[#4338ca]">プライバシー</Link>
              <Link href="/legal/terms" className="no-underline transition-colors hover:text-[#4338ca]">利用規約</Link>
              <Link href="/legal/about" className="no-underline transition-colors hover:text-[#4338ca]">運営者情報</Link>
            </nav>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[#e8e8e8] pt-6 text-[11px] text-[#888] md:flex-row">
            <div>本サイトはアフィリエイト広告（PR）を含みます。掲載情報は各事業者の公開情報に基づきます。</div>
            <div>© {new Date().getFullYear()} スマートプラン</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ──────────────── Subcomponents ──────────────── */

type ServiceCardProps = {
  href: string;
  label: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

function ServiceCard({ href, label, title, description, icon }: ServiceCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white p-10 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-[#c4b5fd] hover:shadow-[0_4px_20px_rgba(67,56,202,0.08)]"
    >
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, #a78bfa, #7c3aed, #4338ca)',
        }}
      />
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8f7ff] text-[#4338ca]">
        {icon}
      </div>
      <div className="mt-6 text-[11px] font-medium uppercase tracking-[0.25em] text-[#888]">
        {label}
      </div>
      <h3 className="mt-2 text-[22px] font-medium tracking-[-0.01em] text-[#111]">{title}</h3>
      <p className="mt-4 text-sm leading-[1.9] text-[#555]">{description}</p>
      <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#4338ca] transition-transform group-hover:translate-x-1">
        診断を始める
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function ArrowRight({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function PhoneGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="3" />
      <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" />
    </svg>
  );
}

function WifiGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}
