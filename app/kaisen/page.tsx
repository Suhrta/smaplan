'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { getKaisenLink, getKaisenImpression } from '@/data/kaisenAffiliateLinks';
import { track } from '@/lib/analytics';
import { SiteHeader, LogoHeader } from '@/app/components/SiteHeader';
import { FadeIn } from '@/app/components/FadeIn';

function useCountUp(target: number, active: boolean, duration = 800) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!active || hasRun.current) return;
    hasRun.current = true;
    startRef.current = null;
    let raf: number;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return value;
}

type Question = {
  key: string;
  label: string;
  multi: boolean;
  options: string[];
};

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

const QUESTIONS: Question[] = [
  {
    key: 'q1_housing',
    label: 'お住まいのタイプは？',
    multi: false,
    options: ['戸建て', 'マンション・アパート'],
  },
  {
    key: 'q2_region',
    label: 'お住まいの地域は？',
    multi: false,
    options: PREFECTURES,
  },
  {
    key: 'q3_current_line',
    label: '今使っているネット回線は？',
    multi: false,
    options: ['光回線', 'ホームルーター', 'モバイルWiFi', 'なし（新規契約）'],
  },
  {
    key: 'q4_users',
    label: 'ネットを使う人数は？',
    multi: false,
    options: ['1人', '2〜3人', '4人以上'],
  },
  {
    key: 'q5_usage',
    label: '主な用途は？（複数選択可）',
    multi: true,
    options: ['動画視聴（YouTube・Netflix等）', 'オンラインゲーム', 'テレワーク・Web会議', 'SNS・ブラウジング'],
  },
  {
    key: 'q6_speed',
    label: '通信速度はどれくらい重視する？',
    multi: false,
    options: ['とにかく速いのがいい', '普通に使えればOK'],
  },
  {
    key: 'q7_smartphone',
    label: '使っているスマホのキャリアは？',
    multi: false,
    options: ['ドコモ', 'au', 'ソフトバンク', '楽天モバイル', '格安SIM（MVNO）', 'なし・わからない'],
  },
  {
    key: 'q8_budget',
    label: '月額の予算は？',
    multi: false,
    options: ['3,000円以下', '3,000〜5,000円', '5,000円以上', '気にしない'],
  },
  {
    key: 'q9_construction',
    label: '開通工事はできる？',
    multi: false,
    options: ['工事OK', '工事NG（できない・したくない）', 'わからない'],
  },
  {
    key: 'q10_priority',
    label: '一番重視するのは？',
    multi: false,
    options: ['料金の安さ', '通信速度', 'キャッシュバック・特典', '手軽さ（工事不要など）'],
  },
];

type Answers = Record<string, string | string[]>;

type Recommendation = {
  rank: number;
  name: string;
  type: string;
  monthly_cost: number;
  max_speed: string;
  reason: string;
  cashback: string;
  affiliate_key: string;
};

type DiagnoseResult = {
  housing_type: string;
  recommendations: Recommendation[];
  advice: string;
};

type View = 'landing' | 'diagnose' | 'result';

const LOADING_MESSAGES = [
  'あなたの使い方を分析中...',
  '全回線プランを比較中...',
  '最適な回線を探しています...',
  'AIがおすすめを選定中...',
  'もうすぐ結果が出ます...',
];

function LoadingMessage() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i + 1) % LOADING_MESSAGES.length), 2000);
    return () => clearInterval(timer);
  }, []);
  return (
    <p className="text-[15px] text-[#555] animate-[fadeInMsg_0.5s_ease]">
      {LOADING_MESSAGES[idx]}
    </p>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-4 py-3 text-[13px] text-[#991B1B]">
      {message}
    </div>
  );
}

