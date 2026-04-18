'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getLink } from '@/data/affiliateLinks';
import { track } from '@/lib/analytics';
import { SiteHeader, LogoHeader } from './components/SiteHeader';
import plansData from '@/data/plans.json';

type Plan = {
  id: string;
  carrier: string;
  plan_name: string;
  monthly_cost: number;
  monthly_cost_min_with_discounts?: number;
  data_gb: number;
  network: string;
  notes?: string;
};

const plans = plansData as Plan[];

function getPlan(id: string): Plan {
  return plans.find(p => p.id === id)!;
}

function useCountUp(target: number, active: boolean, duration = 800) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!active) { fromRef.current = target; return; }
    const from = fromRef.current || target * 3;
    startRef.current = null;
    let raf: number;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return active ? value : 0;
}

type BAExample = {
  beforeId: string; afterId: string;
  beforeData: string; afterData: string;
  beforeCall: string; afterCall: string;
  beforeDataTip: string; beforeCallTip: string;
  afterDataTip: string; afterCallTip: string;
};

function BeforeAfterCard(props: BAExample) {
  const { beforeId, afterId, beforeData, afterData, beforeCall, afterCall, beforeDataTip, beforeCallTip, afterDataTip, afterCallTip } = props;
  const before = getPlan(beforeId);
  const after = getPlan(afterId);
  const annualSaving = (before.monthly_cost - after.monthly_cost) * 12;

  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const firedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          setStage(1);
          setTimeout(() => setStage(2), 400);
          setTimeout(() => setStage(3), 800);
          setTimeout(() => setStage(4), 1300);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const savingValue = useCountUp(annualSaving, stage >= 4, 900);

  const specRow = (label: string, value: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: 'var(--text-sub)' }}>
      <span style={{ color: '#94A3B8', fontWeight: 600, flexShrink: 0, width: 56 }}>{label}</span>
      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{value}</span>
    </div>
  );

  const orangeTip = (text: string) => (
    <div className="sp-ba-tip" style={{ background: '#FFF7ED', color: '#A0700A' }}>
      💡 {text}
    </div>
  );

  const blueTip = (text: string) => (
    <div className="sp-ba-tip" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
      ✓ {text}
    </div>
  );

  return (
    <div ref={ref} className="sp-ba-row">
      <div className="sp-ba-cards">
        {/* ── BEFORE ── */}
        <div className={`sp-ba-before-card sp-ba-stage sp-ba-stage-before${stage >= 1 ? ' visible' : ''}`}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.15em', marginBottom: 16, textTransform: 'uppercase' as const }}>
            Before
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-main)', marginBottom: 20 }}>
            {before.carrier}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            <div>
              {specRow('データ', beforeData)}
              {orangeTip(beforeDataTip)}
            </div>
            <div>
              {specRow('通話', beforeCall)}
              {orangeTip(beforeCallTip)}
            </div>
          </div>
          <div className="sp-ba-price" style={{ color: 'var(--text-main)' }}>
            {before.monthly_cost.toLocaleString()}
            <span style={{ fontSize: 16, fontWeight: 700, marginLeft: 4, color: 'var(--text-sub)' }}>円/月</span>
          </div>
        </div>

        {/* ── ARROW ── */}
        <div className={`sp-ba-arrow-center sp-ba-stage sp-ba-stage-arrow${stage >= 2 ? ' visible' : ''}`}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="22" r="22" fill="var(--accent)" />
            <path d="M17 22h10m0 0l-4-4m4 4l-4 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* ── AFTER ── */}
        <div className={`sp-ba-after-card sp-ba-stage sp-ba-stage-after${stage >= 3 ? ' visible' : ''}`}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.15em', marginBottom: 16, textTransform: 'uppercase' as const }}>
            After
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginBottom: 20 }}>
            {after.carrier}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            <div>
              {specRow('データ', afterData)}
              {blueTip(afterDataTip)}
            </div>
            <div>
              {specRow('通話', afterCall)}
              {blueTip(afterCallTip)}
            </div>
          </div>
          <div className="sp-ba-price" style={{ color: 'var(--accent)' }}>
            {after.monthly_cost.toLocaleString()}
            <span style={{ fontSize: 16, fontWeight: 700, marginLeft: 4, color: '#94A3B8' }}>円/月</span>
          </div>
        </div>
      </div>

      {/* ── SAVING BANNER ── */}
      <div className={`sp-ba-saving-banner sp-ba-stage sp-ba-stage-saving${stage >= 4 ? ' visible' : ''}`}>
        <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>年間 </span>
        <span style={{ fontSize: 'clamp(44px, 10vw, 60px)', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
          {stage >= 4 ? savingValue.toLocaleString() : '0'}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-sub)' }}> 円おトク</span>
      </div>
    </div>
  );
}

type Question = {
  key: string;
  label: string;
  multi: boolean;
  options: string[];
  input?: 'number';
};

const QUESTIONS: Question[] = [
  {
    key: 'q1_carrier',
    label: '今のキャリアは？',
    multi: false,
    options: ['ドコモ', 'au', 'ソフトバンク', '楽天モバイル', '格安SIM（MVNO）', 'わからない'],
  },
  {
    key: 'q2_monthly_cost',
    label: '今の月額料金はだいたいいくら？',
    multi: false,
    options: [],
    input: 'number',
  },
  {
    key: 'q3_switch',
    label: 'キャリアの乗り換えはアリ？',
    multi: false,
    options: ['安くなるなら乗り換えたい', 'できれば今のキャリアがいい', 'どちらでもいい'],
  },
  {
    key: 'q4_family',
    label: '家族で同じキャリアにまとめてる？',
    multi: false,
    options: ['まとめてる', 'まとめたい', 'バラバラでいい', '一人暮らし'],
  },
  {
    key: 'q5_call',
    label: '電話はどれくらい使う？',
    multi: false,
    options: ['ほぼ使わない・LINE通話メイン', '月に数回は番号通話する', '仕事等で毎日使う'],
  },
  {
    key: 'q6_data_usage',
    label: '外出先（Wi-Fiなし）でスマホをどれくらい使う？',
    multi: false,
    options: ['ほぼWi-Fi環境で足りてる', '通勤・移動中にそこそこ', '外でもガンガン使う'],
  },
  {
    key: 'q7_speed_concern',
    label: '今の通信速度に不満はある？',
    multi: false,
    options: ['不満あり（遅いと感じる）', '特に不満なし', '気にしたことがない'],
  },
  {
    key: 'q8_usage_types',
    label: '外出先で主に何をしてる？',
    multi: true,
    options: ['SNS・ニュース', '動画視聴（YouTube等）', '音楽ストリーミング', 'ゲーム', '仕事・テザリング', '地図・ナビ'],
  },
  {
    key: 'q9_priority',
    label: '一番重視するのは？',
    multi: false,
    options: ['とにかく安さ', '通信速度・安定性', 'データたっぷり', 'サポートの手厚さ'],
  },
  {
    key: 'q10_bundle_discount',
    label: '電気・光回線のセット割を使ってる？',
    multi: false,
    options: ['使ってる', '使ってない', 'わからない'],
  },
];

