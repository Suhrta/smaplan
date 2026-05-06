import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/app/components/SiteHeader';

export const metadata: Metadata = {
  title: '運営者情報 | スマートプラン',
  description:
    'スマートプラン（smaplan.com）の運営者情報。サイト運営目的、取扱サービス、お問い合わせ先を記載しています。',
  robots: { index: true, follow: true },
  alternates: { canonical: '/legal/about' },
};

export default function AboutPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <SiteHeader />
      <main className="sp-container" style={{ padding: '40px 20px 60px', maxWidth: 760 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 24px', color: 'var(--text-main)' }}>
          運営者情報
        </h1>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>サイト概要</h2>
          <dl style={{ margin: 0, fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)' }}>
            <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
              <dt style={{ width: 140, fontWeight: 600, color: 'var(--text-sub)' }}>サイト名</dt>
              <dd style={{ margin: 0 }}>スマートプラン（SmartPlan）</dd>
            </div>
            <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
              <dt style={{ width: 140, fontWeight: 600, color: 'var(--text-sub)' }}>URL</dt>
              <dd style={{ margin: 0 }}>
                <a href="https://smaplan.com" style={{ color: 'var(--accent)' }}>
                  https://smaplan.com
                </a>
              </dd>
            </div>
            <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
              <dt style={{ width: 140, fontWeight: 600, color: 'var(--text-sub)' }}>運営者</dt>
              <dd style={{ margin: 0 }}>スマートプラン運営事務局</dd>
            </div>
            <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
              <dt style={{ width: 140, fontWeight: 600, color: 'var(--text-sub)' }}>お問い合わせ</dt>
              <dd style={{ margin: 0 }}>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfUz5oZ1agLTkkAF4a45qxKdnIkwnug1_wKQQ87u659u4xhQA/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)' }}
                >
                  お問い合わせフォーム（Google フォーム）
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>サイトの目的</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0 }}>
            本サイトは、生成AIを活用してスマートフォン料金プランおよびインターネット回線プランをユーザーの利用状況に応じて診断・紹介し、固定費の見直しをサポートすることを目的としています。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>掲載情報について</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0 }}>
            本サイトに掲載する料金・速度・キャンペーン等の情報は、各事業者の公開情報に基づき作成していますが、最新性・正確性を保証するものではありません。実際の契約にあたっては、各事業者の公式サイト・契約書類を必ずご確認ください。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>アフィリエイトプログラムについて</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0 }}>
            本サイトは、A8.net 等のアフィリエイトサービスを通じて、紹介する各事業者への遷移に対して成果報酬を得ることがあります。ユーザーが実際に支払う料金に影響はありません。
            詳しくは
            <Link href="/legal/privacy" style={{ color: 'var(--accent)', marginLeft: 4 }}>
              プライバシーポリシー
            </Link>
            および
            <Link href="/legal/terms" style={{ color: 'var(--accent)', marginLeft: 4 }}>
              利用規約
            </Link>
            をご確認ください。
          </p>
        </section>
      </main>
    </div>
  );
}
