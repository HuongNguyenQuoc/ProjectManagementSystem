import type { CSSProperties, ReactNode } from 'react';

interface TagProps {
  /** A tag recipe from `lib/constants` (status / priority / severity). */
  style?: CSSProperties;
  children: ReactNode;
  title?: string;
}

export function Tag({ style, children, title }: TagProps) {
  return (
    <span className="tag" style={style} title={title}>
      {children}
    </span>
  );
}

/** Coloured dot + label, used wherever a status appears inside a table row. */
export function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
      <span
        style={{ width: 8, height: 8, borderRadius: '50%', background: color, flex: 'none' }}
        aria-hidden
      />
      {label}
    </span>
  );
}