type Answers = Record<string, string | string[] | number>;

const COST_MIN = 500;
const COST_MAX = 30000;
const UNKNOWN = 'わからない';

type Recommendation = {
  rank: number;
  carrier: string;
  plan_name: string;
  monthly_cost: number;
  data_gb: string;
  call_option: string;
  reason: string;
  annual_saving: number;
  affiliate_key: string;
};

type RelatedPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
};

type DiagnoseResult = {
  estimated_data_gb: number;
  current_estimated_cost: number;
  recommendations: Recommendation[];
  advice: string;
  related_posts?: RelatedPost[];
};

type View = 'landing' | 'diagnose' | 'result';

const LOADING_MESSAGES = [
  'あなたの使い方を分析中...',
  '全キャリアのプランを比較中...',
  '最適なプランを探しています...',
  'AIが節約額を計算中...',
  'もうすぐ結果が出ます...',
];

function LoadingMessage() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i + 1) % LOADING_MESSAGES.length), 2000);
    return () => clearInterval(timer);
  }, []);
  return (
    <p style={{ color: 'var(--text-sub)', fontSize: 15, animation: 'fadeInMsg 0.5s ease' }}>
      {LOADING_MESSAGES[idx]}
    </p>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{
      marginBottom: 16, padding: '12px 16px',
      background: 'var(--danger-light)', border: '1px solid #FCA5A5',
      borderRadius: 8, color: '#991B1B',
      fontSize: 13,
    }}>
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
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', minHeight: 56,
        padding: '14px 18px',
        background: selected ? 'var(--accent-light)' : 'var(--bg-card)',
        border: selected ? '2px solid var(--accent)' : '2px solid var(--border)',
        borderRadius: 12,
        color: selected ? 'var(--accent)' : 'var(--text-main)',
        fontSize: 15, fontWeight: selected ? 600 : 500,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s ease',
      }}
    >
      <span style={{
        flexShrink: 0,
        width: 20, height: 20,
        borderRadius: multi ? 4 : '50%',
        border: selected ? `2px solid var(--accent)` : `2px solid var(--border)`,
        background: selected ? 'var(--accent)' : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 13, lineHeight: 1,
      }}>
        {selected && (multi ? '✓' : '●')}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  );
}


const FAQ_ITEMS = [
  {
    question: 'スマプランの診断は本当に無料ですか？',
    answer: 'はい、完全無料です。会員登録も不要で、10問の質問に答えるだけで診断結果が表示されます。',
  },
  {
    question: 'どのキャリアのプランが対象ですか？',
    answer: 'ドコモ・au・ソフトバンクの大手3キャリアに加え、ahamo・LINEMO・Y!mobile・UQ mobileなどのサブブランド、IIJmio・mineo・楽天モバイルなどの格安SIMまで全20プランを比較対象としています。',
  },
  {
    question: '診断結果の通りに乗り換えないといけませんか？',
    answer: 'いいえ、診断結果はあくまで参考情報です。最終的な判断はご自身でお願いします。',
  },
  {
    question: 'スマホの料金プランを見直すとどれくらい節約できますか？',
    answer: '例えば、ドコモのeximo（月額7,315円）からahamo（月額2,970円）に乗り換えた場合、年間約52,000円の節約になります（当サイト試算・割引適用前の基本料金で比較）。実際の節約額はご利用状況により異なります。',
  },
  {
    question: '個人情報の入力は必要ですか？',
    answer: '一切不要です。氏名・電話番号・メールアドレスなどの個人情報は入力しません。',
  },
] as const;

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

