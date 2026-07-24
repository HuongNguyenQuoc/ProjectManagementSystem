export interface BarEntry {
  label: string;
  value: number;
  color: string;
}

/** Vertical bars — "Tasks by status". Heights animate over 0.7s. */
export function VerticalBars({ entries }: { entries: BarEntry[] }) {
  const max = Math.max(1, ...entries.map((entry) => entry.value));

  return (
    <div
      style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 150, padding: '24px 4px 0' }}
    >
      {entries.map((entry) => (
        <div
          key={entry.label}
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div
              style={{
                width: '100%',
                height: `${(entry.value / max) * 100}%`,
                minHeight: entry.value ? 6 : 0,
                background: entry.color,
                borderRadius: '6px 6px 0 0',
                transition: 'height .7s cubic-bezier(.22,1,.36,1)',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: -20,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontSize: 12,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {entry.value || ''}
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              color: 'var(--color-neutral-400)',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {entry.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Horizontal bars — "Tasks by priority" / "Issues by severity". */
export function HorizontalBars({ entries }: { entries: BarEntry[] }) {
  const max = Math.max(1, ...entries.map((entry) => entry.value));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {entries.map((entry) => (
        <div key={entry.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 78,
              flex: 'none',
              textAlign: 'right',
              fontSize: 12,
              color: 'var(--color-neutral-400)',
            }}
          >
            {entry.label}
          </span>
          <div
            style={{
              flex: 1,
              height: 20,
              background: 'var(--color-neutral-900)',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(entry.value / max) * 100}%`,
                height: '100%',
                background: entry.color,
                borderRadius: 6,
                transition: 'width .7s cubic-bezier(.22,1,.36,1)',
              }}
            />
          </div>
          <span
            style={{
              width: 22,
              textAlign: 'right',
              fontSize: 13,
              fontFamily: 'var(--font-heading)',
            }}
          >
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
