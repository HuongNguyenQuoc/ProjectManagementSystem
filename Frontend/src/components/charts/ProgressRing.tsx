interface ProgressRingProps {
  /** 0–100. The dashboard sends the server-computed project progress. */
  value: number;
  caption?: string;
}

const RADIUS = 52;
const STROKE = 12;
const SIZE = 148;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Donut gauge — track + accent arc, animated on `stroke-dashoffset`. */
export function ProgressRing({ value, caption = 'complete' }: ProgressRingProps) {
  const pct = Math.min(100, Math.max(0, value));
  const offset = CIRCUMFERENCE * (1 - pct / 100);

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`${Math.round(pct)}% ${caption}`}
    >
      <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--color-neutral-800)"
          strokeWidth={STROKE}
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)' }}
        />
      </g>
      <text
        x={CENTER}
        y={CENTER - 6}
        fill="var(--color-text)"
        fontSize={30}
        fontFamily="var(--font-heading)"
        fontWeight={500}
        textAnchor="middle"
      >
        {Math.round(pct)}%
      </text>
      <text
        x={CENTER}
        y={CENTER + 16}
        fill="var(--color-neutral-400)"
        fontSize={11}
        textAnchor="middle"
      >
        {caption}
      </text>
    </svg>
  );
}