function PhoneMockup() {
  const panelBase: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    willChange: 'opacity, transform',
    opacity: 0,
  };
  const progRow: React.CSSProperties = {
    display: 'flex', gap: 4, marginBottom: 22,
  };
  const dot = (active: boolean): React.CSSProperties => ({
    height: 4, flex: 1, borderRadius: 2,
    background: active ? '#1D4ED8' : '#E2E8F0',
  });
  const qTag: React.CSSProperties = {
    fontSize: 10, color: '#94A3B8', fontWeight: 800, marginBottom: 6,
    letterSpacing: '0.06em',
  };
  const qLabel: React.CSSProperties = {
    fontSize: 13, fontWeight: 800, color: '#0F172A',
    marginBottom: 18, lineHeight: 1.35,
  };
  const optWrap: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: 8,
  };
  const optBase: React.CSSProperties = {
    padding: '10px 12px',
    background: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    fontSize: 11, fontWeight: 700,
    color: '#475569',
    willChange: 'background, border-color, color',
  };

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
          7%, 18% { background: #EFF6FF; border-color: #1D4ED8; color: #1D4ED8; }
          20%, 100% { background: #fff; border-color: #E2E8F0; color: #475569; }
        }
        @keyframes mockHi2 {
          0%, 24% { background: #fff; border-color: #E2E8F0; color: #475569; }
          27%, 38% { background: #EFF6FF; border-color: #1D4ED8; color: #1D4ED8; }
          40%, 100% { background: #fff; border-color: #E2E8F0; color: #475569; }
        }
        @keyframes mockHi3 {
          0%, 44% { background: #fff; border-color: #E2E8F0; color: #475569; }
          47%, 58% { background: #EFF6FF; border-color: #1D4ED8; color: #1D4ED8; }
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
      <div style={{
        position: 'relative',
        width: 272, height: 560,
        margin: '0 auto',
        background: 'linear-gradient(135deg, #4A5568 0%, #1A202C 45%, #2D3748 100%)',
        borderRadius: 48,
        padding: 5,
        boxShadow: [
          '0 30px 80px rgba(15, 23, 42, 0.35)',
          '0 12px 28px rgba(15, 23, 42, 0.22)',
          '0 4px 10px rgba(15, 23, 42, 0.12)',
          'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
          'inset 0 2px 3px rgba(255, 255, 255, 0.14)',
          'inset 0 -2px 3px rgba(0, 0, 0, 0.3)',
        ].join(', '),
        animation: 'mockPop 0.6s ease both',
      }}>
        {/* side buttons */}
        <div aria-hidden="true" style={{
          position: 'absolute', left: -2, top: 108, width: 3, height: 32,
          background: 'linear-gradient(90deg, #2D3748, #4A5568)',
          borderRadius: '2px 0 0 2px',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', left: -2, top: 152, width: 3, height: 54,
          background: 'linear-gradient(90deg, #2D3748, #4A5568)',
          borderRadius: '2px 0 0 2px',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', left: -2, top: 216, width: 3, height: 54,
          background: 'linear-gradient(90deg, #2D3748, #4A5568)',
          borderRadius: '2px 0 0 2px',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', right: -2, top: 172, width: 3, height: 80,
          background: 'linear-gradient(90deg, #4A5568, #2D3748)',
          borderRadius: '0 2px 2px 0',
        }} />
        <div style={{
          width: '100%', height: '100%',
          background: '#F7FAFC',
          borderRadius: 44,
          padding: '48px 16px 14px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Dynamic Island */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: 7, left: '50%', transform: 'translateX(-50%)',
            width: 60, height: 16, borderRadius: 10,
            background: '#0B0F19',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.04)',
            zIndex: 3,
          }} />
          {/* Screen light reflection overlay */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0,
            borderRadius: 44,
            background: 'linear-gradient(125deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.06) 28%, rgba(255, 255, 255, 0) 52%, rgba(255, 255, 255, 0.08) 88%, rgba(255, 255, 255, 0.16) 100%)',
            pointerEvents: 'none',
            zIndex: 2,
            mixBlendMode: 'overlay',
          }} />
          <div style={{
            fontSize: 10, color: '#94A3B8', textAlign: 'center',
            letterSpacing: '0.18em', marginBottom: 22, fontWeight: 800,
          }}>
            SmaPlan
          </div>
          <div style={{ position: 'relative', flex: 1 }}>
            {/* Q1: データ使用量 */}
            <div className="mock-step mock-step-1" style={panelBase}>
              <div style={progRow}>
                <div style={dot(true)} />
                <div style={dot(false)} />
                <div style={dot(false)} />
              </div>
              <div style={qTag}>Q1</div>
              <div style={qLabel}>月のデータ使用量は？</div>
              <div style={optWrap}>
                <div style={optBase}>3GB以下</div>
                <div style={optBase}>3〜10GB</div>
                <div className="mock-hi mock-hi-1" style={optBase}>10〜20GB ✓</div>
                <div style={optBase}>20GB以上</div>
              </div>
            </div>

            {/* Q2: 通話 */}
            <div className="mock-step mock-step-2" style={panelBase}>
              <div style={progRow}>
                <div style={dot(true)} />
                <div style={dot(true)} />
                <div style={dot(false)} />
              </div>
              <div style={qTag}>Q2</div>
              <div style={qLabel}>通話の頻度は？</div>
              <div style={optWrap}>
                <div style={optBase}>ほぼ使わない</div>
                <div className="mock-hi mock-hi-2" style={optBase}>たまにする ✓</div>
                <div style={optBase}>毎日使う</div>
              </div>
            </div>

            {/* Q3: こだわり */}
            <div className="mock-step mock-step-3" style={panelBase}>
              <div style={progRow}>
                <div style={dot(true)} />
                <div style={dot(true)} />
                <div style={dot(true)} />
              </div>
              <div style={qTag}>Q3</div>
              <div style={qLabel}>こだわりポイントは？</div>
              <div style={optWrap}>
                <div className="mock-hi mock-hi-3" style={optBase}>安さ重視 ✓</div>
                <div style={optBase}>通信速度重視</div>
                <div style={optBase}>データ量重視</div>
              </div>
            </div>

            {/* Loading */}
            <div className="mock-step mock-step-4" style={{
              ...panelBase,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 16,
            }}>
              <div className="mock-spin" style={{
                width: 42, height: 42,
                borderRadius: '50%',
                border: '3px solid #E2E8F0',
                borderTopColor: '#1D4ED8',
              }} />
              <div style={{
                fontSize: 12, fontWeight: 800, color: '#475569',
                textAlign: 'center', lineHeight: 1.5,
              }}>
                あなたに最適な<br />プランを分析中...
              </div>
            </div>

            {/* Result */}
            <div className="mock-step mock-step-5" style={panelBase}>
              <div style={{
                background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                borderRadius: 12, padding: '11px 14px', color: '#fff',
                marginBottom: 10,
              }}>
                <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 700 }}>乗り換えで</div>
                <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1, marginTop: 2 }}>
                  年間 54,000円
                </div>
                <div style={{ fontSize: 11, fontWeight: 800 }}>おトク！</div>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6,
              }}>
                あなたに最適なプラン
              </div>
              <div style={{
                padding: '10px 12px',
                background: '#fff',
                border: '2px solid #1D4ED8',
                borderRadius: 12,
                boxShadow: '0 6px 16px rgba(29, 78, 216, 0.15)',
                marginBottom: 6,
              }}>
                <div style={{
                  fontSize: 10, color: '#64748B', marginBottom: 2, fontWeight: 700,
                }}>
                  🥇 第1位
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#0F172A' }}>
                    ahamo 30GB
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#1D4ED8', lineHeight: 1 }}>
                      2,970
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#1D4ED8' }}>
                      円/月
                    </span>
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                padding: '7px 12px',
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                marginBottom: 4,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>
                  🥈 LINEMO V
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>
                  2,970<span style={{ fontSize: 8, fontWeight: 700 }}>円</span>
                </div>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                padding: '7px 12px',
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>
                  🥉 日本通信
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>
                  1,390<span style={{ fontSize: 8, fontWeight: 700 }}>円</span>
                </div>
              </div>
            </div>
          </div>
          {/* bottom footer bar (always visible) */}
          <div style={{
            marginTop: 10,
            paddingTop: 9,
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            fontSize: 10,
            fontWeight: 700,
            color: '#64748B',
            letterSpacing: '0.02em',
            position: 'relative',
            zIndex: 1,
          }}>
            <span>📱 全20プラン</span>
            <span style={{ color: '#CBD5E1' }}>|</span>
            <span>⚡ 30秒</span>
            <span style={{ color: '#CBD5E1' }}>|</span>
            <span>🔒 匿名</span>
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 8,
        textAlign: 'center',
        fontSize: 9,
        color: '#9CA3AF',
      }}>
        ※表示はイメージです
      </div>
    </div>
  );
}

