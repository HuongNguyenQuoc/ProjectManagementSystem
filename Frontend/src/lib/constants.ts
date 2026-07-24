import type { CSSProperties } from 'react';
import type { Icon } from '@phosphor-icons/react';
import {
  Brain,
  Cube,
  DesktopTower,
  DeviceMobile,
  Globe,
  PlugsConnected,
} from '@phosphor-icons/react';
import type {
  IssueSeverity,
  IssueStatus,
  MemberPosition,
  ProjectStatus,
  ProjectType,
  TaskPriority,
  TaskStatus,
} from '@/types/api';

/* ── Tag recipes ──────────────────────────────────────────────────────── */

const tagNeutral: CSSProperties = {
  background: 'var(--color-neutral-800)',
  color: 'var(--color-neutral-100)',
};
const tagAccent: CSSProperties = {
  background: 'var(--color-accent-800)',
  color: 'var(--color-accent-100)',
};
const tagAccent2: CSSProperties = {
  background: 'var(--color-accent-2-800)',
  color: 'var(--color-accent-2-100)',
};
const tagWarning: CSSProperties = {
  background: 'oklch(0.34 0.07 75)',
  color: 'oklch(0.9 0.09 85)',
};
const tagDanger: CSSProperties = {
  background: 'oklch(0.33 0.1 25)',
  color: 'oklch(0.9 0.08 30)',
};
const tagSuccess: CSSProperties = {
  background: 'oklch(0.32 0.08 150)',
  color: 'oklch(0.9 0.1 150)',
};

/* ── Task status ──────────────────────────────────────────────────────── */

export const TASK_STATUS: Record<TaskStatus, { label: string; color: string }> = {
  TODO: { label: 'To Do', color: 'var(--color-neutral-500)' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--color-accent-500)' },
  IN_REVIEW: { label: 'In Review', color: '#a7a1db' },
  BLOCKED: { label: 'Blocked', color: 'var(--color-danger)' },
  DONE: { label: 'Done', color: 'var(--color-success)' },
  CANCELLED: { label: 'Cancelled', color: 'var(--color-neutral-700)' },
};

/** The five swimlanes on the Kanban board; CANCELLED is drawer-only. */
export const BOARD_COLUMNS: TaskStatus[] = [
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'BLOCKED',
  'DONE',
];

/* ── Task priority ────────────────────────────────────────────────────── */

export const TASK_PRIORITY: Record<
  TaskPriority,
  { label: string; color: string; tag: CSSProperties }
> = {
  LOW: { label: 'Low', color: 'var(--color-neutral-500)', tag: tagNeutral },
  MEDIUM: { label: 'Medium', color: '#a7a1db', tag: tagAccent2 },
  HIGH: { label: 'High', color: 'var(--color-warning)', tag: tagWarning },
  URGENT: { label: 'Urgent', color: 'var(--color-danger)', tag: tagDanger },
};

/* ── Issue severity & status ──────────────────────────────────────────── */

export const ISSUE_SEVERITY: Record<
  IssueSeverity,
  { label: string; color: string; tag: CSSProperties }
> = {
  LOW: { label: 'Low', color: 'var(--color-neutral-500)', tag: tagNeutral },
  MEDIUM: { label: 'Medium', color: '#a7a1db', tag: tagAccent2 },
  HIGH: { label: 'High', color: 'var(--color-warning)', tag: tagWarning },
  CRITICAL: { label: 'Critical', color: 'var(--color-danger)', tag: tagDanger },
};

export const ISSUE_STATUS: Record<IssueStatus, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'var(--color-danger)' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--color-accent-500)' },
  RESOLVED: { label: 'Resolved', color: 'var(--color-success)' },
  CLOSED: { label: 'Closed', color: 'var(--color-neutral-600)' },
};

/* ── Project status & type ────────────────────────────────────────────── */

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; tag: CSSProperties }> = {
  PLANNING: { label: 'Planning', tag: tagNeutral },
  IN_PROGRESS: { label: 'In Progress', tag: tagAccent },
  ON_HOLD: { label: 'On Hold', tag: tagWarning },
  COMPLETED: { label: 'Completed', tag: tagSuccess },
  CANCELLED: {
    label: 'Cancelled',
    tag: { background: 'var(--color-neutral-900)', color: 'var(--color-neutral-400)' },
  },
};

export const PROJECT_TYPE: Record<ProjectType, { label: string; icon: Icon }> = {
  WEB: { label: 'Web', icon: Globe },
  MOBILE_APP: { label: 'Mobile App', icon: DeviceMobile },
  DESKTOP: { label: 'Desktop', icon: DesktopTower },
  API: { label: 'API', icon: PlugsConnected },
  AI: { label: 'AI', icon: Brain },
  OTHER: { label: 'Other', icon: Cube },
};

/* ── Membership ───────────────────────────────────────────────────────── */

export const MEMBER_POSITION: Record<MemberPosition, string> = {
  FRONTEND_DEVELOPER: 'Frontend Developer',
  BACKEND_DEVELOPER: 'Backend Developer',
  BUSINESS_ANALYST: 'Business Analyst',
  TESTER: 'Tester (QA/QC)',
  UI_UX_DESIGNER: 'UI/UX Designer',
};

export const PROJECT_ROLE_LABEL = {
  PROJECT_LEADER: 'Project Leader',
  MEMBER: 'Member',
} as const;

/** Convenience for `<select>` lists built from a label map. */
export function toOptions<K extends string>(
  keys: readonly K[],
  label: (key: K) => string,
): { value: K; label: string }[] {
  return keys.map((key) => ({ value: key, label: label(key) }));
}
