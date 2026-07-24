import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle, WarningCircle } from '@phosphor-icons/react';
import {
  TOAST_DURATION_MS,
  ToastContext,
  type ToastContextValue,
  type ToastMessage,
  type ToastTone,
} from '@/context/toast-context';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(window.clearTimeout);
  }, []);

  const showToast = useCallback((text: string, tone: ToastTone = 'success') => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((current) => [...current, { id, text, tone }]);
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_DURATION_MS + 120);
    timers.current.push(timer);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ toasts, showToast }), [toasts, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: 26,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="ph-toast"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '11px 18px',
              background: 'var(--color-surface)',
              boxShadow: 'var(--shadow-lg)',
              borderRadius: 10,
              fontSize: 14,
              whiteSpace: 'nowrap',
            }}
          >
            {toast.tone === 'success' ? (
              <CheckCircle size={18} weight="fill" color="var(--color-success)" />
            ) : (
              <WarningCircle size={18} weight="fill" color="var(--color-danger)" />
            )}
            {toast.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