function CostInput({
  value,
  onChange,
}: {
  value: string | string[] | number | undefined;
  onChange: (v: number | typeof UNKNOWN | undefined) => void;
}) {
  const isUnknown = value === UNKNOWN;
  const numValue = typeof value === 'number' ? value : undefined;
  const [text, setText] = useState(numValue !== undefined ? String(numValue) : '');

  useEffect(() => {
    if (numValue === undefined) setText('');
    else setText(String(numValue));
  }, [numValue]);

  const outOfRange =
    !isUnknown && text !== '' && (Number(text) < COST_MIN || Number(text) > COST_MAX);

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setText(raw);
    if (raw === '') onChange(undefined);
    else onChange(Number(raw));
  }

  function handleToggleUnknown(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      onChange(UNKNOWN);
    } else {
      onChange(undefined);
    }
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 18px',
        background: isUnknown ? 'var(--bg)' : 'var(--bg-card)',
        border: `2px solid ${outOfRange ? '#FCA5A5' : 'var(--border)'}`,
        borderRadius: 12,
        opacity: isUnknown ? 0.55 : 1,
      }}>
        <input
          type="number"
          inputMode="numeric"
          min={COST_MIN}
          max={COST_MAX}
          step={100}
          placeholder="例：7000"
          value={isUnknown ? '' : text}
          onChange={handleTextChange}
          disabled={isUnknown}
          style={{
            flex: 1, minWidth: 0,
            fontSize: 18, fontWeight: 600,
            color: 'var(--text-main)',
            background: 'transparent',
            border: 'none', outline: 'none',
            padding: '4px 0',
          }}
        />
        <span style={{ fontSize: 14, color: 'var(--text-sub)', fontWeight: 500 }}>円/月</span>
      </div>

      {outOfRange && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#B91C1C' }}>
          {COST_MIN.toLocaleString()}〜{COST_MAX.toLocaleString()}円の範囲で入力してください
        </div>
      )}

      <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        ※端末の分割払いを除いた通信料のみを入力してください
      </div>

      <label style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        marginTop: 14, cursor: 'pointer',
        fontSize: 14, color: 'var(--text-sub)',
      }}>
        <input
          type="checkbox"
          checked={isUnknown}
          onChange={handleToggleUnknown}
          style={{ width: 18, height: 18, cursor: 'pointer' }}
        />
        わからない
      </label>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>('landing');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current); };
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.sp-section-fade');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('sp-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [view]);

  const q = QUESTIONS[step];

  function startDiagnose() {
    track('diagnose_start');
    setView('diagnose');
    setStep(0);
    setAnswers({});
    setResult(null);
    setError(null);
  }

  function handleRetry() {
    track('retry_diagnose');
    resetAll();
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
      }, 280);
    }
  }

  function setCost(val: number | typeof UNKNOWN | undefined) {
    setAnswers(prev => {
      const next = { ...prev };
      if (val === undefined) delete next.q2_monthly_cost;
      else next.q2_monthly_cost = val;
      return next;
    });
  }

  function isSelected(key: string, val: string) {
    const a = answers[key];
    if (Array.isArray(a)) return a.includes(val);
    return a === val;
  }

  function canNext() {
    const a = answers[q.key];
    if (Array.isArray(a)) return a.length > 0;
    if (q.input === 'number') {
      if (a === UNKNOWN) return true;
      return typeof a === 'number' && a >= COST_MIN && a <= COST_MAX;
    }
    return !!a;
  }

  async function submitDiagnosis() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'エラーが発生しました');
      setResult(data);
      setView('result');
      track('diagnose_complete');
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
    } else {
      await submitDiagnosis();
    }
  }

  function handleBack() {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (step > 0) setStep(s => s - 1);
    else setView('landing');
  }

  if (loading) {
    return (
      <main style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24,
      }}>
        <style>{`
          @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.9} 50%{transform:scale(1.15);opacity:1} }
          @keyframes fadeInMsg { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
        <div style={{ display: 'flex', gap: 10 }}>
          {[0, 0.15, 0.3].map((d, i) => (
            <span key={i} style={{
              width: 14, height: 14, borderRadius: '50%',
              background: 'var(--accent)',
              animation: `pulse 1.1s ease-in-out ${d}s infinite`,
            }} />
          ))}
        </div>
        <LoadingMessage />
      </main>
    );
  }

  if (view === 'landing') {
    const baExamples = [
      {
        beforeId: 'docomo_max', afterId: 'ahamo_30gb',
        beforeData: '無制限', afterData: '20GB',
        beforeCall: '5分かけ放題', afterCall: '5分かけ放題',
        beforeDataTip: '実はWi-Fiがあれば月20GBで足りているかも',
        beforeCallTip: 'LINE通話で足りていませんか？',
        afterDataTip: '普段使いには十分な容量',
        afterCallTip: '短い通話もしっかりカバー',
      },
      {
        beforeId: 'ymobile_simple3_s', afterId: 'iijmio_5gb',
        beforeData: '5GB', afterData: '5GB',
        beforeCall: 'なし', afterCall: 'なし',
        beforeDataTip: '大手キャリアの回線品質に月額料金を払いすぎかも',
        beforeCallTip: '同じプランでも格安SIMなら半額以下に',
        afterDataTip: '同じ5GBを大幅に安く使える',
        afterCallTip: 'LINE通話メインなら通話オプション不要',
      },
      {
        beforeId: 'ahamo_110gb', afterId: 'rakuten_saikyo',
        beforeData: '110GB', afterData: '無制限',
        beforeCall: '5分かけ放題', afterCall: '専用アプリで無料',
        beforeDataTip: '110GBも毎月使い切れていますか？',
        beforeCallTip: '月額オプション料を払い続けていませんか？',
        afterDataTip: '無制限だから容量を気にしなくてOK',
        afterCallTip: 'Rakuten Linkで国内通話が無料',
      },
    ];
    const carrierBadges = [
      { name: 'ドコモ', bg: '#CC0033' },
      { name: 'au', bg: '#EB5505' },
      { name: 'ソフトバンク', bg: '#E60012' },
      { name: '楽天モバイル', bg: '#BF0000' },
      { name: 'ahamo', bg: '#1D4ED8' },
      { name: 'LINEMO', bg: '#06C755' },
      { name: 'Y!mobile', bg: '#E60033' },
      { name: 'UQモバイル', bg: '#E66A00' },
      { name: 'IIJmio', bg: '#333' },
      { name: 'mineo', bg: '#69B027' },
    ];
    return (
      <div style={{ background: '#fff' }}>
        <style>{`
          @keyframes mockPop { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
          .sp-cta { transition: transform 0.18s ease, box-shadow 0.18s ease; }
          .sp-cta:hover { transform: scale(1.05); box-shadow: 0 10px 24px rgba(67, 56, 202, 0.25); }
          .sp-cta:active { transform: scale(1.02); }
          .sp-feature { transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; }
          .sp-feature:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(15, 23, 42, 0.10), 0 8px 16px rgba(15, 23, 42, 0.06); border-color: rgba(45, 92, 197, 0.25) !important; }
          .sp-faq-item { background: #fff; border: 1px solid var(--border); border-radius: 16px; transition: background 0.15s ease; }
          .sp-faq-item[open] { background: var(--accent-light); border-color: var(--accent-border); }
          .sp-faq-summary { list-style: none; cursor: pointer; padding: 24px 28px; display: flex; align-items: center; gap: 14px; font-size: 16px; font-weight: 700; color: var(--text-main); outline: none; }
          .sp-faq-summary::-webkit-details-marker { display: none; }
          .sp-faq-summary::after { content: '▾'; margin-left: auto; color: var(--accent); transition: transform 0.2s ease; font-size: 16px; }
          .sp-faq-item[open] .sp-faq-summary::after { transform: rotate(180deg); }
          .sp-faq-q { flex-shrink: 0; width: 28px; height: 28px; border-radius: 8px; background: var(--accent); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; }
          .sp-faq-answer { padding: 0 28px 24px 70px; font-size: 15px; line-height: 1.9; color: var(--text-sub); margin: 0; }
          .sp-hero-grid { display: grid; grid-template-columns: 1fr; gap: 40px; align-items: center; }
          .sp-hero-mock { display: block; transform: scale(0.81); transform-origin: top center; margin-bottom: -108px; }
          @media (min-width: 900px) {
            .sp-hero-grid { grid-template-columns: 1.15fr 0.85fr; gap: 56px; }
            .sp-hero-text { text-align: left; }
            .sp-hero-text .sp-hero-cta-wrap { align-items: flex-start; }
            .sp-hero-mock { transform: none; margin-bottom: 0; }
          }
        `}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
        />
        <SiteHeader />

        {/* ── HERO ── */}
        <section className="sp-hero-block">
          <div className="sp-container">
            <div className="sp-hero-grid">
              <div className="sp-hero-text" style={{ textAlign: 'center' }}>
                <h1 style={{
                  fontSize: 'clamp(44px, 8vw, 80px)',
                  fontWeight: 700, lineHeight: 1.15,
                  margin: '0 0 28px', color: 'var(--text-main)',
                  letterSpacing: '-0.02em',
                }}>
                  年間<span style={{ fontSize: '1.4em', fontWeight: 800, color: 'var(--accent)' }}>5</span>万円
                  <br />
                  安くなるかも
                </h1>
                <p style={{
                  fontSize: 'clamp(16px, 2.2vw, 20px)',
                  color: 'var(--text-sub)',
                  margin: '0 0 44px', lineHeight: 1.75,
                }}>
                  10問・30秒の無料AI診断で<br />
                  あなたに最適なプランが見つかる
                </p>
                <div className="sp-hero-cta-wrap" style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 18,
                }}>
                  <button onClick={startDiagnose} className="sp-cta-pill">
                    診断スタート →
                  </button>
                  <div style={{ display: 'flex', gap: 28, fontSize: 13, color: 'var(--text-sub)', fontWeight: 600 }}>
                    <span><span style={{ color: '#0d9f5f', marginRight: 4 }}>✓</span>全20プラン対応</span>
                    <span><span style={{ color: '#0d9f5f', marginRight: 4 }}>✓</span>個人情報不要</span>
                    <span><span style={{ color: '#0d9f5f', marginRight: 4 }}>✓</span>完全無料</span>
                  </div>
                </div>
                <p style={{
                  fontSize: 12, color: 'var(--text-muted)',
                  margin: '32px 0 0', lineHeight: 1.7,
                }}>
                  ※ドコモ eximo（月額7,315円）からahamo（月額2,970円）に乗り換えた場合の当サイト試算
                </p>
              </div>
              <div className="sp-hero-mock">
                <PhoneMockup />
              </div>
            </div>
          </div>
        </section>

        {/* ── 使い方セクション ── */}
        <section className="sp-block sp-section-fade" style={{ background: 'var(--bg-soft)' }}>
          <div className="sp-container">
            <h2 className="sp-h2">使い方はシンプル</h2>
            <p className="sp-h2-sub">たった30秒、3ステップで完了</p>
            <div className="sp-feature-grid">
              {[
                { num: '01', title: '質問に答える', desc: '使い方やこだわりなど、10問に答えるだけ', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                { num: '02', title: 'プランを比較', desc: '全20プランから最適なものを自動で選定', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg> },
                { num: '03', title: '節約額がわかる', desc: '今より年間いくらお得か具体的に表示', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M15.5 9.5c-.3-1-1.5-1.5-3.5-1.5s-3.1.8-3.1 2c0 2.4 6.1 1.2 6.1 4 0 1.3-1.5 2-3.5 2s-3.2-.5-3.5-1.5"/></svg> },
              ].map((s) => (
                <div key={s.num} style={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 20, padding: '40px 28px',
                  textAlign: 'center',
                }}>
                  <div style={{ marginBottom: 16, color: 'var(--accent)', display: 'flex', justifyContent: 'center' }}>
                    {s.icon}
                  </div>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: 'var(--accent)',
                    letterSpacing: '0.08em', marginBottom: 8,
                  }}>STEP {s.num}</div>
                  <div style={{
                    fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 10,
                  }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BEFORE / AFTER セクション ── */}
        <section className="sp-block sp-section-fade" style={{ background: 'linear-gradient(180deg, var(--bg-soft) 0%, #eeedf8 100%)', padding: '140px 0' }}>
          <div className="sp-container">
            <h2 className="sp-h2">
              乗り換えると<br />
              こんなに変わる
            </h2>
            <p className="sp-h2-sub">
              プラン見直しだけで、年間数万円の節約も可能
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
              {baExamples.map((ex) => (
                <BeforeAfterCard key={`${ex.beforeId}-${ex.afterId}`} {...ex} />
              ))}
            </div>

            <div style={{
              marginTop: 32, fontSize: 12, color: 'var(--text-sub)',
              lineHeight: 1.9, textAlign: 'center',
            }}>
              ※料金は税込。割引適用前の標準価格での比較です<br />
              ※実際の節約額はご利用状況・適用中の割引により異なります
            </div>

            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <button onClick={startDiagnose} className="sp-cta-pill">
                あなたの節約額を診断する →
              </button>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA（ダーク） ── */}
        <section className="sp-block sp-block-dark sp-section-fade" style={{ background: '#0f1629', padding: '140px 0' }}>
          <div className="sp-container" style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              padding: '7px 18px', borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#93C5FD',
              fontSize: 13, fontWeight: 700, marginBottom: 28,
              letterSpacing: '0.05em',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}>
              完全無料・登録不要
            </div>
            <h2 style={{
              fontSize: 'clamp(36px, 7vw, 64px)',
              fontWeight: 700, lineHeight: 1.2,
              margin: '0 0 20px', color: '#fff',
              letterSpacing: '-0.02em',
            }}>
              今すぐ<br />
              無料診断
            </h2>
            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 48px', lineHeight: 1.75,
            }}>
              30秒で、あなたにぴったりの<br />
              スマホプランが見つかる
            </p>
            <button onClick={startDiagnose} className="sp-cta-pill">
              診断スタート →
            </button>
            <div style={{
              display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
              gap: '8px 24px', marginTop: 32,
              fontSize: 13, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600,
            }}>
              <span>登録不要</span>
              <span>全キャリア対応</span>
              <span>結果はその場で表示</span>
            </div>
          </div>
        </section>

        {/* ── 対応キャリア + FAQ ── */}
        <section className="sp-block sp-section-fade" style={{ background: '#fff', padding: '56px 0 80px' }}>
          <div className="sp-container">
            <div style={{
              fontSize: 13, fontWeight: 700, color: 'var(--text-muted)',
              letterSpacing: '0.2em', textAlign: 'center', marginBottom: 28,
            }}>
              対応キャリア
            </div>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 16,
              justifyContent: 'center', marginBottom: 96,
            }}>
              {carrierBadges.map(c => (
                <span key={c.name} style={{
                  padding: '8px 18px', borderRadius: 999,
                  background: '#fff', border: '1px solid var(--border)',
                  fontSize: 13, fontWeight: 600, color: 'var(--text-main)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.bg, flexShrink: 0 }} />
                  {c.name}
                </span>
              ))}
              <span style={{
                padding: '8px 18px', borderRadius: 999,
                background: '#fff', border: '1px solid var(--border)',
                fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                + 他10プラン
              </span>
            </div>

            <h2 className="sp-h2">
              よくある質問
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 40 }}>
              {FAQ_ITEMS.map((item, i) => (
                <details key={i} className="sp-faq-item">
                  <summary className="sp-faq-summary">
                    <span className="sp-faq-q" aria-hidden="true">Q</span>
                    <span style={{ flex: 1 }}>{item.question}</span>
                  </summary>
                  <p className="sp-faq-answer">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          padding: '64px 0 48px',
          background: '#0F172A',
          color: 'rgba(255,255,255,0.7)',
        }}>
          <div className="sp-container" style={{
            textAlign: 'center',
            display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center',
          }}>
            <div style={{
              display: 'flex', gap: 28, flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <Link
                href="/carriers"
                style={{
                  fontSize: 14, color: 'rgba(255,255,255,0.85)',
                  textDecoration: 'none', fontWeight: 500,
                }}
              >
                プラン一覧
              </Link>
              <Link
                href="/blog"
                style={{
                  fontSize: 14, color: 'rgba(255,255,255,0.85)',
                  textDecoration: 'none', fontWeight: 500,
                }}
              >
                ブログ
              </Link>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              © 2026 SmaPlan
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (view === 'result' && result) {
    const topRec = result.recommendations[0];
    const topSaving = topRec?.annual_saving ?? 0;
    const shareText = `AIが私にぴったりのスマホプランを診断してくれた！\n1位: ${topRec?.carrier} ${topRec?.plan_name}\n${topSaving > 0 ? `年間${topSaving.toLocaleString()}円お得に！\n` : ''}\nあなたも試してみて👇\nhttps://smaplan.com`;

    return (
      <>
        <SiteHeader />
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '20px 20px 40px' }}>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button onClick={resetAll} style={{
            padding: '6px 14px', background: 'transparent',
            border: '1px solid var(--border)', borderRadius: 8,
            cursor: 'pointer', fontSize: 12, color: 'var(--text-sub)',
          }}>← やり直す</button>
        </div>

        {error && <ErrorBanner message={error} />}

        {topSaving > 0 && (
          <>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, #2563EB 100%)',
              color: '#fff', borderRadius: 16, padding: '28px 20px',
              textAlign: 'center', marginBottom: 8,
              boxShadow: '0 8px 24px rgba(29, 78, 216, 0.3)',
            }}>
              <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 6 }}>乗り換えたら</div>
              <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, marginBottom: 4 }}>
                年間 {topSaving.toLocaleString()}円
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>おトクに！</div>
            </div>
            <div style={{
              fontSize: 12, color: 'var(--text-sub)',
              textAlign: 'center', marginBottom: 24, lineHeight: 1.6,
              padding: '0 8px',
            }}>
              ※AIによる推定値です。実際の金額はご利用状況・割引適用により異なります
            </div>
          </>
        )}

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24,
        }}>
          <div style={{
            padding: '16px', background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 12,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>推定データ使用量</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)' }}>
              月 {result.estimated_data_gb}GB
            </div>
          </div>
          <div style={{
            padding: '16px', background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 12,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>現在の推定月額</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)' }}>
              {result.current_estimated_cost.toLocaleString()}円
            </div>
          </div>
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 12 }}>
          おすすめプラン TOP 3
        </div>

        <div className="sp-result-table-wrap" style={{
          overflowX: 'auto',
          marginBottom: 20,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13,
            tableLayout: 'fixed',
          }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                <th style={{
                  padding: '10px 8px', textAlign: 'left',
                  fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
                  borderBottom: '1px solid var(--border)',
                  width: '38%',
                }}>プラン名</th>
                <th style={{
                  padding: '10px 6px', textAlign: 'right',
                  fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
                  borderBottom: '1px solid var(--border)',
                  width: '22%',
                }}>月額</th>
                <th style={{
                  padding: '10px 6px', textAlign: 'right',
                  fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
                  borderBottom: '1px solid var(--border)',
                  width: '18%',
                }}>データ</th>
                <th style={{
                  padding: '10px 8px', textAlign: 'right',
                  fontSize: 11, fontWeight: 700, color: 'var(--text-sub)',
                  borderBottom: '1px solid var(--border)',
                  width: '22%',
                }}>年間節約</th>
              </tr>
            </thead>
            <tbody>
              {result.recommendations.map((rec, i) => {
                const isLast = i === result.recommendations.length - 1;
                const isTop = i === 0;
                return (
                  <tr key={i}>
                    <td style={{
                      padding: '12px 8px',
                      fontSize: 13, fontWeight: 600,
                      color: 'var(--text-main)',
                      borderBottom: isLast ? 'none' : '1px solid var(--border)',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: isTop ? 'var(--accent)' : 'var(--text-muted)',
                        marginRight: 6,
                      }}>
                        {rec.rank}位
                      </span>
                      {rec.plan_name}
                    </td>
                    <td style={{
                      padding: '12px 6px', textAlign: 'right',
                      fontSize: 13, fontWeight: 700,
                      color: 'var(--accent)',
                      borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    }}>
                      {rec.monthly_cost.toLocaleString()}円
                    </td>
                    <td style={{
                      padding: '12px 6px', textAlign: 'right',
                      fontSize: 12, color: 'var(--text-sub)',
                      borderBottom: isLast ? 'none' : '1px solid var(--border)',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {rec.data_gb}
                    </td>
                    <td style={{
                      padding: '12px 8px', textAlign: 'right',
                      fontSize: 12, fontWeight: 700,
                      color: rec.annual_saving > 0 ? 'var(--success)' : 'var(--text-muted)',
                      borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    }}>
                      {rec.annual_saving > 0
                        ? `${rec.annual_saving.toLocaleString()}円`
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {result.recommendations.map((rec, i) => {
            const isTop = i === 0;
            const diff = result.current_estimated_cost - rec.monthly_cost;
            return (
              <div key={i} style={{
                background: 'var(--bg-card)',
                border: isTop ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 14,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isTop ? '0 10px 28px rgba(29, 78, 216, 0.16)' : 'none',
              }}>
                {isTop && (
                  <div style={{
                    background: 'var(--accent)', color: '#fff',
                    padding: '8px 16px',
                    fontSize: 12, fontWeight: 800,
                    letterSpacing: '0.06em',
                    textAlign: 'center',
                  }}>
                    ⭐ 最もおすすめ
                  </div>
                )}
                <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    background: isTop ? 'var(--accent)' : 'var(--text-sub)',
                    color: '#fff', padding: '3px 12px', borderRadius: 20,
                  }}>
                    {rec.rank === 1 ? '🥇 1位' : rec.rank === 2 ? '🥈 2位' : '🥉 3位'}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{rec.carrier}</span>
                </div>

                <div style={{
                  fontSize: isTop ? 20 : 18, fontWeight: 700,
                  color: 'var(--text-main)', marginBottom: 12,
                }}>
                  {rec.plan_name}
                </div>

                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 8,
                  padding: '12px 14px', background: 'var(--accent-light)',
                  borderRadius: 10, marginBottom: 12,
                }}>
                  <span style={{
                    fontSize: isTop ? 30 : 26, fontWeight: 800, color: 'var(--accent)',
                  }}>
                    {rec.monthly_cost.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>円/月</span>
                  {diff > 0 && (
                    <span style={{
                      marginLeft: 'auto', fontSize: 12, color: 'var(--success)',
                      fontWeight: 700, background: 'var(--success-light)',
                      padding: '3px 8px', borderRadius: 6,
                    }}>
                      -{diff.toLocaleString()}円/月
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 12, padding: '4px 10px',
                    background: 'var(--bg)', color: 'var(--text-sub)',
                    borderRadius: 6, border: '1px solid var(--border)',
                  }}>
                    📊 {rec.data_gb}
                  </span>
                  <span style={{
                    fontSize: 12, padding: '4px 10px',
                    background: 'var(--bg)', color: 'var(--text-sub)',
                    borderRadius: 6, border: '1px solid var(--border)',
                  }}>
                    📞 {rec.call_option}
                  </span>
                </div>

                <p style={{
                  fontSize: 14, color: 'var(--text-main)', lineHeight: 1.7,
                  margin: '0 0 16px',
                }}>
                  {rec.reason}
                </p>

                {rec.annual_saving > 0 && (
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: 'var(--success)',
                    marginBottom: 16,
                  }}>
                    💰 年間 {rec.annual_saving.toLocaleString()}円 節約
                  </div>
                )}

                <a
                  href={rec.affiliate_key ? getLink(rec.affiliate_key) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('affiliate_click', {
                    plan_name: rec.plan_name,
                    carrier: rec.carrier,
                    rank: rec.rank,
                  })}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '100%', minHeight: 48,
                    background: isTop ? 'var(--accent)' : 'var(--bg-card)',
                    color: isTop ? '#fff' : 'var(--accent)',
                    border: isTop ? 'none' : '2px solid var(--accent)',
                    borderRadius: 10, textDecoration: 'none',
                    fontSize: 15, fontWeight: 700,
                    boxShadow: isTop ? '0 4px 12px rgba(29, 78, 216, 0.25)' : 'none',
                  }}
                >
                  詳細を見る →
                </a>
                </div>
              </div>
            );
          })}
        </div>

        {result.advice && (
          <div style={{
            padding: '18px 20px', background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 12,
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
              💡 AIからのアドバイス
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)' }}>
              {result.advice}
            </p>
          </div>
        )}

        {result.related_posts && result.related_posts.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: 'var(--text-sub)', marginBottom: 12,
            }}>
              📚 あわせて読みたい
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.related_posts.map(p => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  onClick={() => track('related_post_click', { slug: p.slug })}
                  style={{
                    display: 'block',
                    padding: '14px 16px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    textDecoration: 'none',
                  }}
                >
                  <div style={{
                    fontSize: 14, fontWeight: 700,
                    color: 'var(--text-main)', marginBottom: 4,
                    lineHeight: 1.5,
                  }}>
                    {p.title}
                  </div>
                  <div style={{
                    fontSize: 12, color: 'var(--text-sub)',
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {p.description}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          marginTop: 32,
        }}>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', minHeight: 48,
              background: '#000', color: '#fff', borderRadius: 10,
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
            }}
          >
            𝕏 結果をシェアする
          </a>
          <button
            onClick={handleRetry}
            style={{
              padding: '10px 24px', minHeight: 44,
              background: 'transparent', color: 'var(--text-sub)',
              border: '1px solid var(--border)', borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            もう一度診断する
          </button>
        </div>
      </main>
      </>
    );
  }

  const remaining = QUESTIONS.length - step - 1;
  const percent = Math.round(((step + 1) / QUESTIONS.length) * 100);

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 40px' }}>
      <LogoHeader compact />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        marginBottom: 10,
      }}>
        {QUESTIONS.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 6, borderRadius: 3,
            background: i <= step ? 'var(--accent)' : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{
        marginBottom: 20, fontSize: 12, color: 'var(--text-sub)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
      }}>
        <span>質問 {step + 1} / {QUESTIONS.length}（{percent}% 完了）</span>
        <span style={{ display: 'inline-flex', gap: 10 }}>
          {q.multi && <span>複数選択可</span>}
          {remaining > 0 && remaining <= 3 && (
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>あと{remaining}問！</span>
          )}
        </span>
      </div>

      <h2 style={{
        fontSize: 22, fontWeight: 700, color: 'var(--text-main)',
        margin: '0 0 20px', lineHeight: 1.5,
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <span style={{
          flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--accent)', color: '#fff',
          fontSize: 13, fontWeight: 800, letterSpacing: '0.02em',
          marginTop: 2,
        }}>Q{step + 1}</span>
        <span style={{ flex: 1 }}>{q.label}</span>
      </h2>

      {q.input === 'number' ? (
        <CostInput
          value={answers.q2_monthly_cost}
          onChange={setCost}
        />
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24,
        }}>
          {q.options.map(opt => (
            <OptionButton
              key={opt}
              label={opt}
              selected={isSelected(q.key, opt)}
              multi={q.multi}
              onClick={() => toggle(q.key, opt, q.multi)}
            />
          ))}
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={handleBack}
          style={{
            flex: '0 0 auto', padding: '14px 20px', minHeight: 52,
            background: 'transparent', color: 'var(--text-sub)',
            border: '1px solid var(--border)', borderRadius: 10,
            cursor: 'pointer', fontSize: 15, fontWeight: 600,
          }}
        >
          {step === 0 ? '← トップへ' : '← 戻る'}
        </button>
        {(q.multi || q.input === 'number' || step === QUESTIONS.length - 1) && (
          <button
            onClick={handleNext}
            disabled={!canNext()}
            style={{
              flex: 1, padding: '14px', minHeight: 52,
              background: canNext() ? 'var(--accent)' : 'var(--border)',
              color: canNext() ? '#fff' : 'var(--text-muted)',
              border: 'none', borderRadius: 10,
              cursor: canNext() ? 'pointer' : 'default',
              fontSize: 15, fontWeight: 700,
              transition: 'all 0.15s',
            }}
          >
            {step < QUESTIONS.length - 1 ? '次へ →' : 'AIに診断してもらう 🤖'}
          </button>
        )}
      </div>
    </main>
  );
}
