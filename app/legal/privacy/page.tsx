import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/app/components/SiteHeader';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | スマートプラン',
  description:
    'スマートプラン（smaplan.com）のプライバシーポリシー。診断回答・Cookie・Google Analytics・アフィリエイトリンクによる情報取得とその取扱いについて説明します。',
  robots: { index: true, follow: true },
  alternates: { canonical: '/legal/privacy' },
};

export default function PrivacyPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <SiteHeader />
      <main className="sp-container" style={{ padding: '40px 20px 60px', maxWidth: 760 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>
          プライバシーポリシー
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 32px' }}>
          制定日: 2026年4月20日
        </p>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>1. 取得する情報</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0 }}>
            本サイトは、診断機能の利用時にユーザーが入力する回答内容（住居タイプ、利用状況などの匿名情報）を処理します。氏名・メールアドレス・電話番号などの個人を特定可能な情報は取得しません。
            また、Cookie および類似技術を用いて、ページアクセス状況・リファラ・デバイス種別などの匿名アクセス情報を取得します。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>2. 利用目的</h2>
          <ul style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0, paddingLeft: 20 }}>
            <li>AIによる診断結果の生成および表示</li>
            <li>サービスの品質改善、利用状況の分析</li>
            <li>統計データの作成（個人を特定できない形式）</li>
          </ul>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>3. Google Analytics の利用</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: '0 0 10px' }}>
            本サイトは、アクセス解析のため Google LLC が提供する Google Analytics 4 を使用しています。
            Google Analytics は Cookie を利用してユーザーのサイト利用状況を匿名で収集します。収集されたデータは Google のプライバシーポリシーに基づき管理されます。
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0 }}>
            Google Analytics によるトラッキングを無効にしたい場合は、
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)' }}
            >
              Google が提供するオプトアウトアドオン
            </a>
            をご利用ください。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>4. アフィリエイトプログラム</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0 }}>
            本サイトは、A8.net 等のアフィリエイトサービスを利用しています。これらのサービスは、広告主により提供された広告を表示するため、ユーザーに関する情報（Cookie など）を取得する場合があります。
            これらの第三者による情報取得は、各サービス提供者のプライバシーポリシーに従って行われます。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>5. 第三者提供</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0 }}>
            取得した情報は、法令に基づく場合を除き、本人の同意なく第三者へ提供しません。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>6. お問い合わせ</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0 }}>
            本ポリシーに関するお問い合わせは
            <Link href="/legal/about" style={{ color: 'var(--accent)', marginLeft: 4 }}>
              運営者情報
            </Link>
            記載の窓口までお願いします。
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>7. 改定</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0 }}>
            本ポリシーは、法令変更やサービス内容の変更に伴い予告なく改定する場合があります。重要な変更時は本サイト上で告知します。
          </p>
        </section>
      </main>
    </div>
  );
}
