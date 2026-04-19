'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getKaisenLink, getKaisenImpression } from '@/data/kaisenAffiliateLinks';
import { track } from '@/lib/analytics';
import { SiteHeader, LogoHeader } from '@/app/components/SiteHeader';

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
      borderRadius: 8, color: '#991B1B', fontSize: 13,
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
        border: selected ? '2px solid var(--accent)' : '2px solid var(--border)',
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
    answer: 'ドコモ・au・ソフトバンクのスマホをお使いの場合、対応する光回線とのセット割で毎月550〜1,100円割引されます。家族全員に適用されるため、4人家族なら最大で月額4,400円、年間52,800円の節約になります。',
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

  const sideStyle = (isAfter: boolean): React.CSSProperties => ({
    flex: 1, padding: '28px 24px',
    background: isAfter ? 'var(--accent-light)' : '#fff',
  });

  return (
    <div ref={ref} style={{
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 20, overflow: 'hidden',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `all 0.6s cubic-bezier(0.22,1,0.36,1) ${index * 0.1}s`,
    }}>
      <div className="sp-ba-cards">
        {/* Before */}
        <div style={sideStyle(false)}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>BEFORE</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 12 }}>{example.beforeName}</div>
          <div>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-main)' }}>
              {example.beforeCost.toLocaleString()}
            </span>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-sub)', marginLeft: 2 }}>円/月</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="sp-ba-arrow-center">
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />
            </svg>
          </div>
        </div>

        {/* After */}
        <div style={sideStyle(true)}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 8 }}>AFTER</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', marginBottom: 12 }}>{example.afterName}</div>
          <div>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>
              {example.afterCost.toLocaleString()}
            </span>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-sub)', marginLeft: 2 }}>円/月</span>
          </div>
        </div>
      </div>

      {/* Saving banner */}
      <div style={{
        background: '#F5F8FF', borderTop: '0.5px solid #E3ECF8',
        padding: '18px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 14, color: '#555' }}>
            {example.detail}
            {example.detailComment && (<>（<span style={{ color: '#2D5CC5' }}>{example.detailComment}</span>）</>)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 14, color: '#888' }}>年間</span>
          <span style={{
            fontSize: 'clamp(44px, 10vw, 60px)', fontWeight: 800, color: '#2D5CC5',
            letterSpacing: '-0.02em', lineHeight: 1,
          }}>{saving.toLocaleString()}</span>
          <span style={{ fontSize: 14, color: '#888' }}>円おトク</span>
        </div>
      </div>
    </div>
  );
}

function WifiIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path d="M-6,0 Q0,-8 6,0" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M-4,3 Q0,-2 4,3" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45" />
      <circle cx="0" cy="6" r="2" fill="#4338ca" opacity="0.7" />
    </g>
  );
}

