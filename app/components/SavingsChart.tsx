'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

type Phase = 'before' | 'after';

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

export function SavingsChart() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<Phase>('before');
  const [amount, setAmount] = useState(15000);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduce) {
      setPhase('after');
      setAmount(9000);
      return;
    }

    let afterTimer: number | undefined;
    let rafId: number | undefined;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.disconnect();

          afterTimer = window.setTimeout(() => {
            setPhase('after');
            const start = performance.now();
            const from = 15000;
            const to = 9000;
            const duration = 1100;
            const step = (now: number) => {
              const p = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setAmount(Math.round(from + (to - from) * eased));
              if (p < 1) rafId = requestAnimationFrame(step);
            };
            rafId = requestAnimationFrame(step);
          }, 2000);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);

    const onScroll = () => {
      if (!prefersReduce) {
        el.style.setProperty('--scroll-y', String(window.scrollY));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (afterTimer !== undefined) clearTimeout(afterTimer);
      if (rafId !== undefined) cancelAnimationFrame(rafId);
    };
  }, []);

  const blueRatio = phase === 'after' ? 0.6 : 1;
  const grayRatio = phase === 'after' ? 0.4 : 0;
  const blueLen = blueRatio * CIRC;
  const grayLen = grayRatio * CIRC;

  const arcStyle: CSSProperties = {
    transition:
      'stroke-dasharray 1000ms cubic-bezier(.22,.61,.36,1), stroke-dashoffset 1000ms cubic-bezier(.22,.61,.36,1)',
  };

  const isAfter = phase === 'after';

  const rEdgeX1 = donutEdgeX(CY, RIGHT_LABEL_Y1, OUTER_R, 'right');
  const rEdgeX2 = donutEdgeX(CY, RIGHT_LABEL_Y2, OUTER_R, 'right');
  const lEdgeX = donutEdgeX(CY, LEFT_LABEL_Y, OUTER_R, 'left');

  const LEADER_END_R = 510;
  const LEADER_END_L = 165;

  return (
    <div
      ref={ref}
      className="mx-auto w-full max-w-[680px]"
      style={{
        transform:
          'perspective(1000px) rotateY(-2deg) translateY(calc(var(--scroll-y, 0) * 0.04px))',
        willChange: 'transform',
      }}
    >
      <svg
        viewBox="0 0 680 360"
        className="block h-auto w-full"
        style={{
          filter:
            'drop-shadow(0 20px 60px rgba(67, 56, 202, 0.1)) drop-shadow(0 8px 24px rgba(67, 56, 202, 0.06))',
        }}
        aria-hidden
      >
        <defs>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4338ca" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth={STROKE_W}
          strokeDasharray={`${grayLen} ${CIRC - grayLen}`}
          strokeDashoffset={-blueLen}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={arcStyle}
        />
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

        <line
          x1={rEdgeX1}
          y1={RIGHT_LABEL_Y1}
          x2={LEADER_END_R}
          y2={RIGHT_LABEL_Y1}
          stroke="#c4c4c4"
          strokeWidth="2"
        />
        <line
          x1={rEdgeX2}
          y1={RIGHT_LABEL_Y2}
          x2={LEADER_END_R}
          y2={RIGHT_LABEL_Y2}
          stroke="#c4c4c4"
          strokeWidth="2"
        />
        <line
          x1={lEdgeX}
          y1={LEFT_LABEL_Y}
          x2={LEADER_END_L}
          y2={LEFT_LABEL_Y}
          stroke="#c4c4c4"
          strokeWidth="2"
          style={{
            opacity: isAfter ? 1 : 0,
            transition: 'opacity 600ms ease-out',
          }}
        />

        <foreignObject x="516" y={RIGHT_LABEL_Y1 - 16} width="164" height="56">
          <LabelBlock color="#4338ca" title="スマホ代" sub="¥5,000/月" />
        </foreignObject>
        <foreignObject x="516" y={RIGHT_LABEL_Y2 - 16} width="164" height="56">
          <LabelBlock color="#4338ca" title="ネット回線" sub="¥4,000/月" />
        </foreignObject>
        <foreignObject
          x="0"
          y={LEFT_LABEL_Y - 16}
          width="160"
          height="56"
          style={{
            opacity: isAfter ? 1 : 0,
            transition: 'opacity 600ms ease-out',
          }}
        >
          <LabelBlock
            color="#b0b0b0"
            title="節約分"
            sub="-¥6,000/月"
            align="right"
          />
        </foreignObject>

        <foreignObject x={CX - 100} y={CY - 46} width="200" height="92">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#888]">
              Monthly
            </div>
            <div className="mt-1 flex items-baseline text-[#111]">
              <span className="mr-1 text-[12px] font-medium text-[#555]">月</span>
              <span className="text-[14px] font-medium">¥</span>
              <span className="text-[30px] font-bold leading-none tracking-[-0.02em] tabular-nums">
                {amount.toLocaleString()}
              </span>
            </div>
            <div
              className="mt-1.5 text-[11px] font-bold text-[#4338ca] transition-opacity duration-700"
              style={{ opacity: isAfter ? 1 : 0 }}
            >
              -¥6,000 / 月 節約
            </div>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}

function LabelBlock({
  color,
  title,
  sub,
  align = 'left',
}: {
  color: string;
  title: string;
  sub: string;
  align?: 'left' | 'right';
}) {
  const isRight = align === 'right';
  return (
    <div className={`whitespace-nowrap ${isRight ? 'text-right' : ''}`}>
      <div
        className={`flex items-center gap-2 ${isRight ? 'flex-row-reverse' : ''}`}
      >
        <span
          aria-hidden
          className="block h-2.5 w-2.5 rounded-full"
          style={{ background: color }}
        />
        <span className="text-[24px] font-bold leading-none text-[#111]">
          {title}
        </span>
      </div>
      <div
        className={`mt-1 text-[16px] font-medium text-[#555] ${
          isRight ? 'pr-[18px]' : 'pl-[18px]'
        }`}
      >
        {sub}
      </div>
    </div>
  );
}
