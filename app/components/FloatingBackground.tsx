type Props = {
  variant?: 'portal' | 'smaho' | 'kaisen';
};

export function FloatingBackground({ variant = 'portal' }: Props) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity: 0.85 }}
    >
      {/* スマホ（約2倍に拡大、中央寄せ） */}
      {(variant === 'portal' || variant === 'smaho') && (
        <div
          className="absolute anim-float-slow"
          style={{
            right: '6%',
            top: '18%',
            filter: 'drop-shadow(0 14px 40px rgba(124, 107, 237, 0.18))',
          }}
        >
          <PhoneIllustration />
        </div>
      )}

      {/* 家＋WiFi（約1.7倍に拡大、中央寄せ） */}
      {(variant === 'portal' || variant === 'kaisen') && (
        <div
          className="absolute anim-float-med"
          style={{
            left: '14%',
            bottom: '8%',
            filter: 'drop-shadow(0 14px 40px rgba(124, 107, 237, 0.18))',
          }}
        >
          <HouseIllustration />
        </div>
      )}

      {/* 中型アイコン（WiFi / 地球） */}
      <div className="absolute right-[30%] bottom-[18%] anim-float-fast">
        <WifiIcon />
      </div>
      <div className="absolute left-[30%] top-[14%] anim-float-med">
        <GlobeIcon />
      </div>
      <div className="absolute left-[48%] top-[40%] anim-float-slow">
        <SignalIcon />
      </div>

      {/* 散らばった丸・四角（数を大幅に増やす） */}
      <span className="absolute left-[16%] top-[22%] block h-3 w-3 rounded-full bg-[#c4b5fd] anim-float-fast" />
      <span className="absolute left-[42%] top-[12%] block h-4 w-4 rounded-full bg-[#ede9fe] anim-float-fast" />
      <span className="absolute left-[58%] top-[22%] block h-3 w-3 rounded-full bg-[#c4b5fd] anim-float-slow" />
      <span className="absolute right-[12%] top-[62%] block h-5 w-5 rounded-md bg-[#ddd6fe] anim-float-slow" />
      <span className="absolute left-[12%] top-[64%] block h-2.5 w-2.5 rounded-full bg-[#c4b5fd] anim-float-med" />
      <span className="absolute right-[38%] top-[8%] block h-3 w-3 rounded-full bg-[#c4b5fd] anim-float-med" />
      <span className="absolute left-[52%] bottom-[14%] block h-4 w-4 rounded-md bg-[#ede9fe] anim-float-slow" />
      <span className="absolute right-[8%] top-[46%] block h-2.5 w-2.5 rounded-full bg-[#ddd6fe] anim-float-fast" />
      <span className="absolute right-[45%] top-[72%] block h-3 w-3 rounded-md bg-[#c4b5fd] anim-float-fast" />
      <span className="absolute left-[70%] top-[52%] block h-2 w-2 rounded-full bg-[#ddd6fe] anim-float-med" />
      <span className="absolute left-[24%] bottom-[24%] block h-3 w-3 rounded-md bg-[#ede9fe] anim-float-med" />
      <span className="absolute right-[25%] top-[36%] block h-2 w-2 rounded-full bg-[#c4b5fd] anim-float-slow" />
      <span className="absolute right-[52%] bottom-[28%] block h-2.5 w-2.5 rounded-full bg-[#ddd6fe] anim-float-fast" />
      <span className="absolute left-[6%] top-[40%] block h-2 w-2 rounded-full bg-[#c4b5fd] anim-float-slow" />
      <span className="absolute right-[18%] bottom-[38%] block h-3.5 w-3.5 rounded-md bg-[#ede9fe] anim-float-med" />
    </div>
  );
}

