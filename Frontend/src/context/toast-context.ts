import { createContext } from 'react';

export type ToastTone = 'success' | 'error';

export interface ToastMessage {
  id: number;
  text: string;
  tone: ToastTone;
}

export interface ToastContextValue {
  toasts: ToastMessage[];
  /** Bottom-centre toast, auto-dismissed after 2.6s (matches the design spec). */
  showToast: (text: string, tone?: ToastTone) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export const TOAST_DURATION_MS = 2600;
 