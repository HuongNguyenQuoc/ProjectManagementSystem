/**
 * Types mirroring the Express + Prisma backend exactly.
 *
 * Enums come from `prisma/schema.prisma`; every DTO below matches what a
 * controller actually puts in `data` — not what the ORM model looks like.
 */

/* ── Enums (prisma/schema.prisma) ─────────────────────────────────────── */

export const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'BLOCKED'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const PROJECT_TYPES = ['WEB', 'MOBILE_APP', 'DESKTOP', 'API', 'AI', 'OTHER'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_STATUSES = [
  'PLANNING',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_ROLES = ['PROJECT_LEADER', 'MEMBER'] as const;
export type ProjectRole = (typeof PROJECT_ROLES)[number];

export const MEMBER_POSITIONS = [
  'FRONTEND_DEVELOPER',
  'BACKEND_DEVELOPER',
  'BUSINESS_ANALYST',
  'TESTER',
  'UI_UX_DESIGNER',
] as const;
export type MemberPosition = (typeof MEMBER_POSITIONS)[number];

export const TASK_STATUSES = [
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'BLOCKED',
  'DONE',
  'CANCELLED',
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const ISSUE_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const ISSUE_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number];

/* ── Envelope ─────────────────────────────────────────────────────────── */

/** Every controller replies `{ success, message, data }`; errors drop `data`. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/* ── Auth ─────────────────────────────────────────────────────────────── */

/** `registerUser` / `loginUser` strip `password` and return the rest. */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

/* ── Projects ─────────────────────────────────────────────────────────── */

/** `GET /api/projects` → `listProjectsService` */
export interface ProjectListItem {
  id: string;
  name: string;
  projectType: ProjectType;
  leaderName: string | null;
  totalTask: number;
  completedTask: number;
  progress: number;
  startDate: string | null;
  /** The backend renames `endDate` → `deadline` on the list endpoint only. */
  deadline: string | null;
  status: ProjectStatus;
}

/** A row of `members[]` inside `GET /api/projects/:projectId`. */
export interface ProjectMemberDto {
  userId: string;
  fullName: string;
  email: string;
  position: MemberPosition;
  projectRole: ProjectRole;
  joinedAt: string;
}

/** `GET /api/projects/:projectId` → `getProjectDetailService` */
export interface ProjectDetail {
  id: string;
  name: string;
  projectType: ProjectType;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: ProjectStatus;
  totalTask: number;
  completedTask: number;
  progress: number;
  members: ProjectMemberDto[];
}

/** `POST /api/projects` — `position` is the *creator's* position on the team. */
export interface CreateProjectInput {
  name: string;
  position: MemberPosition;
  projectType: ProjectType;
  description?: string;
  startDate?: string;
  endDate?: string;
}

/** `PATCH /api/projects/:projectId` — leader only, every field optional. */
export interface UpdateProjectInput {
  name?: string;
  description?: string;
  projectType?: ProjectType;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
}

export interface AddMemberInput {
  userId: string;
  position: MemberPosition;
}

/** Raw `project_members` row, as returned by add-member. */
export interface ProjectMemberRow {
  id: string;
  projectId: string;
  userId: string;
  projectRole: ProjectRole;
  position: MemberPosition;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Tasks ────────────────────────────────────────────────────────────── */

/** `GET /api/projects/:projectId/tasks` → `listTasksByProjectService` */
export interface TaskListItem {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  assigneeId: string | null;
  assigneeName: string | null;
  startDate: string | null;
  dueDate: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Raw `tasks` row — what create/update return (Prisma passthrough). */
export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  projectId: string;
  createdBy: string;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string;
  startDate?: string;
  dueDate?: string;
}

/**
 * `PATCH /api/projects/:projectId/tasks/:taskId`.
 * A MEMBER may only move `progress`, and only on a task assigned to them —
 * the service silently drops `status` / `startDate` / `dueDate` for members.
 */
export interface UpdateTaskInput {
  status?: TaskStatus;
  progress?: number;
  startDate?: string;
  dueDate?: string;
}

/* ── Issues ───────────────────────────────────────────────────────────── */

/** `GET /api/projects/:projectId/issues` → `listIssuesByProjectService` */
export interface IssueListItem {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  taskId: string | null;
  taskTitle: string | null;
  reporterName: string;
  assigneeName: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  severity?: IssueSeverity;
  taskId?: string;
}

/** `PATCH .../issues/:issueId` — leader only. */
export interface UpdateIssueInput {
  status?: IssueStatus;
  severity?: IssueSeverity;
  assignedTo?: string;
}

/* ── Comments ─────────────────────────────────────────────────────────── */

/** `GET .../tasks/:taskId/comments` → `listCommentsByTaskService` */
export interface CommentDto {
  id: string;
  content: string;
  authorName: string;
  authorId: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ── Dashboard ────────────────────────────────────────────────────────── */

/** `GET /api/projects/:projectId/dashboard` — leader only. */
export interface DashboardDto {
  projectId: string;
  projectName: string;
  status: ProjectStatus;
  totalMembers: number;
  totalTasks: number;
  completedTasks: number;
  /** Two decimals, e.g. `41.67`. */
  progress: number;
  overdueTasks: number;
  /** `countBy` only emits keys that occur — treat missing keys as 0. */
  tasksByStatus: Partial<Record<TaskStatus, number>>;
  issuesByStatus: Partial<Record<IssueStatus, number>>;
  tasksByPriority: Partial<Record<TaskPriority, number>>;
  issuesBySeverity: Partial<Record<IssueSeverity, number>>;
  totalIssues: number;
  openIssues: number;
}
