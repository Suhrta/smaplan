import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { SiteHeader } from './components/SiteHeader';
import { FadeIn } from './components/FadeIn';
import blogPosts from '@/data/blog-posts.json';
import plans from '@/data/plans.json';
import kaisenPlans from '@/data/kaisen-plans.json';
import kaisenContents from '@/data/kaisen-contents.json';

// 実ページがある回線プランのみリンク（404防止）
const kaisenIdsWithPage = new Set(Object.keys(kaisenContents));

export const metadata: Metadata = {
  title: 'スマートプラン｜スマホ料金・ネット回線をAIが無料診断【2026年】',
  description:
    'スマホ料金もネット回線も、10問の質問に答えるだけでAIが最適プランを診断。全36プランから年間いくら節約できるかわかります。完全無料・登録不要・30秒で結果表示。',
  openGraph: {
    title: 'スマートプラン｜スマホ料金・ネット回線をAIが無料診断【2026年】',
    description:
      '10問でAIが最適なスマホ・ネット回線プランを診断。全36プランから年間の節約額がわかります。',
    url: 'https://smaplan.com',
    siteName: 'スマートプラン',
    locale: 'ja_JP',
    type: 'website',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: 'スマートプラン' },
    ],
  },
};

type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  category: string;
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${y}.${m}.${d}`;
}

function getCategoryLabel(slug: string): string {
  if (/hikari|home-router|internet|kaisen/.test(slug)) return '回線プラン';
  if (
    /carrier|ahamo|linemo|uq|ymobile|docomo|sim|mnp|family|switch|new-life/.test(slug)
  )
    return 'スマホプラン';
  return '節約術';
}

function getCategoryColor(label: string) {
  switch (label) {
    case 'スマホプラン':
      return { bg: '#ede9fe', text: '#4338ca' };
    case '回線プラン':
      return { bg: '#dbeafe', text: '#1d4ed8' };
    default:
      return { bg: '#dcfce7', text: '#16a34a' };
  }
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'スマートプラン',
  url: 'https://smaplan.com',
  description: 'AIがあなたのスマホ料金・インターネット回線を診断。最適なプランを提案します。',
  publisher: { '@type': 'Organization', name: 'スマートプラン' },
};

export default function PortalPage() {
  const posts = (blogPosts as BlogPost[])
    .slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <SiteHeader />

      {/* ═══════════════ HERO ═══════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: '#1e1b4b' }}
      >
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          {/* Animated mesh gradient blobs — blue-shifted to match design */}
          <div className="mesh-blob mesh-blob-1" style={{ width: 650, height: 650, top: '-15%', left: '-10%', background: 'radial-gradient(circle, #3730a3 0%, transparent 70%)' }} />
          <div className="mesh-blob mesh-blob-2" style={{ width: 550, height: 550, top: '5%', right: '-8%', background: 'radial-gradient(circle, #5b21b6 0%, transparent 70%)' }} />
          <div className="mesh-blob mesh-blob-3" style={{ width: 600, height: 600, bottom: '-20%', left: '25%', background: 'radial-gradient(circle, #4338ca 0%, transparent 70%)' }} />
          <div className="mesh-blob mesh-blob-4" style={{ width: 450, height: 450, top: '35%', left: '55%', background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
          {/* Bright accent highlights */}
          <div className="mesh-blob mesh-blob-2" style={{ width: 350, height: 350, top: '0%', left: '40%', background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)', opacity: 0.45 }} />
          <div className="mesh-blob mesh-blob-3" style={{ width: 400, height: 400, bottom: '5%', right: '15%', background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', opacity: 0.4 }} />
          <div className="mesh-blob mesh-blob-1" style={{ width: 300, height: 300, top: '60%', left: '5%', background: 'radial-gradient(circle, #a5b4fc 0%, transparent 70%)', opacity: 0.3 }} />
          {/* Sparse particles */}
          <span className="absolute left-[8%] top-[20%] block h-1 w-1 rounded-full bg-white/20 anim-float-slow" />
          <span className="absolute left-[25%] top-[70%] block h-1.5 w-1.5 rounded-full bg-white/15 anim-float-med" />
          <span className="absolute left-[45%] top-[15%] block h-1 w-1 rounded-full bg-white/25 anim-float-fast" />
          <span className="absolute left-[65%] top-[55%] block h-[5px] w-[5px] rounded-full bg-white/10 anim-float-slow" />
          <span className="absolute left-[80%] top-[25%] block h-1 w-1 rounded-full bg-white/20 anim-float-med" />
          <span className="absolute left-[90%] top-[75%] block h-1.5 w-1.5 rounded-full bg-white/15 anim-float-fast" />
          <span className="absolute left-[35%] top-[40%] block h-1 w-1 rounded-full bg-white/25 anim-float-med" />
          <span className="absolute left-[72%] top-[8%] block h-1.5 w-1.5 rounded-full bg-white/10 anim-float-fast" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6 md:px-8 md:pt-20 md:pb-16">
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
            <div>
              <FadeIn>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-2 sm:text-[13px]">
                  <ShieldSmall />
                  AIが固定費を最適化する無料診断サービス
                </span>
              </FadeIn>
              <FadeIn delayMs={80}>
                <h1 className="mt-6 text-[32px] font-bold leading-[1.15] tracking-tight text-white sm:mt-8 sm:text-[48px] md:text-[56px]">
                  そのプラン、
                  <br />
                  もっと最適に。
                </h1>
              </FadeIn>
              <FadeIn delayMs={160}>
                <p className="mt-5 text-[14px] leading-[1.9] text-white/75 sm:mt-6 sm:max-w-lg sm:text-[15px] md:text-[16px]">
                  AIがあなたにぴったりの<br className="sm:hidden" />スマホプラン・回線プランを提案。<br className="sm:hidden" />10問の質問に答えるだけで、<br className="sm:hidden" />最適な1つをお届けします。
                </p>
              </FadeIn>
              <FadeIn delayMs={240}>
                <div className="mt-7 sm:mt-8">
                  <a
                    href="#service"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-[14px] font-bold text-[#4338ca] shadow-[0_4px_24px_rgba(0,0,0,0.15)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(67,56,202,0.4),0_8px_32px_rgba(0,0,0,0.2)] hover:scale-[1.02] sm:inline-flex sm:w-auto sm:px-8 sm:text-[15px]"
                  >
                    無料で最適プランを診断する
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-white/60 sm:mt-4 sm:justify-start sm:text-sm">
                  <CheckCircleIcon />
                  完全無料・登録不要・1分で完了
                </p>
              </FadeIn>
            </div>

            <FadeIn delayMs={200}>
              <div className="relative flex items-center justify-center py-2 sm:py-6 md:py-8">
                {/* Background glows */}
                <div className="absolute h-[200px] w-[200px] rounded-full bg-white/8 blur-[60px] sm:h-[300px] sm:w-[300px] sm:blur-[80px]" aria-hidden />
                <div className="absolute h-[140px] w-[140px] rounded-full bg-[#a5b4fc]/15 blur-[50px] sm:h-[200px] sm:w-[200px]" aria-hidden />

                {/* Dotted orbit lines */}
                <svg className="absolute h-[260px] w-[260px] sm:h-[380px] sm:w-[380px] md:h-[440px] md:w-[440px] anim-dash-drift" viewBox="0 0 200 200" fill="none" aria-hidden>
                  <ellipse cx="100" cy="100" rx="92" ry="88" stroke="white" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 6" />
                </svg>
                <svg className="absolute h-[210px] w-[210px] sm:h-[310px] sm:w-[310px] md:h-[360px] md:w-[360px]" viewBox="0 0 200 200" fill="none" aria-hidden style={{ transform: 'rotate(25deg)' }}>
                  <ellipse cx="100" cy="100" rx="90" ry="82" stroke="white" strokeOpacity="0.06" strokeWidth="1" strokeDasharray="3 8" />
                </svg>

                {/* Person illustration */}
                <div className="relative z-[1]">
                  <Image
                    src="/hero/person.png"
                    alt="スマホを持つビジネスマン"
                    width={1040}
                    height={1040}
                    className="h-[320px] w-auto sm:h-[440px] md:h-[520px]"
                    priority
                  />
                </div>

                {/* Card — スマホプラン (top-right) */}
                <div className="absolute right-2 -top-2 z-10 anim-float-slow sm:-right-12 sm:-top-10 lg:-right-10">
                  <Image
                    src="/hero/1.png"
                    alt="スマホプラン — データ・通話を比較"
                    width={520}
                    height={520}
                    className="h-[150px] w-auto sm:h-[180px] md:h-[200px] drop-shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                  />
                </div>

                {/* Card — 回線プラン (middle-left) */}
                <div className="absolute -left-2 top-[25%] z-10 anim-float-med sm:-left-16 lg:-left-14">
                  <div>
                    <Image
                      src="/hero/3.png"
                      alt="回線プラン — 光回線を比較"
                      width={520}
                      height={520}
                      className="h-[150px] w-auto sm:h-[180px] md:h-[200px] drop-shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                    />
                  </div>
                </div>

                {/* Card — AIおすすめ (bottom-right) */}
                <div className="absolute right-0 -bottom-2 z-10 anim-float-fast sm:-right-14 lg:-right-12">
                  <div>
                    <Image
                      src="/hero/2.png"
                      alt="AIおすすめ — あなたに最適なプランを提案しました"
                      width={520}
                      height={520}
                      className="h-[150px] w-auto sm:h-[180px] md:h-[200px] drop-shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                    />
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════ SERVICE ═══════════════ */}
      <section id="service" className="scroll-mt-20 py-14 sm:py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <FadeIn>
            <div className="text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#888] sm:text-[12px]">
                Service
              </div>
              <h2 className="mt-3 text-[22px] font-bold tracking-tight text-[#111] sm:text-[28px] md:text-[40px]">
                2つの診断で、最適なプランが見つかる
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[14px] leading-[1.8] text-[#555] sm:mt-4 sm:text-[15px]">
                スマホもネット回線も、<br className="sm:hidden" />あなたの使い方に合わせて<br className="sm:hidden" />AIが最適化します。
              </p>
            </div>
          </FadeIn>

          <div className="mt-10 grid gap-6 sm:mt-14 sm:gap-8 md:grid-cols-2">
            <FadeIn delayMs={80}>
              <Link
                href="/smaho"
                className="group block overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white no-underline shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(67,56,202,0.12)]"
              >
                <div className="relative h-[200px] overflow-hidden bg-gradient-to-br from-[#f8f7ff] to-[#ede9fe]">
                  <Image
                    src="/smaho.png"
                    alt="スマホプラン診断"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-4 sm:p-6 md:p-8">
                  <span className="inline-block rounded-full bg-[#ede9fe] px-3 py-1 text-xs font-semibold text-[#4338ca]">
                    スマホプラン診断
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-[#111]">
                    スマホ代を見直したい方へ
                  </h3>
                  <p className="mt-3 text-sm leading-[1.8] text-[#555]">
                    データ使用量や通話時間など、<br className="sm:hidden" />10問の質問であなたに最適な<br className="sm:hidden" />スマホプランを提案します。
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[#f0f0f0] pt-6">
                    <FeatureItem icon={<DevicesIcon />} text={<>大手キャリアから<br />格安SIMまで対応</>} />
                    <FeatureItem icon={<OptimizeIcon />} text={<>料金・データ・通話を<br />総合的に最適化</>} />
                    <FeatureItem icon={<SparkleIcon />} text={<>無駄なく、ムダのない<br />プランをご提案</>} />
                  </div>
                </div>
              </Link>
            </FadeIn>

            <FadeIn delayMs={160}>
              <Link
                href="/kaisen"
                className="group block overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white no-underline shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(67,56,202,0.12)]"
              >
                <div className="relative h-[200px] overflow-hidden bg-gradient-to-br from-[#f8f7ff] to-[#ede9fe]">
                  <Image
                    src="/wifi.png"
                    alt="回線プラン診断"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-4 sm:p-6 md:p-8">
                  <span className="inline-block rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-semibold text-[#1d4ed8]">
                    回線プラン診断
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-[#111]">
                    ネット回線を見直したい方へ
                  </h3>
                  <p className="mt-3 text-sm leading-[1.8] text-[#555]">
                    お住まいや使い方に合わせて、<br className="sm:hidden" />最適な回線プランを提案します。<br className="sm:hidden" />光回線・ホームルーターに対応。
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[#f0f0f0] pt-6">
                    <FeatureItem icon={<WifiFeatureIcon />} text={<>光回線・ホームルーター<br />に幅広く対応</>} />
                    <FeatureItem icon={<CompareIcon />} text={<>通信速度・料金を<br />まとめて比較</>} />
                    <FeatureItem icon={<TargetIcon />} text={<>あなたに最適な回線を<br />1つだけご提案</>} />
                  </div>
                </div>
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section
        id="how-it-works"
        className="scroll-mt-20 py-14 sm:py-20 md:py-28"
        style={{
          background: 'linear-gradient(180deg, #fafafe 0%, #ffffff 100%)',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <FadeIn>
            <div className="text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#888] sm:text-[12px]">
                How it works
              </div>
              <h2 className="mt-3 text-[22px] font-bold tracking-tight text-[#111] sm:text-[28px] md:text-[40px]">
                使い方はとっても簡単、3ステップ
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[14px] leading-[1.8] text-[#555] sm:mt-4 sm:text-[15px]">
                10問の質問に答えるだけで、<br className="sm:hidden" />最適なプランがすぐにわかります。
              </p>
            </div>
          </FadeIn>

          <div className="mt-10 grid items-start gap-2 sm:mt-14 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-6">
            <FadeIn delayMs={80}>
              <StepCard
                num={1}
                icon={<ClipboardIcon />}
                title="10問の質問に回答"
                desc={<>現在の利用状況や希望条件など、<br className="sm:hidden" />簡単な質問に答えます。</>}
              />
            </FadeIn>
            <div className="flex items-center justify-center py-1 md:pt-28 md:py-0" aria-hidden>
              <StepArrow />
            </div>
            <FadeIn delayMs={160}>
              <StepCard
                num={2}
                icon={<BrainIcon />}
                title="AIが最適プランを分析"
                desc={<>あなたの回答をもとに、<br className="sm:hidden" />AIが最適なプランを<br className="sm:hidden" />複数比較・分析します。</>}
              />
            </FadeIn>
            <div className="flex items-center justify-center py-1 md:pt-28 md:py-0" aria-hidden>
              <StepArrow />
            </div>
            <FadeIn delayMs={240}>
              <StepCard
                num={3}
                icon={<CheckBadgeIcon />}
                title="最適な1プランを提案"
                desc={<>あなたにとって最も快適な<br className="sm:hidden" />プランを1つだけご提案します。</>}
              />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════ TRUST ═══════════════ */}
      <section
        className="relative overflow-hidden py-14 sm:py-20 md:py-28"
        style={{
          background:
            'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-32 top-1/3 h-[300px] w-[300px] rounded-full bg-[#4338ca]/30 blur-[80px]" />
          <div className="absolute right-0 bottom-0 h-[250px] w-[250px] rounded-full bg-[#6366f1]/20 blur-[60px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <FadeIn>
            <div className="text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50 sm:text-[12px]">
                Trust
              </div>
              <h2 className="mt-3 text-[22px] font-bold tracking-tight text-white sm:text-[28px] md:text-[40px]">
                多くの方に選ばれています
              </h2>
            </div>
          </FadeIn>

          <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-3 sm:gap-6">
            {[
              {
                icon: <LayersIcon />,
                label: '対応プラン数',
                value: '36',
                suffix: '+',
                sub: 'スマホ・回線合わせて豊富に対応',
              },
              {
                icon: <ClockIcon />,
                label: '診断時間',
                prefix: '約',
                value: '30',
                suffix: '秒',
                sub: '10問に答えるだけの簡単診断',
              },
              {
                icon: <YenIcon />,
                label: '利用料金',
                value: '0',
                suffix: '円',
                sub: '完全無料で何度でも利用可能',
              },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delayMs={i * 100}>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur-md sm:p-8">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white sm:h-12 sm:w-12">
                    {stat.icon}
                  </div>
                  <div className="mt-3 text-[13px] font-medium text-white/70 sm:mt-4 sm:text-sm">
                    {stat.label}
                  </div>
                  <div className="mt-2 flex items-baseline justify-center gap-1">
                    {'prefix' in stat && stat.prefix && (
                      <span className="text-base font-semibold text-white/80 sm:text-lg">
                        {stat.prefix}
                      </span>
                    )}
                    <span className="text-[36px] font-bold leading-none tracking-tight text-white sm:text-[44px] md:text-[56px]">
                      {stat.value}
                    </span>
                    <span className="text-base font-semibold text-white/80 sm:text-lg">
                      {stat.suffix}
                    </span>
                  </div>
                  <div className="mt-2 text-[12px] text-white/50 sm:mt-3 sm:text-[13px]">
                    {stat.sub}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PLANS ═══════════════ */}
      <section className="py-14 sm:py-20 md:py-28" style={{ background: 'linear-gradient(180deg, #fafafe 0%, #ffffff 100%)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <FadeIn>
            <div className="text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#888] sm:text-[12px]">
                Plans
              </div>
              <h2 className="mt-3 text-[22px] font-bold tracking-tight text-[#111] sm:text-[28px] md:text-[40px]">
                プランから探す
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[14px] leading-[1.8] text-[#555] sm:mt-4 sm:text-[15px]">
                気になるスマホ料金プラン・ネット回線を<br className="sm:hidden" />直接チェックできます。
              </p>
            </div>
          </FadeIn>

          <FadeIn delayMs={80}>
            <div className="mt-10 grid gap-8 sm:mt-12 md:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#111]">スマホ料金プラン</h3>
                  <Link href="/carriers" className="text-sm font-semibold text-[#4338ca] no-underline hover:underline">
                    一覧を見る →
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {plans.map((p) => (
                    <Link
                      key={p.id}
                      href={`/carrier/${p.id}`}
                      className="rounded-full border border-[#e0e0e0] bg-white px-3 py-1.5 text-[13px] text-[#333] no-underline transition-colors hover:border-[#4338ca] hover:text-[#4338ca]"
                    >
                      {p.plan_name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-base font-bold text-[#111]">ネット回線プラン</h3>
                <div className="flex flex-wrap gap-2">
                  {kaisenPlans
                    .filter((p) => kaisenIdsWithPage.has(p.id))
                    .map((p) => (
                      <Link
                        key={p.id}
                        href={`/kaisen/${p.id}`}
                        className="rounded-full border border-[#e0e0e0] bg-white px-3 py-1.5 text-[13px] text-[#333] no-underline transition-colors hover:border-[#1d4ed8] hover:text-[#1d4ed8]"
                      >
                        {p.name}
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ BLOG ═══════════════ */}
      <section id="blog" className="scroll-mt-20 py-14 sm:py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <FadeIn>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#888] sm:text-[12px]">
                  Blog
                </div>
                <h2 className="mt-3 text-[22px] font-bold tracking-tight text-[#111] sm:text-[28px] md:text-[40px]">
                  お役立ち記事
                </h2>
                <p className="mt-2 text-[14px] text-[#555] sm:text-[15px]">
                  スマホ代・ネット回線の<br className="sm:hidden" />見直しに役立つ情報をお届けします。
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 self-start rounded-lg border border-[#e0e0e0] px-4 py-2 text-sm font-semibold text-[#333] no-underline transition-colors hover:border-[#4338ca] hover:text-[#4338ca] sm:self-auto"
              >
                ブログ一覧を見る
              </Link>
            </div>
          </FadeIn>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-6 lg:grid-cols-4">
            {posts.map((post, i) => {
              const catLabel = getCategoryLabel(post.slug);
              const catColor = getCategoryColor(catLabel);
              return (
                <FadeIn key={post.slug} delayMs={i * 80}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block overflow-hidden rounded-xl border border-[#e8e8e8] bg-white no-underline shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="relative h-[120px] overflow-hidden bg-[#f0f0f0] sm:h-[150px] lg:aspect-[16/10] lg:h-auto">
                      <Image
                        src={`/blog/${post.slug}.png`}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-semibold sm:px-2 sm:text-[11px]"
                          style={{
                            background: catColor.bg,
                            color: catColor.text,
                          }}
                        >
                          {catLabel}
                        </span>
                        <span className="text-[10px] text-[#888] sm:text-[11px]">
                          {formatDate(post.publishedAt)}
                        </span>
                      </div>
                      <h3 className="mt-2.5 line-clamp-2 text-[13px] font-bold leading-[1.5] text-[#111] transition-colors group-hover:text-[#4338ca] sm:text-[14px]">
                        {post.title}
                      </h3>
                      <p className="mt-1.5 hidden line-clamp-2 text-[12px] leading-[1.7] text-[#777] sm:block">
                        {post.description}
                      </p>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer style={{ background: '#1a1a2e' }}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16 sm:px-6 md:px-8">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 md:grid-cols-4 md:gap-12">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 no-underline"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
                    fill="#6366f1"
                  />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-lg font-black tracking-tight text-white">
                  SmartPlan
                </span>
              </Link>
              <p className="mt-4 max-w-[220px] text-sm leading-[1.8] text-white/50">
                AIがあなたの固定費を最適化。最適なスマホプラン・回線プランを無料でご提案します。
              </p>
              <div className="mt-6 flex gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60">
                  <XIcon />
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60">
                  <InstagramIcon />
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60">
                  <GithubIcon />
                </span>
              </div>
            </div>

            <div>
              <div className="text-[13px] font-bold text-white">メニュー</div>
              <nav className="mt-4 flex flex-col gap-3">
                <a
                  href="#service"
                  className="text-sm text-white/50 no-underline transition-colors hover:text-white/80"
                >
                  サービスの特徴
                </a>
                <a
                  href="#how-it-works"
                  className="text-sm text-white/50 no-underline transition-colors hover:text-white/80"
                >
                  使い方
                </a>
                <Link
                  href="/carriers"
                  className="text-sm text-white/50 no-underline transition-colors hover:text-white/80"
                >
                  スマホ料金プラン一覧
                </Link>
                <Link
                  href="/blog"
                  className="text-sm text-white/50 no-underline transition-colors hover:text-white/80"
                >
                  ブログ
                </Link>
                <a
                  href="#faq"
                  className="text-sm text-white/50 no-underline transition-colors hover:text-white/80"
                >
                  よくある質問
                </a>
              </nav>
            </div>

            <div>
              <div className="text-[13px] font-bold text-white">サポート</div>
              <nav className="mt-4 flex flex-col gap-3">
                <Link
                  href="/legal/about"
                  className="text-sm text-white/50 no-underline transition-colors hover:text-white/80"
                >
                  お問い合わせ
                </Link>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-white/50 no-underline transition-colors hover:text-white/80"
                >
                  プライバシーポリシー
                </Link>
                <Link
                  href="/legal/terms"
                  className="text-sm text-white/50 no-underline transition-colors hover:text-white/80"
                >
                  利用規約
                </Link>
                <Link
                  href="/legal/about"
                  className="text-sm text-white/50 no-underline transition-colors hover:text-white/80"
                >
                  運営会社
                </Link>
              </nav>
            </div>

            <div className="flex flex-col items-start md:items-end">
              <div className="text-sm font-medium text-white/70">
                今すぐ最適プランを診断する
              </div>
              <a
                href="#service"
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-[#4338ca] px-6 py-3 text-sm font-bold text-white no-underline transition-all hover:bg-[#3730a3]"
              >
                無料で診断する
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-3 flex items-center gap-1 text-[12px] text-white/40">
                <CheckCircleIcon />
                完全無料・登録不要・1分で完了
              </p>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6">
            <div className="flex flex-col items-center gap-3 text-center text-[11px] text-white/30 md:flex-row md:justify-between md:text-left">
              <div>
                本サイトはアフィリエイト広告（PR）を含みます。掲載情報は各事業者の公開情報に基づきます。
              </div>
              <div>&copy; SmartPlan All rights reserved.</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   Sub-components & SVG icons
   ════════════════════════════════════════════════════════ */

function FeatureItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#f8f7ff] text-[#4338ca]">
        {icon}
      </div>
      <div className="mt-2 text-[11px] leading-tight text-[#555]">{text}</div>
    </div>
  );
}

function StepCard({
  num,
  icon,
  title,
  desc,
}: {
  num: number;
  icon: React.ReactNode;
  title: string;
  desc: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#4338ca] text-lg font-bold text-white">
        {num}
      </div>
      <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm text-[#4338ca]">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-bold text-[#111]">{title}</h3>
      <p className="mt-3 text-sm leading-[1.8] text-[#555]">{desc}</p>
    </div>
  );
}

function ArrowRight({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ShieldSmall() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
    >
      <path
        d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function DevicesIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function OptimizeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="8" width="4" height="13" rx="1" />
      <rect x="17" y="4" width="4" height="17" rx="1" />
      <path d="M3 4l7 4 7-4" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function WifiFeatureIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22V16M12 8V2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a4 4 0 0 0-4 4v1a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v1a3 3 0 0 0 3 3h1a4 4 0 0 0 6 0h1a3 3 0 0 0 3-3v-1a3 3 0 0 0 0-6v-1a3 3 0 0 0-3-3V6a4 4 0 0 0-4-4z" />
      <path d="M12 2v20" />
      <path d="M8 10h8" />
      <path d="M8 14h8" />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function StepArrow() {
  return (
    <svg
      width="40"
      height="24"
      viewBox="0 0 40 24"
      fill="none"
      stroke="#d1d5db"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="rotate-90 md:rotate-0"
    >
      <line x1="0" y1="12" x2="32" y2="12" />
      <polyline points="26 6 32 12 26 18" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function YenIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22V12M5 3l7 9 7-9M6 12h12M6 16h12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
