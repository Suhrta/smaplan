import type { Metadata } from 'next';
import { SiteHeader } from '@/app/components/SiteHeader';
import { Breadcrumb } from '@/app/components/Breadcrumb';

export const metadata: Metadata = {
  title: '利用規約 | スマートプラン',
  description:
    'スマートプラン（smaplan.com）の利用規約。AI診断の非保証、免責事項、著作権、準拠法について記載しています。',
  robots: { index: true, follow: true },
  alternates: { canonical: '/legal/terms' },
};

export default function TermsPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <SiteHeader />
      <main className="sp-container" style={{ padding: '40px 20px 60px', maxWidth: 760 }}>
        <Breadcrumb items={[
          { label: 'ホーム', href: '/' },
          { label: '利用規約' },
        ]} />
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>
          利用規約
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 32px' }}>
          制定日: 2026年4月20日
        </p>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>第1条（適用）</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0 }}>
            本規約は、スマートプラン（以下「本サイト」）の提供するすべてのサービスに適用されます。本サイトを利用したユーザーは、本規約に同意したものとみなします。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>第2条（サービス内容）</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0 }}>
            本サイトは、AIを用いたスマートフォン料金プランおよびインターネット回線プランの診断・紹介サービスを提供します。診断結果は、ユーザーが入力した回答に基づき生成された参考情報です。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>第3条（免責事項）</h2>
          <ul style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0, paddingLeft: 20 }}>
            <li>
              AI診断の結果は参考情報であり、個別のユーザーに最適なプランを保証するものではありません。
            </li>
            <li>
              掲載するプラン情報（料金、速度、キャンペーン内容、特典等）は掲載時点の公開情報に基づきますが、最新性・正確性・完全性を保証しません。実際の契約前に、各事業者の公式サイト・契約書類で必ず最新条件をご確認ください。
            </li>
            <li>
              本サイトの情報を利用したことによりユーザーまたは第三者に生じた損害について、当サイトは一切の責任を負いません。
            </li>
            <li>
              本サイトから外部サイト（各事業者の公式サイト、アフィリエイトリンク先等）へ遷移した後のトラブル・契約内容について、当サイトは関与せず責任を負いません。
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>第4条（著作権）</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0 }}>
            本サイトに掲載されているコンテンツ（テキスト・画像・デザイン等）の著作権は、本サイトまたは正当な権利者に帰属します。無断転載・複製・改変を禁じます。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>第5条（サービスの変更・停止）</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0 }}>
            本サイトは、ユーザーへの事前通知なく、サービス内容の変更・追加・停止を行うことができるものとします。これにより生じた損害についても、当サイトは責任を負いません。
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>第6条（禁止事項）</h2>
          <ul style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0, paddingLeft: 20 }}>
            <li>法令または公序良俗に反する行為</li>
            <li>本サイトの運営を妨害する行為（過度なリクエスト送信、スクレイピング等）</li>
            <li>他のユーザーまたは第三者の権利を侵害する行為</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 10px' }}>第7条（準拠法・管轄）</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-main)', margin: 0 }}>
            本規約の解釈および適用は日本法に準拠します。本サイトに関連して紛争が生じた場合は、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>
      </main>
    </div>
  );
}
