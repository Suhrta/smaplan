'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getLink } from '@/data/affiliateLinks';
import { track } from '@/lib/analytics';

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

type DiagnoseResult = {
  estimated_data_gb: number;
  current_estimated_cost: number;
  recommendations: Recommendation[];
  advice: string;
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

function Header({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: compact ? '20px 0 12px' : '28px 0 20px' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'baseline', gap: 6,
        fontSize: compact ? 22 : 26, fontWeight: 700, color: 'var(--accent)',
        letterSpacing: '0.02em',
      }}>
        <span>スマプラン</span>
        <span style={{ fontSize: compact ? 11 : 12, color: 'var(--text-muted)', fontWeight: 500 }}>SmaPlan</span>
      </div>
    </div>
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

function BotIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}

function PiggyBankIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8.4 2.8 1 3.5V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.5c1.1.1 2.4.1 3.5 0V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1.7c1.2-.8 2.2-1.8 2.5-3.3H21a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-.5C20 6.5 19.5 5 19 5Z" />
      <path d="M16 11h.01" />
    </svg>
  );
}

const FEATURES = [
  { Icon: BotIcon, title: 'AI診断', body: '10問に答えるだけで、AIがあなたの使い方を分析' },
  { Icon: ScaleIcon, title: '中立・全キャリア対応', body: '大手キャリアから格安SIMまで20プランから公平に比較' },
  { Icon: PiggyBankIcon, title: '年間節約額がわかる', body: '現在の料金と比較して「いくらお得か」を具体的に表示' },
] as const;

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
    answer: '大手キャリアから格安SIMに乗り換えた場合、年間5〜8万円の節約になるケースが多いです。',
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
  const plans = [
    { rank: '🥇 1位', name: 'ahamo 30GB', price: '2,970', accent: true },
    { rank: '🥈 2位', name: 'LINEMO V', price: '2,970' },
    { rank: '🥉 3位', name: '日本通信SIM', price: '1,390' },
  ];
  return (
    <div
      aria-hidden="true"
      style={{
        display: 'flex', justifyContent: 'center',
      }}
    >
      <div style={{
        width: 240, height: 480,
        background: '#0F172A',
        borderRadius: 36,
        padding: 10,
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)',
        animation: 'mockPop 0.6s ease both',
      }}>
        <div style={{
          width: '100%', height: '100%',
          background: '#FFFFFF',
          borderRadius: 28,
          padding: '28px 16px 20px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            width: 70, height: 5, borderRadius: 3, background: '#CBD5E1',
          }} />
          <div style={{
            fontSize: 10, color: '#94A3B8', textAlign: 'center',
            letterSpacing: '0.15em', marginBottom: 6,
          }}>
            SMAPLAN
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
            borderRadius: 12, padding: '12px 14px', color: '#fff',
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 9, opacity: 0.85 }}>乗り換えたら</div>
            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1 }}>年間 54,000円</div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>おトクに！</div>
          </div>
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 8,
          }}>
            おすすめプラン TOP 3
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plans.map((p, i) => (
              <div key={i} style={{
                padding: '10px 10px',
                background: '#fff',
                border: `1px solid ${p.accent ? '#1D4ED8' : '#E2E8F0'}`,
                borderRadius: 10,
              }}>
                <div style={{ fontSize: 9, color: '#64748B', marginBottom: 2 }}>
                  {p.rank}
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#1D4ED8' }}>
                    {p.price}<span style={{ fontSize: 8, fontWeight: 600 }}>円</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
    return (
      <div style={{
        background: 'linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 60%)',
        minHeight: '100vh',
      }}>
        <style>{`
          @keyframes mockPop { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
          .sp-cta { transition: transform 0.18s ease, box-shadow 0.18s ease; }
          .sp-cta:hover { transform: scale(1.05); box-shadow: 0 10px 24px rgba(29, 78, 216, 0.35); }
          .sp-cta:active { transform: scale(1.02); }
          .sp-feature { transition: transform 0.18s ease, box-shadow 0.18s ease; }
          .sp-feature:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08); }
          .sp-faq-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; transition: background 0.15s ease; }
          .sp-faq-item[open] { background: var(--accent-light); }
          .sp-faq-summary { list-style: none; cursor: pointer; padding: 16px 18px; display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 600; color: var(--text-main); outline: none; }
          .sp-faq-summary::-webkit-details-marker { display: none; }
          .sp-faq-summary::after { content: '▾'; margin-left: auto; color: var(--accent); transition: transform 0.2s ease; font-size: 14px; }
          .sp-faq-item[open] .sp-faq-summary::after { transform: rotate(180deg); }
          .sp-faq-q { flex-shrink: 0; width: 24px; height: 24px; border-radius: 6px; background: var(--accent); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; }
          .sp-faq-answer { padding: 0 18px 18px 54px; font-size: 14px; line-height: 1.8; color: var(--text-sub); margin: 0; }
          .sp-hero-grid { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: center; }
          @media (min-width: 720px) {
            .sp-hero-grid { grid-template-columns: 1.1fr 0.9fr; gap: 40px; }
            .sp-hero-text { text-align: left; }
            .sp-hero-text .sp-hero-sub { margin-left: 0; margin-right: 0; }
            .sp-hero-cta-wrap { justify-content: flex-start; }
          }
        `}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
        />
        <main style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 40px' }}>
          <Header />
          <section className="sp-hero-grid" style={{ padding: '24px 0 36px' }}>
            <div className="sp-hero-text" style={{ textAlign: 'center' }}>
              <h1 style={{
                fontSize: 30, fontWeight: 800, lineHeight: 1.35,
                margin: '0 0 16px', color: 'var(--text-main)',
                letterSpacing: '0.01em',
              }}>
                10問でわかる、<br />
                あなたに最適な<br />
                <span style={{ color: 'var(--accent)' }}>スマホ料金プラン</span>
              </h1>
              <p className="sp-hero-sub" style={{
                fontSize: 15, color: 'var(--text-sub)',
                margin: '0 auto 28px', lineHeight: 1.8,
                maxWidth: 360,
              }}>
                AIがあなたの使い方を分析して、<br />
                月々の料金と年間節約額を無料で診断します。
              </p>
              <div className="sp-hero-cta-wrap" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 10,
              }}>
                <button
                  onClick={startDiagnose}
                  className="sp-cta"
                  style={{
                    padding: '20px 56px', minHeight: 60,
                    background: 'var(--accent)', color: '#fff',
                    border: 'none', borderRadius: 14,
                    fontSize: 18, fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px rgba(29, 78, 216, 0.28)',
                    letterSpacing: '0.02em',
                  }}
                >
                  診断スタート →
                </button>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  ⚡ 平均30秒で診断完了
                </div>
              </div>
            </div>
            <PhoneMockup />
          </section>

          <div style={{ display: 'grid', gap: 12 }}>
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="sp-feature"
                style={{
                  padding: '20px 22px', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 14,
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                }}
              >
                <div style={{
                  flexShrink: 0,
                  width: 40, height: 40, borderRadius: 10,
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <f.Icon />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.7 }}>{f.body}</div>
                </div>
              </div>
            ))}
          </div>

          <section style={{
            marginTop: 40, paddingTop: 24,
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 11, color: 'var(--text-muted)',
              letterSpacing: '0.15em', marginBottom: 12,
            }}>
              対応キャリア
            </div>
            <div style={{
              display: 'flex', flexWrap: 'wrap',
              gap: 8, justifyContent: 'center',
            }}>
              {['ドコモ', 'au', 'ソフトバンク', '楽天モバイル', '格安SIM'].map(c => (
                <span key={c} style={{
                  padding: '6px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 999,
                  fontSize: 13, color: 'var(--text-sub)', fontWeight: 500,
                }}>
                  {c}
                </span>
              ))}
            </div>
          </section>

          <section style={{ marginTop: 40 }}>
            <h2 style={{
              fontSize: 22, fontWeight: 800, margin: '0 0 16px',
              color: 'var(--text-main)', textAlign: 'center',
            }}>
              よくある質問
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
          </section>

          <footer style={{
            marginTop: 40, paddingTop: 24,
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
            display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center',
          }}>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link
                href="/carriers"
                style={{
                  fontSize: 13, color: 'var(--text-sub)',
                  textDecoration: 'underline',
                }}
              >
                プラン一覧を見る
              </Link>
              <Link
                href="/blog"
                style={{
                  fontSize: 13, color: 'var(--text-sub)',
                  textDecoration: 'underline',
                }}
              >
                ブログ
              </Link>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              © 2026 SmaPlan
            </div>
          </footer>
        </main>
      </div>
    );
  }

  if (view === 'result' && result) {
    const topRec = result.recommendations[0];
    const topSaving = topRec?.annual_saving ?? 0;
    const shareText = `AIが私にぴったりのスマホプランを診断してくれた！\n1位: ${topRec?.carrier} ${topRec?.plan_name}\n${topSaving > 0 ? `年間${topSaving.toLocaleString()}円お得に！\n` : ''}\nあなたも試してみて👇\nhttps://smaplan.com`;

    return (
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 40px' }}>
        <Header compact />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button onClick={resetAll} style={{
            padding: '6px 14px', background: 'transparent',
            border: '1px solid var(--border)', borderRadius: 8,
            cursor: 'pointer', fontSize: 12, color: 'var(--text-sub)',
          }}>← やり直す</button>
        </div>

        {error && <ErrorBanner message={error} />}

        {topSaving > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #2563EB 100%)',
            color: '#fff', borderRadius: 16, padding: '28px 20px',
            textAlign: 'center', marginBottom: 24,
            boxShadow: '0 8px 24px rgba(29, 78, 216, 0.3)',
          }}>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 6 }}>乗り換えたら</div>
            <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, marginBottom: 4 }}>
              年間 {topSaving.toLocaleString()}円
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>おトクに！</div>
          </div>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {result.recommendations.map((rec, i) => {
            const isTop = i === 0;
            const diff = result.current_estimated_cost - rec.monthly_cost;
            return (
              <div key={i} style={{
                background: 'var(--bg-card)',
                border: isTop ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 14, padding: '20px',
                position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    background: isTop ? 'var(--accent)' : 'var(--text-sub)',
                    color: '#fff', padding: '3px 12px', borderRadius: 20,
                  }}>
                    {rec.rank === 1 ? '🥇 1位' : rec.rank === 2 ? '🥈 2位' : '🥉 3位'}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rec.carrier}</span>
                </div>

                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 12 }}>
                  {rec.plan_name}
                </div>

                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 8,
                  padding: '12px 14px', background: 'var(--accent-light)',
                  borderRadius: 10, marginBottom: 12,
                }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>
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
                    background: 'var(--accent)', color: '#fff',
                    borderRadius: 10, textDecoration: 'none',
                    fontSize: 15, fontWeight: 700,
                  }}
                >
                  詳細を見る →
                </a>
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
    );
  }

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 40px' }}>
      <Header compact />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        marginBottom: 8,
      }}>
        {QUESTIONS.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= step ? 'var(--accent)' : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{
        marginBottom: 20, fontSize: 12, color: 'var(--text-muted)',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>質問 {step + 1} / {QUESTIONS.length}</span>
        {q.multi && <span>複数選択可</span>}
      </div>

      <h2 style={{
        fontSize: 22, fontWeight: 700, color: 'var(--text-main)',
        margin: '0 0 20px', lineHeight: 1.5,
      }}>
        {q.label}
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
          ← 戻る
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
