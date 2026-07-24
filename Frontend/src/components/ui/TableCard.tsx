import type { ReactNode } from 'react';

/** Card shell that lets a wide table scroll horizontally without the page doing so. */
export function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="card elev-sm" style={{ padding: '6px 10px' }}>
      <div style={{ overflowX: 'auto' }}>{children}</div>
    </div>
  );
}
