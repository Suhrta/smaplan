'use client';

import { useState, useEffect } from 'react';

const BOOK_COLORS = [
  { sp: '#D4537E', bg: '#FBEAF0', tx: '#72243E' },
  { sp: '#D85A30', bg: '#FAECE7', tx: '#712B13' },
  { sp: '#185FA5', bg: '#E6F1FB', tx: '#0C447C' },
  { sp: '#0C447C', bg: '#B5D4F4', tx: '#042C53' },
  { sp: '#854F0B', bg: '#FAEEDA', tx: '#633806' },
  { sp: '#3B6D11', bg: '#EAF3DE', tx: '#27500A' },
  { sp: '#534AB7', bg: '#EEEDFE', tx: '#3C3489' },
  { sp: '#993556', bg: '#FBEAF0', tx: '#72243E' },
  { sp: '#5F5E5A', bg: '#F1EFE8', tx: '#444441' },
  { sp: '#0F6E56', bg: '#E1F5EE', tx: '#085041' },
  { sp: '#A32D2D', bg: '#FCEBEB', tx: '#791F1F' },
];

const GRAY_COLORS = [
  { sp: '#888780', bg: '#F1EFE8', tx: '#5F5E5A' },
  { sp: '#7A7870', bg: '#EEECE6', tx: '#555450' },
  { sp: '#6B6965', bg: '#EAE8E2', tx: '#4A4845' },
  { sp: '#9A9890', bg: '#F3F1EB', tx: '#656360' },
  { sp: '#888780', bg: '#F1EFE8', tx: '#5F5E5A' },
];

const QUESTIONS = [
  {
    key: 'mood',
    label: '今の気分は？',
    multi: false,
    optional: false,
    options: ['スカッとしたい', 'じんわり感動したい', 'ゾクゾクしたい', 'くすっと笑いたい', '没頭して忘れたい', 'なんでもOK'],
  },
  {
    key: 'genre',
    label: 'どんな本を読みたいですか？',
    multi: true,
    optional: false,
    options: ['恋愛', 'ヒューマンドラマ', 'ミステリー', 'サスペンス', 'ホラー', 'ファンタジー', 'SF', 'コメディ', '歴史・時代', '海外文学', 'ライトノベル'],
  },
  {
    key: 'length',
    label: '本の長さは？',
    multi: false,
    optional: false,
    options: ['短め（200ページ以内）', '普通（200〜400ページ）', '長くてもOK', 'わからない'],
  },
  {
    key: 'experience',
    label: '読書経験は？',
    multi: false,
    optional: false,
    options: ['ほとんど読まない', 'たまに読む（年数冊）', 'よく読む（月1冊以上）'],
  },
  {
    key: 'avoid',
    label: '苦手なものがあれば',
    multi: true,
    optional: true,
    options: ['グロ・暴力表現', '性描写', '重すぎる結末', '難解な文体', '長すぎる作品'],
  },
];

type Answers = Record<string, string | string[]>;
type Book = { title: string; author: string; score: number; reason: string; first_page: string; kindle: boolean };
type Result = { type: string; type_reason: string; books: Book[] };

function BookButton({ label, color, selected, onClick }: {
  label: string;
  color: { sp: string; bg: string; tx: string };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        cursor: 'pointer',
        borderRadius: '3px 6px 6px 3px',
        overflow: 'hidden',
        boxShadow: selected ? '5px 2px 0 rgba(0,0,0,0.2)' : '2px 2px 0 rgba(0,0,0,0.12)',
        transform: selected ? 'translateX(8px)' : 'translateX(0)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <div style={{ width: 10, flexShrink: 0, background: color.sp }} />
      <div style={{
        flex: 1,
        background: selected ? color.sp : color.bg,
        color: selected ? '#fff' : color.tx,
        padding: '10px 12px',
        fontSize: 13,
        fontWeight: 500,
        fontFamily: 'sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        transition: 'background 0.15s, color 0.15s',
      }}>
        <span>{label}</span>
        {selected && <span style={{ fontSize: 11, flexShrink: 0 }}>✓</span>}
      </div>
    </div>
  );
}