function PhoneIllustration() {
  return (
    <svg
      width="260"
      height="380"
      viewBox="0 0 140 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="8" y="8" width="124" height="184" rx="20" fill="#ede9fe" stroke="#a78bfa" strokeWidth="1.6" />
      <rect x="20" y="26" width="100" height="10" rx="2" fill="#c4b5fd" />
      <rect x="20" y="46" width="60" height="6" rx="2" fill="#a78bfa" opacity="0.75" />
      <rect x="20" y="66" width="100" height="44" rx="10" fill="#fff" stroke="#c4b5fd" strokeWidth="1.2" />
      <circle cx="38" cy="88" r="10" fill="#a78bfa" opacity="0.65" />
      <rect x="54" y="80" width="54" height="6" rx="2" fill="#c4b5fd" />
      <rect x="54" y="92" width="38" height="5" rx="2" fill="#ddd6fe" />
      <rect x="20" y="122" width="46" height="32" rx="8" fill="#ddd6fe" />
      <rect x="74" y="122" width="46" height="32" rx="8" fill="#ddd6fe" />
      <rect x="48" y="168" width="44" height="6" rx="3" fill="#a78bfa" opacity="0.85" />
    </svg>
  );
}

function HouseIllustration() {
  return (
    <svg
      width="360"
      height="320"
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 80L100 20L180 80V160H20V80Z"
        fill="#ede9fe"
        stroke="#a78bfa"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M100 20L180 80" stroke="#c4b5fd" strokeWidth="1" />
      <path d="M100 20L20 80" stroke="#c4b5fd" strokeWidth="1" />
      <line x1="20" y1="95" x2="180" y2="95" stroke="#c4b5fd" strokeWidth="0.8" strokeDasharray="3 3" />

      {/* 各部屋 */}
      <rect x="40" y="105" width="40" height="40" rx="4" fill="#fff" stroke="#c4b5fd" strokeWidth="1.2" />
      <rect x="95" y="105" width="30" height="55" rx="3" fill="#fff" stroke="#c4b5fd" strokeWidth="1.2" />
      <rect x="140" y="105" width="35" height="30" rx="3" fill="#fff" stroke="#c4b5fd" strokeWidth="1.2" />

      {/* 電波パス（ドット＋ドリフト） */}
      <path
        d="M100 69 Q 80 85 60 125"
        fill="none"
        stroke="#a78bfa"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="1 6"
        className="anim-dash-drift"
      />
      <path
        d="M100 69 Q 103 95 110 132"
        fill="none"
        stroke="#a78bfa"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="1 6"
        className="anim-dash-drift"
        style={{ animationDelay: '0.8s' }}
      />
      <path
        d="M100 69 Q 128 88 157 120"
        fill="none"
        stroke="#a78bfa"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="1 6"
        className="anim-dash-drift"
        style={{ animationDelay: '1.6s' }}
      />

      {/* WiFi ルーター */}
      <g transform="translate(85, 60)">
        <rect x="0" y="0" width="30" height="18" rx="4" fill="#a78bfa" />
        <circle cx="7" cy="9" r="2" fill="#fff" />
        <circle cx="15" cy="9" r="2" fill="#fff" />
        <circle cx="23" cy="9" r="2" fill="#fff" />
      </g>

      {/* パルスリング（ずっと大きくゆっくり、3段） */}
      <circle cx="100" cy="69" r="22" fill="none" stroke="#a78bfa" strokeWidth="1.4" className="anim-pulse-ring" />
      <circle cx="100" cy="69" r="22" fill="none" stroke="#a78bfa" strokeWidth="1.4" className="anim-pulse-ring" style={{ animationDelay: '2s' }} />
      <circle cx="100" cy="69" r="22" fill="none" stroke="#a78bfa" strokeWidth="1.4" className="anim-pulse-ring" style={{ animationDelay: '4s' }} />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="#a78bfa" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15 15 0 0 1 0 20" />
      <path d="M12 2a15 15 0 0 0 0 20" />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="14" width="3" height="6" rx="1" />
      <rect x="9" y="10" width="3" height="10" rx="1" />
      <rect x="15" y="6" width="3" height="14" rx="1" />
    </svg>
  );
}