function HouseIllustration() {
  return (
    <div aria-hidden="true">
      <svg viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', maxWidth: 400, margin: '0 auto', display: 'block' }}
      >
        <defs>
          <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4338ca" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#4338ca" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eef0ff" />
            <stop offset="100%" stopColor="#f8f9fe" />
          </linearGradient>
          <radialGradient id="wifiGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4338ca" stopOpacity="0.1" />
            <stop offset="60%" stopColor="#4338ca" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#4338ca" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ══ WiFi Concentric Pulse Circles (behind everything) ══ */}
        <circle className="wifi-ring" cx="200" cy="290" r="40" fill="none" stroke="#a5b4fc" strokeWidth="2"
          style={{ animation: 'ringPulse 4s ease-out infinite', transformOrigin: '200px 290px' }} />
        <circle className="wifi-ring" cx="200" cy="290" r="80" fill="none" stroke="#a5b4fc" strokeWidth="1.5"
          style={{ animation: 'ringPulse 4s ease-out 0.8s infinite', transformOrigin: '200px 290px' }} />
        <circle className="wifi-ring" cx="200" cy="290" r="120" fill="none" stroke="#a5b4fc" strokeWidth="1"
          style={{ animation: 'ringPulse 4s ease-out 1.6s infinite', transformOrigin: '200px 290px' }} />
        <circle className="wifi-ring" cx="200" cy="290" r="160" fill="none" stroke="#c7d2fe" strokeWidth="0.8"
          style={{ animation: 'ringPulse 4s ease-out 2.4s infinite', transformOrigin: '200px 290px' }} />

        {/* ══ WiFi Glow behind router ══ */}
        <circle cx="200" cy="290" r="100" fill="url(#wifiGlow)" />

        {/* ══ Roof ══ */}
        <polygon points="200,18 16,140 384,140" fill="url(#roofGrad)" />
        <polyline points="200,18 16,140 384,140 200,18"
          stroke="#4338ca" strokeWidth="4" strokeLinejoin="round" fill="none" opacity="0.65" />
        {/* chimney */}
        <rect x="286" y="46" width="28" height="54" rx="4" fill="#e8eaf6" stroke="#4338ca" strokeWidth="2.5" opacity="0.4" />
        <rect x="283" y="40" width="34" height="8" rx="3" fill="#e8eaf6" stroke="#4338ca" strokeWidth="2" opacity="0.35" />

        {/* ══ Walls ══ */}
        <rect x="36" y="140" width="328" height="280" rx="4" fill="url(#wallGrad)" stroke="#4338ca" strokeWidth="3.5" opacity="0.5" />

        {/* ══ Floor divider (1F/2F) ══ */}
        <line x1="36" y1="280" x2="364" y2="280" stroke="#4338ca" strokeWidth="2.5" opacity="0.2" />
        <text x="46" y="158" fontSize="10" fontWeight="700" fill="#4338ca" opacity="0.2" fontFamily="system-ui,sans-serif">2F</text>
        <text x="46" y="298" fontSize="10" fontWeight="700" fill="#4338ca" opacity="0.2" fontFamily="system-ui,sans-serif">1F</text>

        {/* ══ Room dividers ══ */}
        <line x1="200" y1="140" x2="200" y2="280" stroke="#4338ca" strokeWidth="1.5" opacity="0.15" strokeDasharray="6 4" />
        <line x1="200" y1="280" x2="200" y2="420" stroke="#4338ca" strokeWidth="1.5" opacity="0.15" strokeDasharray="6 4" />

        {/* ══ Windows ══ */}
        {/* 2F left window */}
        <rect x="60" y="152" width="36" height="30" rx="3" fill="#c7d2fe" stroke="#4338ca" strokeWidth="2" opacity="0.3" />
        <line x1="78" y1="152" x2="78" y2="182" stroke="#4338ca" strokeWidth="1.2" opacity="0.15" />
        <line x1="60" y1="167" x2="96" y2="167" stroke="#4338ca" strokeWidth="1.2" opacity="0.15" />
        {/* 2F right window */}
        <rect x="304" y="152" width="36" height="30" rx="3" fill="#c7d2fe" stroke="#4338ca" strokeWidth="2" opacity="0.3" />
        <line x1="322" y1="152" x2="322" y2="182" stroke="#4338ca" strokeWidth="1.2" opacity="0.15" />
        <line x1="304" y1="167" x2="340" y2="167" stroke="#4338ca" strokeWidth="1.2" opacity="0.15" />

        {/* ══ Door (1F center) ══ */}
        <rect x="178" y="370" width="44" height="50" rx="4" fill="#c7d2fe" stroke="#4338ca" strokeWidth="2.5" opacity="0.3" />
        <circle cx="210" cy="398" r="3" fill="#4338ca" opacity="0.3" />
        <rect x="190" y="364" width="20" height="8" rx="3" fill="#c7d2fe" opacity="0.15" />

        {/* ═══════════════════════════════════════════════ */}
        {/* ══ 2F LEFT ROOM – Study / Office ══ */}
        {/* ═══════════════════════════════════════════════ */}

        {/* ── Desk ── */}
        <g transform="translate(58, 198)">
          <rect x="0" y="38" width="90" height="6" rx="2" fill="#4338ca" opacity="0.25" />
          <rect x="6" y="44" width="6" height="24" rx="2" fill="#4338ca" opacity="0.15" />
          <rect x="78" y="44" width="6" height="24" rx="2" fill="#4338ca" opacity="0.15" />
        </g>

        {/* ── Desktop PC (monitor + tower) ── */}
        <g transform="translate(64, 178)">
          {/* monitor */}
          <rect x="0" y="0" width="54" height="34" rx="4" fill="#4338ca" opacity="0.4" />
          <rect x="4" y="4" width="46" height="26" rx="2" fill="#c7d2fe" opacity="0.5" />
          {/* screen content */}
          <rect x="8" y="9" width="28" height="3" rx="1.5" fill="#4338ca" opacity="0.2" />
          <rect x="8" y="15" width="20" height="3" rx="1.5" fill="#4338ca" opacity="0.15" />
          <rect x="8" y="21" width="24" height="3" rx="1.5" fill="#4338ca" opacity="0.1" />
          {/* stand */}
          <rect x="21" y="34" width="12" height="4" rx="1" fill="#4338ca" opacity="0.3" />
          <rect x="14" y="36" width="26" height="3" rx="1.5" fill="#4338ca" opacity="0.2" />
          {/* tower */}
          <rect x="62" y="10" width="18" height="28" rx="3" fill="#4338ca" opacity="0.3" />
          <circle cx="71" cy="18" r="2" fill="#0d9f5f" opacity="0.6" />
          <rect x="65" y="26" width="12" height="2" rx="1" fill="#4338ca" opacity="0.15" />
          <rect x="65" y="31" width="12" height="2" rx="1" fill="#4338ca" opacity="0.1" />
        </g>
        <WifiIcon x={100} y={172} />

        {/* ── Chair ── */}
        <g transform="translate(88, 256)">
          <rect x="0" y="0" width="22" height="6" rx="3" fill="#4338ca" opacity="0.12" />
          <rect x="4" y="-14" width="14" height="16" rx="3" fill="#4338ca" opacity="0.08" />
        </g>

        {/* ═══════════════════════════════════════════════ */}
        {/* ══ 2F RIGHT ROOM – Bedroom ══ */}
        {/* ═══════════════════════════════════════════════ */}

        {/* ── Bed ── */}
        <g transform="translate(220, 222)">
          <rect x="0" y="0" width="90" height="44" rx="6" fill="#4338ca" opacity="0.08" />
          <rect x="0" y="0" width="90" height="10" rx="5" fill="#4338ca" opacity="0.12" />
          {/* pillow */}
          <rect x="6" y="4" width="24" height="10" rx="5" fill="#c7d2fe" opacity="0.3" />
          {/* blanket */}
          <rect x="4" y="16" width="82" height="24" rx="4" fill="#a5b4fc" opacity="0.12" />
        </g>

        {/* ── Smartphone on bedside ── */}
        <g transform="translate(326, 230)">
          <rect x="0" y="0" width="18" height="32" rx="4" fill="#4338ca" opacity="0.45" />
          <rect x="3" y="4" width="12" height="22" rx="2" fill="#c7d2fe" opacity="0.5" />
          <circle cx="9" cy="28" r="1.5" fill="#4338ca" opacity="0.2" />
        </g>
        <WifiIcon x={338} y={222} />

        {/* ── Bedside table ── */}
        <g transform="translate(320, 250)">
          <rect x="0" y="0" width="26" height="16" rx="3" fill="#4338ca" opacity="0.12" />
          <rect x="2" y="16" width="5" height="8" rx="1" fill="#4338ca" opacity="0.08" />
          <rect x="19" y="16" width="5" height="8" rx="1" fill="#4338ca" opacity="0.08" />
        </g>

        {/* ── Plant (2F right) ── */}
        <g transform="translate(224, 194)">
          <rect x="6" y="20" width="14" height="16" rx="3" fill="#4338ca" opacity="0.15" />
          {/* leaves */}
          <ellipse cx="13" cy="14" rx="10" ry="10" fill="#22c55e" opacity="0.2" />
          <ellipse cx="8" cy="10" rx="7" ry="8" fill="#22c55e" opacity="0.15" />
          <ellipse cx="18" cy="12" rx="6" ry="7" fill="#16a34a" opacity="0.12" />
          <line x1="13" y1="20" x2="13" y2="12" stroke="#22c55e" strokeWidth="2" opacity="0.2" />
        </g>

        {/* ═══════════════════════════════════════════════ */}
        {/* ══ 1F LEFT ROOM – Living Room ══ */}
        {/* ═══════════════════════════════════════════════ */}

        {/* ── Sofa ── */}
        <g transform="translate(50, 344)">
          <rect x="0" y="8" width="80" height="32" rx="8" fill="#4338ca" opacity="0.1" />
          <rect x="-6" y="2" width="14" height="40" rx="6" fill="#4338ca" opacity="0.08" />
          <rect x="72" y="2" width="14" height="40" rx="6" fill="#4338ca" opacity="0.08" />
          {/* cushions */}
          <rect x="8" y="12" width="28" height="20" rx="5" fill="#a5b4fc" opacity="0.1" />
          <rect x="42" y="12" width="28" height="20" rx="5" fill="#a5b4fc" opacity="0.08" />
        </g>

        {/* ── TV with stand ── */}
        <g transform="translate(52, 290)">
          {/* TV cabinet */}
          <rect x="-4" y="44" width="90" height="20" rx="4" fill="#4338ca" opacity="0.1" />
          {/* TV */}
          <rect x="0" y="0" width="82" height="44" rx="4" fill="#4338ca" opacity="0.4" />
          <rect x="4" y="4" width="74" height="36" rx="3" fill="#c7d2fe" opacity="0.5" />
          {/* play button */}
          <polygon points="34,16 34,30 46,23" fill="#4338ca" opacity="0.25" />
          {/* stand */}
          <rect x="34" y="44" width="14" height="4" rx="1" fill="#4338ca" opacity="0.2" />
        </g>
        <WifiIcon x={93} y={284} />

        {/* ── Tablet on sofa ── */}
        <g transform="translate(72, 340)">
          <rect x="0" y="0" width="30" height="20" rx="3" fill="#4338ca" opacity="0.35" />
          <rect x="3" y="3" width="24" height="14" rx="2" fill="#c7d2fe" opacity="0.4" />
        </g>
        <WifiIcon x={87} y={334} />

        {/* ═══════════════════════════════════════════════ */}
        {/* ══ 1F RIGHT ROOM – Work / Play ══ */}
        {/* ═══════════════════════════════════════════════ */}

        {/* ── Desk ── */}
        <g transform="translate(220, 340)">
          <rect x="0" y="0" width="100" height="6" rx="2" fill="#4338ca" opacity="0.22" />
          <rect x="6" y="6" width="6" height="28" rx="2" fill="#4338ca" opacity="0.12" />
          <rect x="88" y="6" width="6" height="28" rx="2" fill="#4338ca" opacity="0.12" />
        </g>

        {/* ── Laptop ── */}
        <g transform="translate(232, 312)">
          {/* base */}
          <rect x="0" y="22" width="52" height="8" rx="2" fill="#4338ca" opacity="0.35" />
          {/* screen */}
          <rect x="4" y="0" width="44" height="22" rx="3" fill="#4338ca" opacity="0.4" />
          <rect x="8" y="4" width="36" height="14" rx="2" fill="#c7d2fe" opacity="0.5" />
          {/* code lines */}
          <rect x="12" y="7" width="22" height="2" rx="1" fill="#4338ca" opacity="0.2" />
          <rect x="12" y="12" width="16" height="2" rx="1" fill="#4338ca" opacity="0.15" />
        </g>
        <WifiIcon x={260} y={306} />

        {/* ── Game Console ── */}
        <g transform="translate(302, 350)">
          <rect x="0" y="0" width="36" height="22" rx="4" fill="#4338ca" opacity="0.3" />
          <rect x="4" y="4" width="28" height="14" rx="2" fill="#c7d2fe" opacity="0.35" />
          <circle cx="18" cy="11" r="4" fill="#4338ca" opacity="0.15" />
          {/* controller */}
          <rect x="6" y="24" width="24" height="10" rx="5" fill="#4338ca" opacity="0.2" />
          <circle cx="13" cy="29" r="2" fill="#4338ca" opacity="0.12" />
          <circle cx="23" cy="29" r="2" fill="#4338ca" opacity="0.12" />
        </g>
        <WifiIcon x={320} y={344} />

        {/* ── Printer (under desk) ── */}
        <g transform="translate(222, 374)">
          <rect x="0" y="0" width="34" height="18" rx="3" fill="#4338ca" opacity="0.2" />
          <rect x="4" y="-4" width="26" height="6" rx="2" fill="#4338ca" opacity="0.12" />
          <rect x="8" y="10" width="18" height="3" rx="1" fill="#c7d2fe" opacity="0.3" />
          <circle cx="28" cy="6" r="2" fill="#0d9f5f" opacity="0.4" />
        </g>
        <WifiIcon x={239} y={364} />

        {/* ── Plant (1F right corner) ── */}
        <g transform="translate(348, 376)">
          <rect x="0" y="20" width="16" height="20" rx="3" fill="#4338ca" opacity="0.12" />
          <ellipse cx="8" cy="14" rx="12" ry="12" fill="#22c55e" opacity="0.18" />
          <ellipse cx="4" cy="10" rx="8" ry="10" fill="#22c55e" opacity="0.12" />
          <ellipse cx="14" cy="12" rx="7" ry="8" fill="#16a34a" opacity="0.1" />
          <line x1="8" y1="20" x2="8" y2="10" stroke="#22c55e" strokeWidth="2" opacity="0.15" />
        </g>

        {/* ── Shelf on 1F left wall ── */}
        <g transform="translate(140, 296)">
          <rect x="0" y="0" width="40" height="4" rx="1" fill="#4338ca" opacity="0.2" />
          {/* books */}
          <rect x="4" y="-16" width="6" height="16" rx="1" fill="#4338ca" opacity="0.15" />
          <rect x="12" y="-12" width="5" height="12" rx="1" fill="#a5b4fc" opacity="0.2" />
          <rect x="19" y="-14" width="6" height="14" rx="1" fill="#4338ca" opacity="0.12" />
          <rect x="27" y="-10" width="5" height="10" rx="1" fill="#a5b4fc" opacity="0.15" />
        </g>

        {/* ═══════════════════════════════════════════════ */}
        {/* ══ ROUTER (center of house, on 1F floor line) ══ */}
        {/* ═══════════════════════════════════════════════ */}
        <g transform="translate(182, 268)">
          {/* router body */}
          <rect x="0" y="12" width="36" height="24" rx="5" fill="#4338ca" opacity="0.9" />
          {/* antennas */}
          <line x1="10" y1="12" x2="6" y2="0" stroke="#4338ca" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <line x1="26" y1="12" x2="30" y2="0" stroke="#4338ca" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          {/* LEDs */}
          <circle cx="11" cy="28" r="3" fill="#0d9f5f" />
          <circle cx="25" cy="28" r="3" fill="#0d9f5f" opacity="0.5" />
          {/* ventilation */}
          <rect x="8" y="20" width="20" height="1.5" rx="0.75" fill="#fff" opacity="0.15" />
          <rect x="8" y="24" width="20" height="1.5" rx="0.75" fill="#fff" opacity="0.1" />
        </g>
      </svg>

      {/* ── Bottom badges ── */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 18,
        marginTop: 10, fontSize: 11, fontWeight: 600, color: '#94A3B8',
        letterSpacing: '0.02em',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#94A3B8" strokeWidth="1.2"/><path d="M5 8h6" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round"/><path d="M8 5v6" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round"/></svg>
          全14プラン
        </span>
        <span style={{ color: '#CBD5E1' }}>|</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M13 8A5 5 0 0 0 3 8" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round"/><path d="M8 3v5l3 3" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          30秒
        </span>
        <span style={{ color: '#CBD5E1' }}>|</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#94A3B8" strokeWidth="1.2"/><path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round"/></svg>
          匿名
        </span>
      </div>

      <div style={{ marginTop: 6, textAlign: 'center', fontSize: 9, color: '#B0B8C8' }}>
        ※表示はイメージです
      </div>
    </div>
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

  const heroCount = useCountUp(36000, heroInView, 900);

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
    return (
      <div style={{ background: '#fff' }}>
        <style>{`
          .kaisen-hero-grid { display: grid; grid-template-columns: 1fr; gap: 40px; align-items: center; }
          .kaisen-hero-text { text-align: left; }
          .kaisen-hero-text .kaisen-hero-cta-wrap { align-items: flex-start; }
          .kaisen-hero-illust { display: block; transform: scale(0.9); transform-origin: top center; margin-bottom: -40px; }
          @media (min-width: 900px) {
            .kaisen-hero-grid { grid-template-columns: 1.1fr 0.9fr; gap: 56px; }
            .kaisen-hero-illust { transform: none; margin-bottom: 0; }
          }
          @keyframes ringPulse {
            0% { opacity: 0.5; transform: scale(0.85); }
            50% { opacity: 0.25; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.15); }
          }
          @media (prefers-reduced-motion: reduce) {
            .wifi-ring { animation: none !important; opacity: 0.15 !important; }
          }
          .sp-faq-item { background: #fff; border: 1px solid var(--border); border-radius: 16px; transition: background 0.15s ease; }
          .sp-faq-item[open] { background: var(--accent-light); border-color: var(--accent-border); }
          .sp-faq-summary { list-style: none; cursor: pointer; padding: 24px 28px; display: flex; align-items: center; gap: 14px; font-size: 16px; font-weight: 700; color: var(--text-main); outline: none; }
          .sp-faq-summary::-webkit-details-marker { display: none; }
          .sp-faq-summary::after { content: '▾'; margin-left: auto; color: var(--accent); transition: transform 0.2s ease; font-size: 16px; }
          .sp-faq-item[open] .sp-faq-summary::after { transform: rotate(180deg); }
          .sp-faq-q { flex-shrink: 0; width: 28px; height: 28px; border-radius: 8px; background: var(--accent); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; }
          .sp-faq-answer { padding: 0 28px 24px 70px; font-size: 15px; line-height: 1.9; color: var(--text-sub); margin: 0; }
        `}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(KAISEN_FAQ_JSON_LD) }}
        />
        <SiteHeader />

        {/* ── HERO ── */}
        <section ref={heroRef} className="sp-hero-block">
          <div className="sp-container">
            <div className="kaisen-hero-grid">
              <div className="kaisen-hero-text">
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 999,
                  background: 'var(--accent-light)', border: '1px solid var(--accent-border)',
                  fontSize: 12, fontWeight: 500, color: 'var(--accent)',
                  marginBottom: 28,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d9f5f' }} />
                  30秒で無料診断
                </div>
                <h1 style={{
                  fontSize: 'clamp(32px, 5vw, 52px)',
                  fontWeight: 700, lineHeight: 1.3,
                  margin: '0 0 20px', color: 'var(--text-main)',
                  letterSpacing: '-0.02em',
                }}>
                  ネット回線代、<br />
                  年間<span style={{ fontWeight: 800, color: 'var(--accent)' }}>{heroCount.toLocaleString()}</span>円<br />
                  節約できるかも。
                </h1>
                <p style={{
                  fontSize: 16, color: 'var(--text-sub)',
                  margin: '0 0 36px', lineHeight: 1.8,
                }}>
                  10問答えるだけで、全14プランから<br />
                  あなたにぴったりの1つを提案します。
                </p>
                <div className="kaisen-hero-cta-wrap" style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'flex-start', gap: 18,
                }}>
                  <button onClick={startDiagnose} className="sp-cta-pill">
                    回線診断スタート
                  </button>
                  <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                    {['光回線9社', '個人情報不要', '完全無料'].map(t => (
                      <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" stroke="#0d9f5f" strokeWidth="1.5" />
                          <path d="M5 8.2 7 10.2 11 6" stroke="#0d9f5f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── 右カラム：家イラスト ── */}
              <div className="kaisen-hero-illust">
                <HouseIllustration />
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
                { title: '質問に答える', desc: '住居タイプや用途など、10問に答えるだけ', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                { title: '回線を比較', desc: '光回線からモバイルWiFiまで全14プランを自動で選定', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg> },
                { title: '節約額がわかる', desc: 'スマホ割やキャッシュバック込みで具体的に表示', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M15.5 9.5c-.3-1-1.5-1.5-3.5-1.5s-3.1.8-3.1 2c0 2.4 6.1 1.2 6.1 4 0 1.3-1.5 2-3.5 2s-3.2-.5-3.5-1.5"/></svg> },
              ].map((s, i) => (
                <div key={i} style={{
                  background: '#fff', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '40px 28px', textAlign: 'center',
                }}>
                  <div style={{ marginBottom: 16, color: 'var(--accent)', display: 'flex', justifyContent: 'center' }}>
                    {s.icon}
                  </div>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: 'var(--accent)',
                    letterSpacing: '0.08em', marginBottom: 8,
                  }}>STEP 0{i + 1}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 10 }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7 }}>
                    {s.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BEFORE / AFTER セクション ── */}
        <section className="sp-block sp-section-fade" style={{ padding: '100px 0 120px' }}>
          <div className="sp-container">
            <h2 className="sp-h2">
              見直すと<br />
              こんなに変わる
            </h2>
            <p className="sp-h2-sub">
              回線を乗り換えるだけで、年間数万円の節約も可能
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
                return (
                  <KaisenBACard key={i} example={ex} saving={saving} index={i} />
                );
              })}
            </div>

            <p style={{
              fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 20, lineHeight: 1.7,
            }}>
              ※料金は税込・割引適用前の標準価格。実際の節約額はご利用状況により異なります
            </p>
          </div>
        </section>

        {/* ── FINAL CTA（ダーク） ── */}
        <section className="sp-block sp-block-dark sp-section-fade" style={{ background: '#0f1629', padding: '120px 0' }}>
          <div className="sp-container" style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 700, lineHeight: 1.3,
              margin: '0 0 16px', color: '#fff',
              letterSpacing: '-0.02em',
            }}>
              今すぐ無料診断
            </h2>
            <p style={{
              fontSize: 16, color: 'rgba(255, 255, 255, 0.65)',
              margin: '0 0 40px', lineHeight: 1.8,
            }}>
              30秒で、あなたにぴったりの回線が見つかる
            </p>
            <button onClick={startDiagnose} className="sp-cta-pill">
              回線診断スタート
            </button>
            <div style={{
              display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
              gap: 24, marginTop: 28,
              fontSize: 13, color: 'rgba(255, 255, 255, 0.45)', fontWeight: 500,
            }}>
              <span>登録不要</span>
              <span>全14プラン対応</span>
              <span>結果はその場で表示</span>
            </div>
          </div>
        </section>

        {/* ── 対応回線一覧 ── */}
        <section className="sp-block sp-section-fade" style={{ background: 'var(--bg-soft)' }}>
          <div className="sp-container" style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
              letterSpacing: '0.15em', textAlign: 'center', marginBottom: 24,
            }}>
              対応回線・プラン
            </div>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 10,
              justifyContent: 'center', maxWidth: 700, margin: '0 auto',
            }}>
              {[
                { name: 'ドコモ光', bg: '#CC0033', type: '光' },
                { name: 'ソフトバンク光', bg: '#E60012', type: '光' },
                { name: 'auひかり', bg: '#EB5505', type: '光' },
                { name: 'NURO光', bg: '#1D4ED8', type: '光' },
                { name: '楽天ひかり', bg: '#BF0000', type: '光' },
                { name: 'GMOとくとくBB光', bg: '#333', type: '光' },
                { name: 'ビッグローブ光', bg: '#E66A00', type: '光' },
                { name: 'おてがる光', bg: '#4A9BD9', type: '光' },
                { name: 'So-net光', bg: '#0070BA', type: '光' },
                { name: 'ドコモ home 5G', bg: '#CC0033', type: 'HR' },
                { name: 'ソフトバンクエアー', bg: '#E60012', type: 'HR' },
                { name: 'WiMAX', bg: '#EB5505', type: 'HR' },
                { name: 'WiMAX モバイル', bg: '#EB5505', type: 'WiFi' },
                { name: '楽天ポケットWiFi', bg: '#BF0000', type: 'WiFi' },
              ].map(c => (
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
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="sp-block sp-section-fade" style={{ background: '#fff' }}>
          <div className="sp-container">
            <h2 className="sp-h2">よくある質問</h2>
            <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {KAISEN_FAQ_ITEMS.map((item, i) => (
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

        {/* Footer */}
        <footer style={{ padding: '48px 0 36px', background: '#0a0e1a', color: 'rgba(255,255,255,0.7)' }}>
          <div className="sp-container" style={{
            textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center',
          }}>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/smaho" style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 500 }}>スマホ診断</Link>
              <Link href="/blog" style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 500 }}>ブログ</Link>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>© 2026 スマートプラン</div>
          </div>
        </footer>
      </div>
    );
  }

  if (view === 'result' && result) {
    const topRec = result.recommendations[0];
    const shareText = `AIが私にぴったりのネット回線を診断してくれた！\n1位: ${topRec?.name}（${topRec?.type}）\n月額${topRec?.monthly_cost.toLocaleString()}円\n\nあなたも試してみて👇\nhttps://smaplan.com/kaisen`;

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

          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #2563EB 100%)',
            color: '#fff', borderRadius: 16, padding: '28px 20px',
            textAlign: 'center', marginBottom: 24,
            boxShadow: '0 8px 24px rgba(29, 78, 216, 0.3)',
          }}>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 6 }}>あなたにおすすめの回線</div>
            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>
              {topRec?.name}
            </div>
            <div style={{ fontSize: 14, opacity: 0.85 }}>
              {topRec?.type} ・ 月額 {topRec?.monthly_cost.toLocaleString()}円
            </div>
          </div>

          {/* Summary */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24,
          }}>
            <div style={{
              padding: 16, background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 12,
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>住居タイプ</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>
                {result.housing_type}
              </div>
            </div>
            <div style={{
              padding: 16, background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 12,
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>比較回線数</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>
                全14プラン
              </div>
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 12 }}>
            おすすめ回線 TOP 3
          </div>

          {/* Recommendation Table */}
          <div style={{
            overflowX: 'auto', marginBottom: 20,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 12,
          }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse',
              fontSize: 13, tableLayout: 'fixed',
            }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', borderBottom: '1px solid var(--border)', width: '35%' }}>回線名</th>
                  <th style={{ padding: '10px 6px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', borderBottom: '1px solid var(--border)', width: '22%' }}>タイプ</th>
                  <th style={{ padding: '10px 6px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', borderBottom: '1px solid var(--border)', width: '20%' }}>月額</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', borderBottom: '1px solid var(--border)', width: '23%' }}>最大速度</th>
                </tr>
              </thead>
              <tbody>
                {result.recommendations.map((rec, i) => {
                  const isLast = i === result.recommendations.length - 1;
                  const isTop = i === 0;
                  return (
                    <tr key={i}>
                      <td style={{
                        padding: '12px 8px', fontSize: 13, fontWeight: 600,
                        color: 'var(--text-main)',
                        borderBottom: isLast ? 'none' : '1px solid var(--border)',
                      }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          color: isTop ? 'var(--accent)' : 'var(--text-muted)',
                          marginRight: 6,
                        }}>
                          {rec.rank}位
                        </span>
                        {rec.name}
                      </td>
                      <td style={{
                        padding: '12px 6px', textAlign: 'center',
                        fontSize: 11, color: 'var(--text-sub)',
                        borderBottom: isLast ? 'none' : '1px solid var(--border)',
                      }}>
                        {rec.type}
                      </td>
                      <td style={{
                        padding: '12px 6px', textAlign: 'right',
                        fontSize: 13, fontWeight: 700, color: 'var(--accent)',
                        borderBottom: isLast ? 'none' : '1px solid var(--border)',
                      }}>
                        {rec.monthly_cost.toLocaleString()}円
                      </td>
                      <td style={{
                        padding: '12px 8px', textAlign: 'right',
                        fontSize: 12, color: 'var(--text-sub)',
                        borderBottom: isLast ? 'none' : '1px solid var(--border)',
                      }}>
                        {rec.max_speed}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detailed Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {result.recommendations.map((rec, i) => {
              const isTop = i === 0;
              return (
                <div key={i} style={{
                  background: 'var(--bg-card)',
                  border: isTop ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 14, position: 'relative', overflow: 'hidden',
                  boxShadow: isTop ? '0 10px 28px rgba(29, 78, 216, 0.16)' : 'none',
                }}>
                  {isTop && (
                    <div style={{
                      background: 'var(--accent)', color: '#fff',
                      padding: '8px 16px', fontSize: 12, fontWeight: 800,
                      letterSpacing: '0.06em', textAlign: 'center',
                    }}>
                      ⭐ 最もおすすめ
                    </div>
                  )}
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        background: isTop ? 'var(--accent)' : 'var(--text-sub)',
                        color: '#fff', padding: '3px 12px', borderRadius: 20,
                      }}>
                        {rec.rank === 1 ? '🥇 1位' : rec.rank === 2 ? '🥈 2位' : '🥉 3位'}
                      </span>
                      <span style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 6,
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        color: 'var(--text-sub)', fontWeight: 600,
                      }}>
                        {rec.type}
                      </span>
                    </div>

                    <div style={{
                      fontSize: isTop ? 20 : 18, fontWeight: 700,
                      color: 'var(--text-main)', marginBottom: 12,
                    }}>
                      {rec.name}
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'baseline', gap: 8,
                      padding: '12px 14px', background: 'var(--accent-light)',
                      borderRadius: 10, marginBottom: 12,
                    }}>
                      <span style={{ fontSize: isTop ? 30 : 26, fontWeight: 800, color: 'var(--accent)' }}>
                        {rec.monthly_cost.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>円/月</span>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      <span style={{
                        fontSize: 12, padding: '4px 10px',
                        background: 'var(--bg)', color: 'var(--text-sub)',
                        borderRadius: 6, border: '1px solid var(--border)',
                      }}>
                        ⚡ {rec.max_speed}
                      </span>
                      {rec.cashback && rec.cashback !== 'なし' && (
                        <span style={{
                          fontSize: 12, padding: '4px 10px',
                          background: 'var(--success-light)', color: 'var(--success)',
                          borderRadius: 6, border: '1px solid #BBF7D0',
                          fontWeight: 600,
                        }}>
                          🎁 キャッシュバック特典あり
                        </span>
                      )}
                    </div>

                    <p style={{
                      fontSize: 14, color: 'var(--text-main)', lineHeight: 1.7,
                      margin: '0 0 16px',
                    }}>
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
                      公式サイトへ →
                    </a>
                    {rec.affiliate_key && getKaisenImpression(rec.affiliate_key) && (
                      <img src={getKaisenImpression(rec.affiliate_key)!} width={1} height={1} alt="" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Advice */}
          {result.advice && (
            <div style={{
              padding: '18px 20px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 12, marginBottom: 24,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                💡 AIからのアドバイス
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)' }}>
                {result.advice}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 32,
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
              onClick={() => { track('kaisen_retry_diagnose'); resetAll(); }}
              style={{
                padding: '10px 24px', minHeight: 44,
                background: 'transparent', color: 'var(--text-sub)',
                border: '1px solid var(--border)', borderRadius: 10,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              もう一度診断する
            </button>
            <Link
              href="/smaho"
              style={{
                fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600,
              }}
            >
              スマホプラン診断も試す →
            </Link>
          </div>
        </main>
      </>
    );
  }

  // Diagnose view
  const remaining = QUESTIONS.length - step - 1;
  const percent = Math.round(((step + 1) / QUESTIONS.length) * 100);

  const isPrefectureQuestion = q.key === 'q2_region';
  const filteredOptions = isPrefectureQuestion && prefectureFilter
    ? q.options.filter(o => o.includes(prefectureFilter))
    : q.options;

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 40px' }}>
      <LogoHeader compact />

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
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

      {isPrefectureQuestion && (
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="都道府県を検索..."
            value={prefectureFilter}
            onChange={e => setPrefectureFilter(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px',
              border: '2px solid var(--border)', borderRadius: 10,
              fontSize: 15, color: 'var(--text-main)',
              background: 'var(--bg-card)', outline: 'none',
            }}
          />
        </div>
      )}

      <div style={{
        display: isPrefectureQuestion ? 'grid' : 'flex',
        gridTemplateColumns: isPrefectureQuestion ? 'repeat(auto-fill, minmax(130px, 1fr))' : undefined,
        flexDirection: isPrefectureQuestion ? undefined : 'column',
        gap: 10,
        marginBottom: 24,
        maxHeight: isPrefectureQuestion ? 400 : undefined,
        overflowY: isPrefectureQuestion ? 'auto' : undefined,
      }}>
        {filteredOptions.map(opt => (
          isPrefectureQuestion ? (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(q.key, opt, q.multi)}
              style={{
                padding: '10px 12px',
                background: isSelected(q.key, opt) ? 'var(--accent-light)' : 'var(--bg-card)',
                border: isSelected(q.key, opt) ? '2px solid var(--accent)' : '2px solid var(--border)',
                borderRadius: 10,
                color: isSelected(q.key, opt) ? 'var(--accent)' : 'var(--text-main)',
                fontSize: 14, fontWeight: isSelected(q.key, opt) ? 600 : 500,
                cursor: 'pointer', textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
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
        {(q.multi || step === QUESTIONS.length - 1) && (
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