function AmazonLink({ title, author }: { title: string; author: string }) {
  const query = encodeURIComponent(`${title} ${author} kindle`);
  const url = `https://www.amazon.co.jp/s?k=${query}&i=digital-text&tag=erabook-22`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{
      display: 'inline-block', marginTop: 12, padding: '8px 20px',
      background: '#FF9900', color: '#111', borderRadius: 6,
      fontFamily: 'sans-serif', fontSize: 13, fontWeight: 600,
      textDecoration: 'none',
    }}>
      Kindleで読む →
    </a>
  );
}

const LOADING_MESSAGES = [
  '膨大な本棚を探索中...',
  'あなたの気分を分析中...',
  'ぴったりの1冊を探しています...',
  '本のソムリエが選書中...',
  'もうすぐ見つかります...',
];

function LoadingMessage() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i + 1) % LOADING_MESSAGES.length), 2000);
    return () => clearInterval(timer);
  }, []);
  return (
    <p style={{ color: 'var(--text-sub)', fontFamily: 'sans-serif', fontSize: 15, animation: 'fadeInMsg 0.5s ease' }}>
      {LOADING_MESSAGES[idx]}
    </p>
  );
}

function Header() {
  return (
    <div style={{
      background: '#5C3D2E',
      padding: '20px 28px',
      borderRadius: 8,
      borderTop: '4px solid #8B5E3C',
      borderBottom: '4px solid #3D2110',
      textAlign: 'center',
      position: 'relative',
      marginBottom: 40,
    }}>
      <div style={{
        position: 'absolute', top: '50%', left: 16,
        transform: 'translateY(-50%)',
        width: 12, height: 12, background: '#C4963A', borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute', top: '50%', right: 16,
        transform: 'translateY(-50%)',
        width: 12, height: 12, background: '#C4963A', borderRadius: '50%',
      }} />
      <div style={{ fontSize: 30, color: '#F5E6C8', letterSpacing: '0.15em', fontWeight: 500 }}>
        これよも
      </div>
      <div style={{ fontSize: 11, color: '#C4A882', fontFamily: 'sans-serif', marginTop: 4, letterSpacing: '0.2em' }}>
        KOREYOMO — あなただけの一冊
      </div>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [excludedBooks, setExcludedBooks] = useState<string[]>([]);

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

  async function handleReplaceBook(index: number, bookTitle: string) {
    const newExcluded = [...excludedBooks, bookTitle];
    setExcludedBooks(newExcluded);
    setReplacingIndex(index);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, excludedBooks: newExcluded, replaceIndex: index }),
      });
      const data = await res.json();
      if (data.book && result) {
        const newBooks = [...result.books];
        newBooks[index] = data.book;
        setResult({ ...result, books: newBooks });
      }
    } catch {
      alert('エラーが発生しました');
    } finally {
      setReplacingIndex(null);
    }
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeInMsg { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .bf{animation:float 2s ease-in-out infinite}
        .bf:nth-child(2){animation-delay:0.3s}
        .bf:nth-child(3){animation-delay:0.6s}
      `}</style>
      <div style={{ display: 'flex', gap: 12 }}>
        <span className="bf" style={{ fontSize: 40 }}>📗</span>
        <span className="bf" style={{ fontSize: 40 }}>📘</span>
        <span className="bf" style={{ fontSize: 40 }}>📕</span>
      </div>
      <LoadingMessage />
    </main>
  );

  if (result) return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px' }}>
      <Header />
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 13, color: 'var(--text-sub)', fontFamily: 'sans-serif', marginBottom: 8 }}>あなたのタイプ</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>「{result.type}」</div>
        <div style={{ fontSize: 14, color: 'var(--text-sub)', fontFamily: 'sans-serif' }}>{result.type_reason}</div>
      </div>

      <a href="https://www.amazon.co.jp/kindle-dbs/hz/subscribe/ku?tag=erabook-22"
        target="_blank" rel="noopener noreferrer"
        style={{
          display: 'block', margin: '0 0 32px', padding: '16px',
          background: '#FFF8E7', border: '1px solid #F0C040',
          borderRadius: 12, textDecoration: 'none', textAlign: 'center',
        }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#B8860B', fontFamily: 'sans-serif', marginBottom: 4 }}>
          📖 Kindle Unlimited で無料で読んでみる
        </div>
        <div style={{ fontSize: 12, color: '#8B6914', fontFamily: 'sans-serif' }}>
          30日間無料・200万冊以上が読み放題
        </div>
      </a>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {result.books.map((book, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '24px',
            borderLeft: '4px solid var(--accent)',
            position: 'relative',
          }}>
            {replacingIndex === i && (
              <div style={{
                position: 'absolute', inset: 0, background: 'var(--bg-card)',
                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: 'var(--text-sub)', fontFamily: 'sans-serif',
              }}>
                📚 別の本を探しています...
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontFamily: 'sans-serif' }}>
              <span style={{ fontSize: 12, background: 'var(--accent)', color: '#FDFAF4', padding: '2px 10px', borderRadius: 20 }}>第{i + 1}位</span>
              <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>相性 {book.score}%</span>
              {book.kindle && <span style={{ fontSize: 11, color: 'var(--text-sub)', background: 'var(--accent-light)', padding: '2px 8px', borderRadius: 20 }}>Kindle対応</span>}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{book.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)', fontFamily: 'sans-serif', marginBottom: 12 }}>{book.author}</div>
            <div style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.7, marginBottom: 8, fontFamily: 'sans-serif' }}>{book.reason}</div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
              📖 {book.first_page}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <AmazonLink title={book.title} author={book.author} />
              {!excludedBooks.includes(book.title) && (
                <button onClick={() => handleReplaceBook(i, book.title)} style={{
                  padding: '8px 14px', background: 'transparent',
                  border: '1px solid var(--border)', borderRadius: 6,
                  cursor: 'pointer', fontFamily: 'sans-serif', fontSize: 12,
                  color: 'var(--text-sub)',
                }}>
                  読んだことある
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`私は「${result.type}」タイプ！\nAIが選んでくれた本：${result.books[0].title}（${result.books[0].author}）\n\nあなたもやってみて👇\nhttps://erabook.vercel.app`)}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-block', padding: '12px 28px',
            background: '#000', color: '#fff', borderRadius: 6,
            fontFamily: 'sans-serif', fontSize: 14, fontWeight: 600,
            textDecoration: 'none',
          }}>
          𝕏 結果をシェアする
        </a>
        <button onClick={() => { setStep(0); setAnswers({}); setResult(null); setExcludedBooks([]); }}
          style={{
            padding: '10px 24px', background: 'transparent',
            border: '1px solid var(--border)', borderRadius: 6,
            cursor: 'pointer', fontFamily: 'sans-serif', fontSize: 14, color: 'var(--text-sub)',
          }}>
          もう一度診断する
        </button>
      </div>
    </main>
  );

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px' }}>
      <Header />

      <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
        {QUESTIONS.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= step ? 'var(--gold)' : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-sub)', fontFamily: 'sans-serif' }}>{step + 1} / {QUESTIONS.length}</div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, lineHeight: 1.5 }}>{q.label}</h2>
      {q.multi && <div style={{ fontSize: 12, color: 'var(--text-sub)', fontFamily: 'sans-serif', marginBottom: 16 }}>複数選択OK</div>}
      {q.optional && <div style={{ fontSize: 12, color: 'var(--text-sub)', fontFamily: 'sans-serif', marginBottom: 16 }}>なければそのまま次へ</div>}

      <div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 8,
  marginBottom: 8,
}}>
  {q.options.map((opt, oi) => {
    const colors = q.key === 'avoid' ? GRAY_COLORS[oi % GRAY_COLORS.length] : BOOK_COLORS[oi % BOOK_COLORS.length];
    return (
      <BookButton
        key={opt}
        label={opt}
        color={colors}
        selected={isSelected(q.key, opt)}
        onClick={() => toggle(q.key, opt, q.multi)}
      />
    );
  })}
</div>
      <div style={{ width: '100%', height: 7, background: '#C4A882', borderRadius: 2, marginBottom: 32 }} />

      <button onClick={handleNext} disabled={!canNext()} style={{
        width: '100%', padding: '14px', borderRadius: 8,
        background: canNext() ? '#5C3D2E' : 'var(--border)',
        color: canNext() ? '#F5E6C8' : 'var(--text-sub)',
        border: 'none', cursor: canNext() ? 'pointer' : 'default',
        fontSize: 16, fontFamily: 'sans-serif', fontWeight: 600,
        transition: 'all 0.2s',
      }}>
        {step < QUESTIONS.length - 1 ? '次へ →' : '選書してもらう 📚'}
      </button>
    </main>
  );
}