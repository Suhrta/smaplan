'use client';

import { useEffect, useRef, useState, useCallback, type CSSProperties } from 'react';

type Phase = 'before' | 'smaho' | 'kaisen';

const CX = 340;
const CY = 180;
const R = 118;
const STROKE_W = 64;
const CIRC = 2 * Math.PI * R;
const OUTER_R = R + STROKE_W / 2;

const RIGHT_LABEL_Y1 = 135;
const RIGHT_LABEL_Y2 = 228;

const LEFT_LABEL_Y = CY;

function donutEdgeX(cy: number, y: number, outerR: number, side: 'right' | 'left') {
  const dy = y - cy;
  const dx = Math.sqrt(outerR * outerR - dy * dy);
  return side === 'right' ? CX + dx : CX - dx;
}

function animateValue(
  from: number,
  to: number,
  duration: number,
  onUpdate: (v: number) => void,
  onDone?: () => void,
): number {
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    onUpdate(Math.round(from + (to - from) * eased));
    if (p < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      onDone?.();
    }
  };
  let rafId = requestAnimationFrame(step);
  return rafId;
}

export function SavingsChart() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<Phase>('before');
  const [amount, setAmount] = useState(13000);
  const [showHeadline, setShowHeadline] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);
  const timersRef = useRef<number[]>([]);

  const cleanup = useCallback(() => {
    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) {
      setPhase('kaisen');
      setAmount(7753);
      setShowHeadline(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.disconnect();

          const t1 = window.setTimeout(() => {
            setPhase('smaho');
            rafRef.current = animateValue(13000, 8655, 1100, setAmount, () => {
              const t2 = window.setTimeout(() => {
                setPhase('kaisen');
                rafRef.current = animateValue(8655, 7753, 1100, setAmount, () => {
                  const t3 = window.setTimeout(() => setShowHeadline(true), 400);
                  timersRef.current.push(t3);
                });
              }, 2000);
              timersRef.current.push(t2);
            });
          }, 2000);
          timersRef.current.push(t1);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);

    const onScroll = () => {
      el.style.setProperty('--scroll-y', String(window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      cleanup();
    };
  }, [cleanup]);

  const ratios: Record<Phase, { blue: number; gray: number }> = {
    before: { blue: 1, gray: 0 },
    smaho: { blue: 8655 / 13000, gray: 4345 / 13000 },
    kaisen: { blue: 7753 / 13000, gray: 5247 / 13000 },
  };

  const { blue: blueRatio, gray: grayRatio } = ratios[phase];
  const blueLen = blueRatio * CIRC;
  const grayLen = grayRatio * CIRC;

  const arcStyle: CSSProperties = {
    transition:
      'stroke-dasharray 1000ms cubic-bezier(.22,.61,.36,1), stroke-dashoffset 1000ms cubic-bezier(.22,.61,.36,1)',
  };

  const isKaisen = phase === 'kaisen';

  const rEdgeX1 = donutEdgeX(CY, RIGHT_LABEL_Y1, OUTER_R, 'right');
  const rEdgeX2 = donutEdgeX(CY, RIGHT_LABEL_Y2, OUTER_R, 'right');

  const lEdgeX = donutEdgeX(CY, LEFT_LABEL_Y, OUTER_R, 'left');

  const LEADER_END_R = 510;
  const LEADER_END_L = 165;

  const fadeIn = (visible: boolean): CSSProperties => ({
    opacity: visible ? 1 : 0,
    transition: 'opacity 600ms ease-out',
  });

  return (
    <div ref={ref} className="mx-auto w-full max-w-[280px] sm:max-w-[480px] md:max-w-[680px]">
      <div
        className="text-center transition-all duration-500"
        style={{
          opacity: showHeadline ? 1 : 0,
          transform: showHeadline ? 'scale(1)' : 'scale(0.85)',
        }}
      >
        <div className="mb-3 text-[16px] font-bold text-[#111] sm:mb-4 sm:text-[20px] md:text-[24px]">
          年間 約<span className="text-[#4338ca]">63,000</span>円 節約
        </div>
      </div>

      <div className="chart-perspective">
        <svg
          viewBox="0 0 680 360"
          className="block h-auto w-full"
          style={{
            filter:
              'drop-shadow(0 8px 40px rgba(67, 56, 202, 0.12)) drop-shadow(0 20px 60px rgba(67, 56, 202, 0.1))',
          }}
          aria-hidden
        >
          <defs>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4338ca" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>

          {/* White background circle */}
          <circle cx={CX} cy={CY} r={OUTER_R} fill="white" />
          {/* Outer purple border */}
          <circle cx={CX} cy={CY} r={OUTER_R} fill="none" stroke="rgba(67,56,202,0.15)" strokeWidth="1" />

          {/* Gray arc (savings) */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="#d1d5db"
            strokeWidth={STROKE_W}
            strokeDasharray={`${grayLen} ${CIRC - grayLen}`}
            strokeDashoffset={-blueLen}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={arcStyle}
          />
          {/* Blue arc (cost) */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="url(#blueGrad)"
            strokeWidth={STROKE_W}
            strokeDasharray={`${blueLen} ${CIRC - blueLen}`}
            strokeDashoffset={0}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={arcStyle}
          />

          {/* Right leader lines */}
          <line x1={rEdgeX1} y1={RIGHT_LABEL_Y1} x2={LEADER_END_R} y2={RIGHT_LABEL_Y1} stroke="#c4c4c4" strokeWidth="2" />
          <line x1={rEdgeX2} y1={RIGHT_LABEL_Y2} x2={LEADER_END_R} y2={RIGHT_LABEL_Y2} stroke="#c4c4c4" strokeWidth="2" />

          {/* Left leader line */}
          <line x1={lEdgeX} y1={LEFT_LABEL_Y} x2={LEADER_END_L} y2={LEFT_LABEL_Y} stroke="#c4c4c4" strokeWidth="2" style={fadeIn(isKaisen)} />

          {/* Right labels */}
          <foreignObject x="516" y={RIGHT_LABEL_Y1 - 16} width="164" height="56">
            <LabelBlock color="#4338ca" title="スマホ代" sub="¥2,970/月" />
          </foreignObject>
          <foreignObject x="516" y={RIGHT_LABEL_Y2 - 16} width="164" height="56">
            <LabelBlock color="#4338ca" title="ネット回線" sub="¥4,783/月" />
          </foreignObject>

          {/* Left savings label */}
          <foreignObject x="0" y={LEFT_LABEL_Y - 28} width="165" height="60" style={fadeIn(isKaisen)}>
            <div className="whitespace-nowrap text-right">
              <div className="text-[24px] font-bold leading-none" style={{ background: 'linear-gradient(135deg, #4338ca, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>-¥5,247/月</div>
              <div className="mt-1.5 text-[14px] font-medium text-[#888]">節約</div>
            </div>
          </foreignObject>

          {/* Center */}
          <foreignObject x={CX - 100} y={CY - 36} width="200" height="72">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex items-baseline text-[#111]">
                <span className="text-[16px] font-bold">¥</span>
                <span className="text-[36px] font-bold leading-none tracking-[-0.02em] tabular-nums">
                  {amount.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 text-[14px] font-medium text-[#888]">/月</div>
            </div>
          </foreignObject>
        </svg>
      </div>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-[#888]">
        ※当社シミュレーションによる試算例です
      </p>
    </div>
  );
}

function LabelBlock({
  color,
  title,
  sub,
}: {
  color: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="whitespace-nowrap">
      <div className="flex items-center gap-2">
        <span aria-hidden className="block h-3.5 w-3.5 rounded-full" style={{ background: color }} />
        <span className="text-[20px] font-bold leading-none text-[#111]">{title}</span>
      </div>
      <div className="mt-1.5 pl-[22px] text-[16px] font-medium text-[#555]">{sub}</div>
    </div>
  );
}
