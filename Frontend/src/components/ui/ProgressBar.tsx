interface ProgressBarProps {
  value: number;
  height?: number;
  /** Overrides the accent gradient — used to paint DONE tasks green. */
  fill?: string;
  durationMs?: number;
}

export function ProgressBar({ value, height = 6, fill, durationMs = 500 }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        height,
        borderRadius: height,
        background: 'var(--color-neutral-800)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: height,
          background:
            fill ?? 'linear-gradient(90deg, var(--color-accent-600), var(--color-accent-400))',
          transition: `width ${durationMs}ms cubic-bezier(.22,1,.36,1)`,
        }}
      />
    </div>
  );
}
