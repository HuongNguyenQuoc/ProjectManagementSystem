import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';

interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  submitting?: boolean;
  submitDisabled?: boolean;
  error?: string | null;
  children: ReactNode;
}

/** `.dialog-backdrop` + `.dialog`, scale-in 0.28s, Escape and backdrop close. */
export function Dialog({
  open,
  title,
  onClose,
  onSubmit,
  submitLabel,
  submitting = false,
  submitDisabled = false,
  error,
  children,
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="dialog-backdrop ph-fade-in"
      style={{ zIndex: 50 }}
      onClick={onClose}
      role="presentation"
    >
      <form
        className="dialog ph-scale-in"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="dialog-title">{title}</div>
          <Button variant="icon" onClick={onClose} aria-label="Close">
            <X size={16} />
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>{children}</div>

        {error ? (
          <div
            className="field-error"
            style={{
              background: 'color-mix(in srgb, var(--color-danger) 12%, transparent)',
              padding: '8px 11px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {error}
          </div>
        ) : null}

        <div className="dialog-actions">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting} disabled={submitDisabled}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
