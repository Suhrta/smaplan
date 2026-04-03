'use client';

import { useState } from 'react';

const QUESTIONS = [
  {
    key: 'mood',
    label: '今の気分は？',
    multi: false,
    options: ['日常から逃げたい', '感動したい', 'ドキドキしたい', 'じっくり考えたい', '笑いたい', '癒されたい'],
  },
  {
    key: 'genre',
    label: '好きな映画・ドラマのジャンルは？（複数OK）',
    multi: true,
    options: ['SF・ファンタジー', 'ミステリー・サスペンス', 'ヒューマンドラマ', 'アクション・冒険', '恋愛', 'ホラー', 'コメディ', '歴史・時代劇'],
  },
  {
    key: 'personality',
    label: '自分の性格に近いのは？',
    multi: false,
    options: ['感情で動くタイプ', '論理で考えるタイプ', '直感派', '慎重派'],
  },
  {
    key: 'reading',
    label: '読書経験は？',
    multi: false,
    options: ['ほとんど読まない', 'たまに読む（年数冊）', 'よく読む（月1〜2冊）', 'かなり読む（週1冊以上）'],
  },
  {
    key: 'avoid',
    label: '苦手なものがあれば（複数OK・なければそのまま次へ）',
    multi: true,
    options: ['グロ・暴力表現', '性描写', '重すぎる結末', '難解な文体', '長すぎる作品'],
    optional: true,
  },
];

type Answers = Record<string, string | string[]>;
type Book = { title: string; author: string; score: number; reason: string; first_page: string; kindle: boolean };
type Result = { type: string; type_reason: string; books: Book[] };

function AmazonLink({ title, author }: { title: string; author: string }) {
  const query = encodeURIComponent(`${title} ${author} kindle`);
  const url = `https://www.amazon.co.jp/s?k=${query}&i=digital-text&tag=erabook-22`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      style={{
        display: 'inline-block', marginTop: 12, padding: '8px 20px',
        background: '#FF9900', color: '#111', borderRadius: 6,
        fontFamily: 'sans-serif', fontSize: 13, fontWeight: 600,
        textDecoration: 'none',
      }}>
      Kindleで読む →
    </a>
  );
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const q = QUESTIONS[step];

  function toggle(key: string, val: string, multi: boolean) {
    setAnswers(prev => {
      if (multi) {
        const cur = (prev[key] as string[]) || [];
        return { ...prev, [key]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val] };
      }
      return { ...prev, [key]: val };
    });
  }

  function isSelected(key: string, val: string) {
    const a = answers[key];
    if (Array.isArray(a)) return a.includes(val);
    return a === val;
  }

  function canNext() {
    if (q.optional) return true;
    const a = answers[q.key];
    if (Array.isArray(a)) return a.length > 0;
    return !!a;
  }

  async function handleNext() {
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      setLoading(true);
      try {
        const res = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answers),
        });
        const data = await res.json();
        setResult(data);
      } catch {
        alert('エラーが発生しました');
      } finally {
        setLoading(false);
      }
    }
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 48 }}>📚</div>
      <p style={{ color: 'var(--text-sub)', fontFamily: 'sans-serif' }}>あなたにぴったりの本を選書中...</p>
    </main>
  );

  if (result) return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 13, color: 'var(--text-sub)', fontFamily: 'sans-serif', marginBottom: 8 }}>あなたのタイプ</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>「{result.type}」</div>
        <div style={{ fontSize: 14, color: 'var(--text-sub)', fontFamily: 'sans-serif' }}>{result.type_reason}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {result.books.map((book, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '24px',
            borderLeft: '4px solid var(--accent)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontFamily: 'sans-serif' }}>
              <span style={{ fontSize: 12, background: 'var(--accent)', color: 'var(--pill-active-text)', padding: '2px 10px', borderRadius: 20 }}>第{i + 1}位</span>
              <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>相性 {book.score}%</span>
              {book.kindle && <span style={{ fontSize: 11, color: 'var(--text-sub)', background: 'var(--accent-light)', padding: '2px 8px', borderRadius: 20 }}>Kindle対応</span>}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{book.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)', fontFamily: 'sans-serif', marginBottom: 12 }}>{book.author}</div>
            <div style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.7, marginBottom: 8, fontFamily: 'sans-serif' }}>{book.reason}</div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
              📖 {book.first_page}
            </div>
            <AmazonLink title={book.title} author={book.author} />
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
  
    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`私は「${result.type}」タイプ！\nAIが選んでくれた本：${result.books[0].title}（${result.books[0].author}）\n\nあなたもやってみて👇\nhttps://koreyomo.vercel.app`)}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: 'inline-block', padding: '12px 28px',
      background: '#000', color: '#fff', borderRadius: 6,
      fontFamily: 'sans-serif', fontSize: 14, fontWeight: 600,
      textDecoration: 'none',
    }}>
    𝕏 結果をシェアする
  </a>
  <button onClick={() => { setStep(0); setAnswers({}); setResult(null); }}
    style={{ padding: '10px 24px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', fontFamily: 'sans-serif', fontSize: 14, color: 'var(--text-sub)' }}>
    もう一度診断する
  </button>
</div>
    </main>
  );

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>📚</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>これよも</h1>
        <p style={{ fontSize: 14, color: 'var(--text-sub)', fontFamily: 'sans-serif' }}>あなただけの「はじめの1冊」を見つけよう</p>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
        {QUESTIONS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />
        ))}
      </div>

      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-sub)', fontFamily: 'sans-serif' }}>{step + 1} / {QUESTIONS.length}</div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, lineHeight: 1.5 }}>{q.label}</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
        {q.options.map(opt => (
          <button key={opt} onClick={() => toggle(q.key, opt, q.multi)}
            style={{
              padding: '10px 18px', borderRadius: 999,
              border: `1px solid ${isSelected(q.key, opt) ? 'var(--accent)' : 'var(--border)'}`,
              background: isSelected(q.key, opt) ? 'var(--pill-active-bg)' : 'var(--bg-card)',
              color: isSelected(q.key, opt) ? 'var(--pill-active-text)' : 'var(--text-main)',
              cursor: 'pointer', fontSize: 14, fontFamily: 'sans-serif',
              transition: 'all 0.15s',
            }}>
            {opt}
          </button>
        ))}
      </div>

      <button onClick={handleNext} disabled={!canNext()}
        style={{
          width: '100%', padding: '14px', borderRadius: 8,
          background: canNext() ? 'var(--accent)' : 'var(--border)',
          color: canNext() ? 'var(--pill-active-text)' : 'var(--text-sub)',
          border: 'none', cursor: canNext() ? 'pointer' : 'default',
          fontSize: 16, fontFamily: 'sans-serif', fontWeight: 600,
          transition: 'all 0.2s',
        }}>
        {step < QUESTIONS.length - 1 ? '次へ →' : '診断する 📚'}
      </button>
    </main>
  );
}