function OptionButton({
  label, selected, multi, onClick,
}: {
  label: string;
  selected: boolean;
  multi: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border-2 px-[18px] py-3.5 text-left text-[15px] transition-all duration-150 ${
        selected
          ? 'border-[#4338ca] bg-[#f8f7ff] font-semibold text-[#4338ca]'
          : 'border-[#e8e8e8] bg-white font-medium text-[#111] hover:border-[#c4b5fd] hover:bg-[#faf9ff]'
      }`}
      style={{ minHeight: 56 }}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center text-[13px] leading-none text-white ${
          multi ? 'rounded' : 'rounded-full'
        } ${
          selected
            ? 'border-2 border-[#4338ca] bg-[#4338ca]'
            : 'border-2 border-[#e8e8e8] bg-transparent'
        }`}
      >
        {selected && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

const KAISEN_FAQ_ITEMS = [
  {
    question: '回線診断は本当に無料ですか？',
    answer: 'はい、完全無料です。会員登録も不要で、10問の質問に答えるだけで診断結果が表示されます。',
  },
  {
    question: '光回線とホームルーターのどちらがいいですか？',
    answer: '安定した速度と大容量通信が必要なら光回線がおすすめです。工事ができない物件や、すぐにネットを使いたい場合はホームルーターが便利です。診断ではお住まいの状況に合わせて最適なタイプを提案します。',
  },
  {
    question: '今の回線から乗り換えると工事が必要ですか？',
    answer: '光回線の場合は原則として開通工事が必要です。ただしフレッツ光コラボ同士の乗り換え（事業者変更）なら工事不要な場合がほとんどです。ホームルーターやモバイルWiFiは工事不要で、届いたその日から使えます。',
  },
  {
    question: 'スマホとのセット割はどれくらいお得ですか？',
    answer: 'ドコモ・au・ソフトバンクのスマホをお使いの場合、対応する光回線とのセット割で毎月550〜1,100円の割引が適用されます。家族全員に適用されるプランが多いため、世帯人数が多いほど割引効果は大きくなります。具体的な割引額は各事業者の最新条件をご確認ください。',
  },
  {
    question: '個人情報の入力は必要ですか？',
    answer: '一切不要です。氏名・電話番号・メールアドレスなどの個人情報は入力しません。',
  },
] as const;

const KAISEN_FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: KAISEN_FAQ_ITEMS.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

type KaisenBAExample = {
  beforeName: string;
  beforeCost: number;
  afterName: string;
  afterCost: number;
  detail: string;
  detailComment: string;
};

function KaisenBACard({ example, saving, index }: { example: KaisenBAExample; saving: number; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.unobserve(el); } },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white transition-all duration-600"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <div className="sp-ba-cards">
        <div className="flex-1 bg-white p-7">
          <div className="mb-2 text-[11px] font-bold tracking-[0.1em] text-[#888]">BEFORE</div>
          <div className="mb-3 text-lg font-bold text-[#111]">{example.beforeName}</div>
          <div>
            <span className="text-[28px] font-bold text-[#111]">{example.beforeCost.toLocaleString()}</span>
            <span className="ml-0.5 text-base font-semibold text-[#555]">円/月</span>
          </div>
        </div>

        <div className="sp-ba-arrow-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />
            </svg>
          </div>
        </div>

        <div className="flex-1 bg-[#f8f7ff] p-7">
          <div className="mb-2 text-[11px] font-bold tracking-[0.1em] text-[#4338ca]">AFTER</div>
          <div className="mb-3 text-lg font-bold text-[#4338ca]">{example.afterName}</div>
          <div>
            <span className="text-[28px] font-bold text-[#4338ca]">{example.afterCost.toLocaleString()}</span>
            <span className="ml-0.5 text-base font-semibold text-[#555]">円/月</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e8e8e8] bg-[#f8f7ff] px-7 py-[18px]">
        <div className="text-sm text-[#555]">
          {example.detail}
          {example.detailComment && (<>（<span className="text-[#4338ca]">{example.detailComment}</span>）</>)}
        </div>
        <div className="flex shrink-0 items-baseline gap-1">
          <span className="text-sm text-[#888]">年間</span>
          <span className="text-[clamp(44px,10vw,60px)] font-extrabold leading-none tracking-tight" style={{ background: 'linear-gradient(135deg, #4338ca, #7c3aed)', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {saving.toLocaleString()}
          </span>
          <span className="text-sm text-[#888]">円おトク</span>
        </div>
      </div>
    </div>
  );
}

function KaisenPhoneMockup() {
  const panelBase = "absolute inset-0 flex flex-col opacity-0";
  const optBase = "rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-2.5 text-[11px] font-bold text-[#475569]";

  return (
    <div aria-hidden="true">
      <style>{`
        @keyframes mockStep1 {
          0%, 18% { opacity: 1; transform: translateY(0); }
          20%, 100% { opacity: 0; transform: translateY(-6px); }
        }
        @keyframes mockStep2 {
          0%, 20% { opacity: 0; transform: translateY(6px); }
          22%, 38% { opacity: 1; transform: translateY(0); }
          40%, 100% { opacity: 0; transform: translateY(-6px); }
        }
        @keyframes mockStep3 {
          0%, 40% { opacity: 0; transform: translateY(6px); }
          42%, 58% { opacity: 1; transform: translateY(0); }
          60%, 100% { opacity: 0; transform: translateY(-6px); }
        }
        @keyframes mockStep4 {
          0%, 60% { opacity: 0; }
          62%, 71% { opacity: 1; }
          73%, 100% { opacity: 0; }
        }
        @keyframes mockStep5 {
          0%, 73% { opacity: 0; transform: translateY(6px) scale(0.97); }
          76%, 98% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(0) scale(1); }
        }
        @keyframes mockHi1 {
          0%, 4% { background: #fff; border-color: #E2E8F0; color: #475569; }
          7%, 18% { background: #f8f7ff; border-color: #4338ca; color: #4338ca; }
          20%, 100% { background: #fff; border-color: #E2E8F0; color: #475569; }
        }
        @keyframes mockHi2 {
          0%, 24% { background: #fff; border-color: #E2E8F0; color: #475569; }
          27%, 38% { background: #f8f7ff; border-color: #4338ca; color: #4338ca; }
          40%, 100% { background: #fff; border-color: #E2E8F0; color: #475569; }
        }
        @keyframes mockHi3 {
          0%, 44% { background: #fff; border-color: #E2E8F0; color: #475569; }
          47%, 58% { background: #f8f7ff; border-color: #4338ca; color: #4338ca; }
          60%, 100% { background: #fff; border-color: #E2E8F0; color: #475569; }
        }
        @keyframes mockSpin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
        @keyframes mockPop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .mock-step { animation-duration: 15s; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        .mock-step-1 { animation-name: mockStep1; }
        .mock-step-2 { animation-name: mockStep2; }
        .mock-step-3 { animation-name: mockStep3; }
        .mock-step-4 { animation-name: mockStep4; }
        .mock-step-5 { animation-name: mockStep5; }
        .mock-hi { animation-duration: 15s; animation-timing-function: ease-out; animation-iteration-count: infinite; }
        .mock-hi-1 { animation-name: mockHi1; }
        .mock-hi-2 { animation-name: mockHi2; }
        .mock-hi-3 { animation-name: mockHi3; }
        .mock-spin { animation: mockSpin 1.2s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mock-step, .mock-hi, .mock-spin { animation: none !important; }
          .mock-step-1, .mock-step-2, .mock-step-3, .mock-step-4 { opacity: 0 !important; }
          .mock-step-5 { opacity: 1 !important; transform: none !important; }
        }
      `}</style>
      <div
        className="relative mx-auto h-[560px] w-[272px] rounded-[48px] p-[5px] animate-[mockPop_0.6s_ease_both]"
        style={{
          background: 'linear-gradient(135deg, #4A5568 0%, #1A202C 45%, #2D3748 100%)',
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.35), 0 12px 28px rgba(15, 23, 42, 0.22), 0 4px 10px rgba(15, 23, 42, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 2px 3px rgba(255, 255, 255, 0.14), inset 0 -2px 3px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div aria-hidden="true" className="absolute -left-0.5 top-[108px] h-8 w-[3px] rounded-l-sm" style={{ background: 'linear-gradient(90deg, #2D3748, #4A5568)' }} />
        <div aria-hidden="true" className="absolute -left-0.5 top-[152px] h-[54px] w-[3px] rounded-l-sm" style={{ background: 'linear-gradient(90deg, #2D3748, #4A5568)' }} />
        <div aria-hidden="true" className="absolute -left-0.5 top-[216px] h-[54px] w-[3px] rounded-l-sm" style={{ background: 'linear-gradient(90deg, #2D3748, #4A5568)' }} />
        <div aria-hidden="true" className="absolute -right-0.5 top-[172px] h-20 w-[3px] rounded-r-sm" style={{ background: 'linear-gradient(90deg, #4A5568, #2D3748)' }} />
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[44px] bg-[#F7FAFC] px-4 pb-3.5 pt-12">
          <div aria-hidden="true" className="absolute left-1/2 top-[7px] z-[3] h-4 w-[60px] -translate-x-1/2 rounded-[10px] bg-[#0B0F19]" style={{ boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.04)' }} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] rounded-[44px]" style={{ background: 'linear-gradient(125deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.06) 28%, rgba(255, 255, 255, 0) 52%, rgba(255, 255, 255, 0.08) 88%, rgba(255, 255, 255, 0.16) 100%)', mixBlendMode: 'overlay' }} />
          <div className="mb-[22px] text-center text-[10px] font-extrabold tracking-[0.18em] text-[#94A3B8]">
            回線プラン
          </div>
          <div className="relative flex-1">
            {/* Q1: 住居タイプ */}
            <div className={`mock-step mock-step-1 ${panelBase}`}>
              <div className="mb-[22px] flex gap-1">
                <div className="h-1 flex-1 rounded-sm bg-[#4338ca]" />
                <div className="h-1 flex-1 rounded-sm bg-[#E2E8F0]" />
                <div className="h-1 flex-1 rounded-sm bg-[#E2E8F0]" />
              </div>
              <div className="mb-1.5 text-[10px] font-extrabold tracking-[0.06em] text-[#94A3B8]">Q1</div>
              <div className="mb-[18px] text-[13px] font-extrabold leading-[1.35] text-[#0F172A]">住居タイプは？</div>
              <div className="flex flex-col gap-2">
                <div className={`mock-hi mock-hi-1 ${optBase}`}>戸建て</div>
                <div className={optBase}>マンション</div>
              </div>
            </div>

            {/* Q2: 用途 */}
            <div className={`mock-step mock-step-2 ${panelBase}`}>
              <div className="mb-[22px] flex gap-1">
                <div className="h-1 flex-1 rounded-sm bg-[#4338ca]" />
                <div className="h-1 flex-1 rounded-sm bg-[#4338ca]" />
                <div className="h-1 flex-1 rounded-sm bg-[#E2E8F0]" />
              </div>
              <div className="mb-1.5 text-[10px] font-extrabold tracking-[0.06em] text-[#94A3B8]">Q2</div>
              <div className="mb-[18px] text-[13px] font-extrabold leading-[1.35] text-[#0F172A]">主な用途は？</div>
              <div className="flex flex-col gap-2">
                <div className={optBase}>動画視聴</div>
                <div className={`mock-hi mock-hi-2 ${optBase}`}>テレワーク</div>
                <div className={optBase}>オンラインゲーム</div>
              </div>
            </div>

            {/* Q3: 重視 */}
            <div className={`mock-step mock-step-3 ${panelBase}`}>
              <div className="mb-[22px] flex gap-1">
                <div className="h-1 flex-1 rounded-sm bg-[#4338ca]" />
                <div className="h-1 flex-1 rounded-sm bg-[#4338ca]" />
                <div className="h-1 flex-1 rounded-sm bg-[#4338ca]" />
              </div>
              <div className="mb-1.5 text-[10px] font-extrabold tracking-[0.06em] text-[#94A3B8]">Q3</div>
              <div className="mb-[18px] text-[13px] font-extrabold leading-[1.35] text-[#0F172A]">一番重視するのは？</div>
              <div className="flex flex-col gap-2">
                <div className={`mock-hi mock-hi-3 ${optBase}`}>料金の安さ</div>
                <div className={optBase}>通信速度</div>
                <div className={optBase}>手軽さ</div>
              </div>
            </div>

            {/* Loading */}
            <div className={`mock-step mock-step-4 ${panelBase} !items-center !justify-center gap-4`}>
              <div className="mock-spin h-[42px] w-[42px] rounded-full border-3 border-[#E2E8F0] border-t-[#4338ca]" />
              <div className="text-center text-xs font-extrabold leading-[1.5] text-[#475569]">
                あなたに最適な<br />回線を分析中...
              </div>
            </div>

            {/* Result */}
            <div className={`mock-step mock-step-5 ${panelBase}`}>
              <div className="mb-2.5 rounded-xl px-3.5 py-[11px] text-white" style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' }}>
                <div className="text-[10px] font-bold opacity-85">乗り換えで</div>
                <div className="mt-0.5 text-xl font-black leading-[1.1]">年間 36,000円</div>
                <div className="text-[11px] font-extrabold">おトク！</div>
              </div>
              <div className="mb-1.5 text-[10px] font-bold text-[#475569]">あなたに最適な回線</div>
              <div className="mb-1.5 rounded-xl border-2 border-[#4338ca] bg-white p-3 shadow-[0_6px_16px_rgba(67,56,202,0.15)]">
                <div className="mb-0.5 text-[10px] font-bold text-[#64748B]">第1位</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-[13px] font-black text-[#0F172A]">GMOとくとくBB光</div>
                  <div className="flex items-baseline gap-px">
                    <span className="text-lg font-black leading-none text-[#4338ca]">4,818</span>
                    <span className="text-[9px] font-extrabold text-[#4338ca]">円/月</span>
                  </div>
                </div>
              </div>
              <div className="mb-1 flex items-baseline justify-between rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-[7px]">
                <div className="text-[11px] font-bold text-[#0F172A]">2位 ドコモ光</div>
                <div className="text-xs font-extrabold text-[#475569]">5,720<span className="text-[8px] font-bold">円</span></div>
              </div>
              <div className="flex items-baseline justify-between rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-[7px]">
                <div className="text-[11px] font-bold text-[#0F172A]">3位 NURO光</div>
                <div className="text-xs font-extrabold text-[#475569]">5,200<span className="text-[8px] font-bold">円</span></div>
              </div>
            </div>
          </div>
          <div className="relative z-[1] mt-2.5 flex items-center justify-around border-t border-[#E2E8F0] pt-[9px] text-[10px] font-bold tracking-[0.02em] text-[#64748B]">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>
              全16プラン
            </span>
            <span className="text-[#CBD5E1]">|</span>
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              30秒
            </span>
            <span className="text-[#CBD5E1]">|</span>
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              匿名
            </span>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center text-[9px] text-[#9CA3AF]">
        ※表示はイメージです
      </div>
    </div>
  );
}

function SectionHeading({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-12 text-center">
      <h2 className="text-[clamp(24px,4vw,36px)] font-bold leading-[1.3] tracking-tight text-[#111]">
        {children}
      </h2>
      {sub && (
        <p className="mt-3 text-[15px] leading-relaxed text-[#555]">{sub}</p>
      )}
    </div>
  );
}

function GradientCTA({ onClick, children, variant = 'primary' }: {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'light';
}) {
  if (variant === 'light') {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center justify-center rounded-full bg-white px-14 py-[22px] text-lg font-extrabold text-[#4338ca] shadow-[0_10px_28px_rgba(0,0,0,0.25)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_14px_36px_rgba(0,0,0,0.35)] active:scale-[1.01]"
        style={{ minHeight: 64 }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-full px-14 py-[22px] text-lg font-extrabold text-white shadow-[0_8px_28px_rgba(67,56,202,0.15)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_14px_36px_rgba(67,56,202,0.25)] hover:brightness-110 active:scale-[1.01]"
      style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)', minHeight: 64 }}
    >
      {children}
    </button>
  );
}

export default function KaisenPage() {
  const [view, setView] = useState<View>('landing');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [prefectureFilter, setPrefectureFilter] = useState('');
  const heroRef = useRef<HTMLElement>(null);
  const [heroInView, setHeroInView] = useState(false);

  useEffect(() => {
    return () => { if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current); };
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setHeroInView(true); io.unobserve(el); } },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [view]);

  const q = QUESTIONS[step];

  function startDiagnose() {
    track('kaisen_diagnose_start');
    setView('diagnose');
    setStep(0);
    setAnswers({});
    setResult(null);
    setError(null);
  }

  function resetAll() {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setView('landing');
    setStep(0);
    setAnswers({});
    setResult(null);
    setError(null);
    setPrefectureFilter('');
  }

  function toggle(key: string, val: string, multi: boolean) {
    setAnswers(prev => {
      if (multi) {
        const cur = (prev[key] as string[]) || [];
        return { ...prev, [key]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val] };
      }
      return { ...prev, [key]: val };
    });
    if (!multi && step < QUESTIONS.length - 1) {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        setStep(s => s + 1);
        advanceTimerRef.current = null;
        setPrefectureFilter('');
      }, 280);
    }
  }

  function isSelected(key: string, val: string) {
    const a = answers[key];
    if (Array.isArray(a)) return a.includes(val);
    return a === val;
  }

  function canNext() {
    const a = answers[q.key];
    if (Array.isArray(a)) return a.length > 0;
    return !!a;
  }

  async function submitDiagnosis() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/kaisen-diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'エラーが発生しました');
      setResult(data);
      setView('result');
      track('kaisen_diagnose_complete');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleNext() {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
      setPrefectureFilter('');
    } else {
      await submitDiagnosis();
    }
  }

  function handleBack() {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (step > 0) { setStep(s => s - 1); setPrefectureFilter(''); }
    else setView('landing');
  }

  const heroCount = useCountUp(40000, heroInView, 900);

  // ── Loading ──
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <style>{`
          @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.9} 50%{transform:scale(1.15);opacity:1} }
          @keyframes fadeInMsg { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
        <div className="flex gap-2.5">
          {[0, 0.15, 0.3].map((d, i) => (
            <span
              key={i}
              className="h-3.5 w-3.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                animation: `pulse 1.1s ease-in-out ${d}s infinite`,
              }}
            />
          ))}
        </div>
        <LoadingMessage />
      </main>
    );
  }

  // ── Landing ──
  if (view === 'landing') {
    const lineBadges = [
      { name: 'ドコモ光', bg: '#CC0033' },
      { name: 'ソフトバンク光', bg: '#E60012' },
      { name: 'auひかり', bg: '#EB5505' },
      { name: 'NURO光', bg: '#1D4ED8' },
      { name: '楽天ひかり', bg: '#BF0000' },
      { name: 'GMOとくとくBB光', bg: '#333' },
      { name: 'ビッグローブ光', bg: '#E66A00' },
      { name: 'おてがる光', bg: '#4A9BD9' },
      { name: 'So-net光', bg: '#0070BA' },
      { name: 'ドコモ home 5G', bg: '#CC0033' },
      { name: 'ソフトバンクエアー', bg: '#E60012' },
      { name: 'WiMAX', bg: '#EB5505' },
      { name: 'WiMAX モバイル', bg: '#EB5505' },
      { name: '楽天ポケットWiFi', bg: '#BF0000' },
    ];

    return (
      <div className="bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(KAISEN_FAQ_JSON_LD) }}
        />
        <SiteHeader />

        {/* ── HERO ── */}
        <section
          ref={heroRef}
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #f8f7ff 0%, #ede9fe 40%, #ffffff 100%)' }}
        >
          <div className="mx-auto max-w-[1200px] px-8 pt-14 pb-18 md:px-8 md:pt-20 md:pb-24">
            <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
              <div>
                <FadeIn>
                  <div className="mb-7 inline-flex items-center gap-1.5 rounded-full border border-[#c4b5fd] bg-[#f8f7ff] px-3.5 py-1.5 text-xs font-medium text-[#4338ca]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0d9f5f]" />
                    30秒で無料診断
                  </div>
                </FadeIn>
                <FadeIn delayMs={80}>
                  <h1 className="mb-5 text-[clamp(32px,5vw,52px)] font-bold leading-[1.3] tracking-tight text-[#111]">
                    ネット回線、<br />
                    初年度 最大<span className="font-extrabold" style={{ background: 'linear-gradient(135deg, #4338ca, #7c3aed)', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{heroCount.toLocaleString()}</span>円<br />
                    おトク。
                  </h1>
                </FadeIn>
                <FadeIn delayMs={160}>
                  <p className="mb-9 text-base leading-[1.8] text-[#555]">
                    10問答えるだけで、全16プランから<br />
                    あなたにぴったりの1つを提案します。
                  </p>
                </FadeIn>
                <FadeIn delayMs={240}>
                  <div className="flex flex-col items-start gap-[18px]">
                    <GradientCTA onClick={startDiagnose}>回線診断スタート</GradientCTA>
                    <div className="flex gap-6 text-[13px] font-medium text-[#888]">
                      {['光回線10社', '個人情報不要', '完全無料'].map(t => (
                        <span key={t} className="flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9f5f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#888]">
                      ※月額差+キャッシュバック特典を含む初年度の試算例です。特典内容は時期により変動します。
                    </p>
                  </div>
                </FadeIn>
              </div>
              <FadeIn delayMs={300}>
                <div className="origin-top-center scale-[0.81] md:mb-0 md:scale-100 md:transform-none" style={{ marginBottom: -108 }}>
                  <KaisenPhoneMockup />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── 使い方 ── */}
        <FadeIn as="section" className="bg-[#f8f8fa] py-24 md:py-28">
          <div className="mx-auto max-w-[1200px] px-8">
            <SectionHeading sub="たった30秒、3ステップで完了">使い方はシンプル</SectionHeading>
            <div className="grid gap-5 md:grid-cols-3 md:gap-8">
              {[
                { num: '01', title: '質問に答える', desc: '住居タイプや用途など、10問に答えるだけ', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                { num: '02', title: '回線を比較', desc: '光回線からモバイルWiFiまで全16プランを自動で選定', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg> },
                { num: '03', title: '節約額がわかる', desc: 'スマホ割やキャッシュバック込みで具体的に表示', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M15.5 9.5c-.3-1-1.5-1.5-3.5-1.5s-3.1.8-3.1 2c0 2.4 6.1 1.2 6.1 4 0 1.3-1.5 2-3.5 2s-3.2-.5-3.5-1.5"/></svg> },
              ].map((s) => (
                <div
                  key={s.num}
                  className="rounded-2xl border border-[#e8e8e8] bg-white p-10 text-center transition-all duration-200 hover:-translate-y-1.5 hover:border-[rgba(67,56,202,0.25)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.10),0_8px_16px_rgba(15,23,42,0.06)]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
                >
                  <div className="mb-4 flex justify-center text-[#4338ca]">{s.icon}</div>
                  <div className="mb-2 text-xs font-bold tracking-[0.08em] text-[#4338ca]">STEP {s.num}</div>
                  <div className="mb-2.5 text-lg font-bold text-[#111]">{s.title}</div>
                  <div className="text-sm leading-relaxed text-[#555]">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ── BEFORE / AFTER ── */}
        <FadeIn as="section" className="py-24 md:py-28">
          <div className="mx-auto max-w-[1200px] px-8">
            <SectionHeading sub="回線を乗り換えるだけで、年間数万円の節約も可能">
              見直すと<br />こんなに変わる
            </SectionHeading>
            <div className="flex flex-col gap-6">
              {[
                {
                  beforeName: '大手光回線（戸建て）', beforeCost: 6500,
                  afterName: 'GMOとくとくBB光', afterCost: 4818,
                  detail: '戸建て・1Gbps',
                  detailComment: '速度そのまま、基本料が安い',
                },
                {
                  beforeName: 'ホームルーター', beforeCost: 5368,
                  afterName: 'ドコモ home 5G', afterCost: 4950,
                  detail: '工事不要・5G対応',
                  detailComment: 'ドコモスマホ割で実質さらに安く',
                },
                {
                  beforeName: '光回線（マンション）', beforeCost: 5000,
                  afterName: 'NURO光 for マンション', afterCost: 2090,
                  detail: '下り最大2Gbps',
                  detailComment: '速度も上がって月額は半額以下',
                },
              ].map((ex, i) => {
                const saving = (ex.beforeCost - ex.afterCost) * 12;
                return <KaisenBACard key={i} example={ex} saving={saving} index={i} />;
              })}
            </div>
            <p className="mt-5 text-center text-[11px] leading-relaxed text-[#888]">
              ※2026年4月時点の公式料金に基づく参考値です（税込・割引適用前の標準価格）。最新の料金は各事業者の公式サイトをご確認ください。実際の節約額はご利用状況により異なります。
            </p>
          </div>
        </FadeIn>

        {/* ── FINAL CTA ── */}
        <FadeIn as="section" className="relative overflow-hidden py-28 md:py-32">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }} />
          <div className="relative mx-auto max-w-[1200px] px-8 text-center">
            <h2 className="mb-4 text-[clamp(28px,5vw,48px)] font-bold leading-[1.3] tracking-tight text-white">
              今すぐ無料診断
            </h2>
            <p className="mb-10 text-base leading-[1.8] text-white/65">
              30秒で、あなたにぴったりの回線が見つかる
            </p>
            <GradientCTA onClick={startDiagnose} variant="light">回線診断スタート</GradientCTA>
            <div className="mt-7 flex flex-wrap justify-center gap-6 text-[13px] font-medium text-white/45">
              <span>登録不要</span>
              <span>全16プラン対応</span>
              <span>結果はその場で表示</span>
            </div>
          </div>
        </FadeIn>

        {/* ── 対応回線 ── */}
        <FadeIn as="section" className="bg-[#f8f8fa] py-24 md:py-28">
          <div className="mx-auto max-w-[1200px] px-8 text-center">
            <div className="mb-6 text-xs font-bold tracking-[0.15em] text-[#888]">
              対応回線・プラン
            </div>
            <div className="mx-auto flex max-w-[700px] flex-wrap justify-center gap-2.5">
              {lineBadges.map(c => (
                <span key={c.name} className="flex items-center gap-1.5 rounded-full border border-[#e8e8e8] bg-white px-[18px] py-2 text-[13px] font-semibold text-[#111]">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.bg }} />
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ── FAQ ── */}
        <FadeIn as="section" className="bg-white py-24 md:py-28">
          <div className="mx-auto max-w-[1200px] px-8">
            <SectionHeading>よくある質問</SectionHeading>
            <div className="mx-auto flex max-w-[700px] flex-col gap-2">
              {KAISEN_FAQ_ITEMS.map((item, i) => (
                <details key={i} className="sp-faq-item">
                  <summary className="sp-faq-summary">
                    <span className="sp-faq-q" aria-hidden="true">Q</span>
                    <span className="flex-1">{item.question}</span>
                  </summary>
                  <p className="sp-faq-answer">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ── FOOTER ── */}
        <footer className="border-t border-[#e8e8e8] bg-white py-12">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-8 text-center">
            <div className="flex flex-wrap justify-center gap-7">
              <Link href="/smaho" className="text-sm font-medium text-[#555] no-underline hover:text-[#4338ca]">
                スマホ診断
              </Link>
              <Link href="/blog" className="text-sm font-medium text-[#555] no-underline hover:text-[#4338ca]">
                ブログ
              </Link>
            </div>
            <div className="text-xs text-[#888]">
              &copy; {new Date().getFullYear()} スマートプラン
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ── Result ──
  if (view === 'result' && result) {
    const topRec = result.recommendations[0];
    const shareText = `AIが私にぴったりのネット回線を診断してくれた！\n1位: ${topRec?.name}（${topRec?.type}）\n月額${topRec?.monthly_cost.toLocaleString()}円\n\nあなたも試してみて\nhttps://smaplan.com/kaisen`;

    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-[560px] px-5 pt-5 pb-10">
          <div className="mb-3 flex justify-end">
            <button onClick={resetAll} className="rounded-lg border border-[#e8e8e8] bg-transparent px-3.5 py-1.5 text-xs text-[#555] transition-colors hover:bg-[#f8f8fa]">
              ← やり直す
            </button>
          </div>

          {error && <ErrorBanner message={error} />}

          {/* Header Banner */}
          <div className="mb-6 rounded-2xl p-7 text-center text-white shadow-[0_8px_24px_rgba(67,56,202,0.3)]" style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' }}>
            <div className="mb-1.5 text-[13px] opacity-90">あなたにおすすめの回線</div>
            <div className="mb-1 text-2xl font-extrabold leading-[1.2]">
              {topRec?.name}
            </div>
            <div className="text-sm opacity-85">
              {topRec?.type} ・ 月額 {topRec?.monthly_cost.toLocaleString()}円
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
              <div className="mb-1 text-[11px] text-[#888]">住居タイプ</div>
              <div className="text-lg font-bold text-[#111]">{result.housing_type}</div>
            </div>
            <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
              <div className="mb-1 text-[11px] text-[#888]">比較回線数</div>
              <div className="text-lg font-bold text-[#111]">全16プラン</div>
            </div>
          </div>

          <div className="mb-3 text-sm font-bold text-[#555]">おすすめ回線 TOP 3</div>

          {/* Table */}
          <div className="mb-5 overflow-x-auto rounded-xl border border-[#e8e8e8] bg-white">
            <table className="w-full border-collapse text-[13px]" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-[#f8f8fa]">
                  <th className="border-b border-[#e8e8e8] px-2 py-2.5 text-left text-[11px] font-bold text-[#555]" style={{ width: '35%' }}>回線名</th>
                  <th className="border-b border-[#e8e8e8] px-1.5 py-2.5 text-center text-[11px] font-bold text-[#555]" style={{ width: '22%' }}>タイプ</th>
                  <th className="border-b border-[#e8e8e8] px-1.5 py-2.5 text-right text-[11px] font-bold text-[#555]" style={{ width: '20%' }}>月額</th>
                  <th className="border-b border-[#e8e8e8] px-2 py-2.5 text-right text-[11px] font-bold text-[#555]" style={{ width: '23%' }}>最大速度</th>
                </tr>
              </thead>
              <tbody>
                {result.recommendations.map((rec, i) => {
                  const isLast = i === result.recommendations.length - 1;
                  const isTop = i === 0;
                  return (
                    <tr key={i}>
                      <td className={`px-2 py-3 text-[13px] font-semibold text-[#111] ${isLast ? '' : 'border-b border-[#e8e8e8]'}`}>
                        <span className={`mr-1.5 text-[11px] font-bold ${isTop ? 'text-[#4338ca]' : 'text-[#888]'}`}>{rec.rank}位</span>
                        {rec.name}
                      </td>
                      <td className={`px-1.5 py-3 text-center text-[11px] text-[#555] ${isLast ? '' : 'border-b border-[#e8e8e8]'}`}>{rec.type}</td>
                      <td className={`px-1.5 py-3 text-right text-[13px] font-bold text-[#4338ca] ${isLast ? '' : 'border-b border-[#e8e8e8]'}`}>{rec.monthly_cost.toLocaleString()}円</td>
                      <td className={`px-2 py-3 text-right text-xs text-[#555] ${isLast ? '' : 'border-b border-[#e8e8e8]'}`}>{rec.max_speed}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detailed Cards */}
          <div className="mb-6 flex flex-col gap-4">
            {result.recommendations.map((rec, i) => {
              const isTop = i === 0;
              return (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                    isTop
                      ? 'border-2 border-[#4338ca] shadow-[0_10px_28px_rgba(67,56,202,0.16)]'
                      : 'border border-[#e8e8e8]'
                  }`}
                >
                  {isTop && (
                    <div className="px-4 py-2 text-center text-xs font-extrabold tracking-[0.06em] text-white" style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)' }}>
                      最もおすすめ
                    </div>
                  )}
                  <div className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`rounded-full px-3 py-[3px] text-xs font-bold text-white ${isTop ? '' : 'bg-[#555]'}`} style={isTop ? { background: 'linear-gradient(135deg, #4338ca, #6366f1)' } : undefined}>
                        {rec.rank}位
                      </span>
                      <span className="rounded-md border border-[#e8e8e8] bg-[#f8f8fa] px-2.5 py-[3px] text-[11px] font-semibold text-[#555]">
                        {rec.type}
                      </span>
                    </div>

                    <div className={`mb-3 font-bold text-[#111] ${isTop ? 'text-xl' : 'text-lg'}`}>
                      {rec.name}
                    </div>

                    <div className="mb-3 flex items-baseline gap-2 rounded-[10px] bg-[#f8f7ff] px-3.5 py-3">
                      <span className={`font-extrabold text-[#4338ca] ${isTop ? 'text-[30px]' : 'text-[26px]'}`}>
                        {rec.monthly_cost.toLocaleString()}
                      </span>
                      <span className="text-[13px] font-semibold text-[#4338ca]">円/月</span>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-1.5">
                      <span className="flex items-center gap-1 rounded-md border border-[#e8e8e8] bg-[#f8f8fa] px-2.5 py-1 text-xs text-[#555]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        {rec.max_speed}
                      </span>
                      {rec.cashback && rec.cashback !== 'なし' && (
                        <span className="flex items-center gap-1 rounded-md border border-[#BBF7D0] bg-[#DCFCE7] px-2.5 py-1 text-xs font-semibold text-[#16A34A]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="M12 12V3"/><path d="m8 7 4-4 4 4"/></svg>
                          キャッシュバック特典あり
                        </span>
                      )}
                    </div>

                    <p className="mb-4 text-sm leading-relaxed text-[#111]">
                      {rec.reason}
                    </p>

                    <a
                      href={rec.affiliate_key ? getKaisenLink(rec.affiliate_key) : '#'}
                      target="_blank"
                      rel="nofollow noopener sponsored"
                      onClick={() => track('kaisen_affiliate_click', {
                        name: rec.name,
                        type: rec.type,
                        rank: rec.rank,
                      })}
                      className={`flex w-full items-center justify-center rounded-xl py-3 text-[15px] font-bold no-underline transition-all duration-200 hover:brightness-110 ${
                        isTop
                          ? 'text-white shadow-[0_4px_12px_rgba(67,56,202,0.25)]'
                          : 'border-2 border-[#4338ca] bg-white text-[#4338ca] hover:bg-[#f8f7ff]'
                      }`}
                      style={isTop ? { background: 'linear-gradient(135deg, #4338ca, #6366f1)', minHeight: 48 } : { minHeight: 48 }}
                    >
                      公式サイトへ →
                    </a>
                    {rec.affiliate_key && getKaisenImpression(rec.affiliate_key) && (
                      <img src={getKaisenImpression(rec.affiliate_key)!} width={1} height={1} alt="" className="pointer-events-none absolute opacity-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Advice */}
          {result.advice && (
            <div className="mb-6 rounded-2xl border border-[#e8e8e8] bg-white p-5">
              <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-[#4338ca]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
                AIからのアドバイス
              </div>
              <p className="text-sm leading-[1.8] text-[#111]">
                {result.advice}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <a
              href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[10px] bg-black px-7 py-3 text-sm font-bold text-white no-underline transition-opacity hover:opacity-80"
              style={{ minHeight: 48 }}
            >
              𝕏 結果をシェアする
            </a>
            <button
              onClick={() => { track('kaisen_retry_diagnose'); resetAll(); }}
              className="rounded-[10px] border border-[#e8e8e8] bg-transparent px-6 py-2.5 text-sm font-semibold text-[#555] transition-colors hover:bg-[#f8f8fa]"
              style={{ minHeight: 44 }}
            >
              もう一度診断する
            </button>
            <Link
              href="/smaho"
              className="text-[13px] font-semibold text-[#4338ca] no-underline transition-opacity hover:opacity-70"
            >
              スマホプラン診断も試す →
            </Link>
          </div>
        </main>
      </>
    );
  }

  // ── Diagnose ──
  const remaining = QUESTIONS.length - step - 1;
  const percent = Math.round(((step + 1) / QUESTIONS.length) * 100);

  const isPrefectureQuestion = q.key === 'q2_region';
  const filteredOptions = isPrefectureQuestion && prefectureFilter
    ? q.options.filter(o => o.includes(prefectureFilter))
    : q.options;

  return (
    <main className="mx-auto max-w-[560px] px-5 pb-10">
      <LogoHeader compact />

      <div className="mb-2.5 flex items-center gap-1">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-[3px] transition-colors duration-300"
            style={{ background: i <= step ? 'linear-gradient(135deg, #4338ca, #6366f1)' : '#e8e8e8' }}
          />
        ))}
      </div>
      <div className="mb-5 flex items-center justify-between gap-2 text-xs text-[#555]">
        <span>質問 {step + 1} / {QUESTIONS.length}（{percent}% 完了）</span>
        <span className="inline-flex gap-2.5">
          {q.multi && <span>複数選択可</span>}
          {remaining > 0 && remaining <= 3 && (
            <span className="font-bold text-[#16A34A]">あと{remaining}問！</span>
          )}
        </span>
      </div>

      <h2 className="mb-5 flex items-start gap-2.5 text-[22px] font-bold leading-[1.5] text-[#111]">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-extrabold tracking-[0.02em] text-white" style={{ background: 'linear-gradient(135deg, #4338ca, #6366f1)' }}>
          Q{step + 1}
        </span>
        <span className="flex-1">{q.label}</span>
      </h2>

      {isPrefectureQuestion && (
        <div className="mb-3">
          <input
            type="text"
            placeholder="都道府県を検索..."
            value={prefectureFilter}
            onChange={e => setPrefectureFilter(e.target.value)}
            className="w-full rounded-xl border-2 border-[#e8e8e8] bg-white px-4 py-3 text-[15px] text-[#111] outline-none placeholder:text-[#ccc] focus:border-[#c4b5fd]"
          />
        </div>
      )}

      <div
        className={`mb-6 ${
          isPrefectureQuestion
            ? 'grid max-h-[400px] grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2.5 overflow-y-auto'
            : 'flex flex-col gap-2.5'
        }`}
      >
        {filteredOptions.map(opt => (
          isPrefectureQuestion ? (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(q.key, opt, q.multi)}
              className={`rounded-xl border-2 px-3 py-2.5 text-center text-sm transition-all duration-150 ${
                isSelected(q.key, opt)
                  ? 'border-[#4338ca] bg-[#f8f7ff] font-semibold text-[#4338ca]'
                  : 'border-[#e8e8e8] bg-white font-medium text-[#111] hover:border-[#c4b5fd] hover:bg-[#faf9ff]'
              }`}
            >
              {opt}
            </button>
          ) : (
            <OptionButton
              key={opt}
              label={opt}
              selected={isSelected(q.key, opt)}
              multi={q.multi}
              onClick={() => toggle(q.key, opt, q.multi)}
            />
          )
        ))}
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex gap-2.5">
        <button
          onClick={handleBack}
          className="shrink-0 rounded-xl border border-[#e8e8e8] bg-transparent px-5 py-3.5 text-[15px] font-semibold text-[#555] transition-colors hover:bg-[#f8f8fa]"
          style={{ minHeight: 52 }}
        >
          {step === 0 ? '← トップへ' : '← 戻る'}
        </button>
        {(q.multi || step === QUESTIONS.length - 1) && (
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className={`flex-1 rounded-xl border-none py-3.5 text-[15px] font-bold transition-all duration-150 ${
              canNext()
                ? 'text-white shadow-[0_4px_12px_rgba(67,56,202,0.2)] hover:brightness-110'
                : 'cursor-default text-[#888]'
            }`}
            style={{
              background: canNext()
                ? 'linear-gradient(135deg, #4338ca, #6366f1)'
                : '#e8e8e8',
              minHeight: 52,
            }}
          >
            {step < QUESTIONS.length - 1 ? '次へ →' : 'AIに診断してもらう'}
          </button>
        )}
      </div>
    </main>
  );
}
