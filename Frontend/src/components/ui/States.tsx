import type { ReactNode } from 'react';
import { CircleNotch, WarningCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { errorMessage } from '@/lib/api';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '54px 0',
        color: 'var(--color-neutral-500)',
        fontSize: 13.5,
      }}
    >
      <CircleNotch size={18} className="ph-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div
      className="card elev-sm"
      style={{ alignItems: 'center', textAlign: 'center', gap: 10, padding: '34px 24px' }}
    >
      <WarningCircle size={26} color="var(--color-danger)" />
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15 }}>Could not load this</div>
      <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', maxWidth: 420 }}>
        {errorMessage(error)}
      </div>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '48px 24px',
        textAlign: 'center',
        color: 'var(--color-neutral-500)',
      }}
    >
      {icon}
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: 'var(--color-text)' }}>
        {title}
      </div>
      {description ? (
        <div style={{ fontSize: 13, maxWidth: 380 }}>{description}</div>
      ) : null}
      {action ? <div style={{ marginTop: 6 }}>{action}</div> : null}
    </div>
  );
}
