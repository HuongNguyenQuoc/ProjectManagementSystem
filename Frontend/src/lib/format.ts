import type { CSSProperties } from 'react';

/** "Huong Nguyen" → "HN". Used for every avatar in the app. */
export function initials(name?: string | null): string {
  if (!name) return '?';
  return (
    name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

const AVATAR_PALETTE: CSSProperties[] = [
  { background: 'var(--color-accent-800)', color: 'var(--color-accent-100)' },
  { background: 'var(--color-accent-2-800)', color: 'var(--color-accent-2-100)' },
  { background: 'oklch(0.34 0.07 75)', color: 'oklch(0.9 0.09 85)' },
  { background: 'oklch(0.32 0.08 150)', color: 'oklch(0.9 0.1 150)' },
  { background: 'oklch(0.33 0.09 25)', color: 'oklch(0.9 0.08 30)' },
  { background: 'var(--color-neutral-800)', color: 'var(--color-neutral-100)' },
];

/**
 * Deterministic avatar tint. Keyed off the user id (or name) so the same
 * person keeps the same colour across every screen and every reload.
 */
export function avatarStyle(key?: string | null): CSSProperties {
  if (!key) return { background: 'var(--color-neutral-800)', color: 'var(--color-neutral-300)' };
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

/** "2026-08-18T00:00:00.000Z" → "Aug 18". Em dash when absent. */
export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateLong(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Relative label for comment timestamps, falling back to a short date. */
export function relativeTime(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60_000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 60 * 24) return `${Math.floor(diffMinutes / 60)}h ago`;
  if (diffMinutes < 60 * 24 * 7) return `${Math.floor(diffMinutes / (60 * 24))}d ago`;
  return formatDate(value);
}

/** `<input type="date">` needs `yyyy-MM-dd`; the API sends full ISO strings. */
export function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function isOverdue(dueDate: string | null | undefined, status: string): boolean {
  if (!dueDate || status === 'DONE' || status === 'CANCELLED') return false;
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}

/** Short human code for a task, since the backend stores no ticket number. */
export function taskCode(taskId: string): string {
  return `#${taskId.slice(0, 6).toUpperCase()}`;
}

export function clampProgress(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
