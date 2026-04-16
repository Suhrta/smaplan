'use client';

import { useState, useEffect, useRef } from 'react';
import { getLink } from '@/data/affiliateLinks';
import { track } from '@/lib/analytics';

type Question = {
  key: string;
  label: string;
  multi: boolean;
  options: string[];
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
    options: ['〜2,000円', '2,000〜5,000円', '5,000〜8,000円', '8,000円〜', 'わからない'],
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
    key: 'q7_usage_types',
    label: '外出先で主に何をしてる？',
    multi: true,
    options: ['SNS・ニュース', '動画視聴（YouTube等）', '音楽ストリーミング', 'ゲーム', '仕事・テザリング', '地図・ナビ'],
  },
  {
    key: 'q8_priority',
    label: '一番重視するのは？',
    multi: false,
    options: ['とにかく安さ', '通信速度・安定性', 'データたっぷり', 'サポートの手厚さ'],
  },
  {
    key: 'q9_bundle_discount',
    label: '電気・光回線のセット割を使ってる？',
    multi: false,
    options: ['使ってる', '使ってない', 'わからない'],
  },
];

type Answers = Record<string, string | string[]>;

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
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 40px' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '32px 0 40px' }}>
          <h1 style={{
            fontSize: 28, fontWeight: 700, lineHeight: 1.4,
            margin: '0 0 16px', color: 'var(--text-main)',
          }}>
            9問でわかる、<br />
            あなたに最適な<br />
            <span style={{ color: 'var(--accent)' }}>スマホ料金プラン</span>
          </h1>
          <p style={{
            fontSize: 15, color: 'var(--text-sub)',
            margin: '0 0 32px', lineHeight: 1.7,
          }}>
            AIがあなたの使い方を分析して、<br />
            月々の料金と年間節約額を無料で診断します。
          </p>
          <button
            onClick={startDiagnose}
            style={{
              padding: '16px 48px', minHeight: 56,
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 12,
              fontSize: 17, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
              transition: 'all 0.15s',
            }}
          >
            診断スタート →
          </button>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            無料・登録不要・約1分で完了
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {[
            { icon: '🤖', title: 'AI診断', body: '9問に答えるだけで、AIがあなたの使い方を分析' },
            { icon: '⚖️', title: '中立・全キャリア対応', body: '大手キャリアから格安SIMまで20プランから公平に比較' },
            { icon: '💰', title: '年間節約額がわかる', body: '現在の料金と比較して「いくらお得か」を具体的に表示' },
          ].map(f => (
            <div key={f.title} style={{
              padding: '18px 20px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 12,
              display: 'flex', gap: 14, alignItems: 'flex-start',
            }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>{f.body}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
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
