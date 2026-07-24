# Handoff: ProjectHub — Project Management System UI

## Overview
ProjectHub is the front-end for a Project Management System (projects, tasks, issues, comments) with **role-based access** for two roles: **Project Leader** and **Member**. It covers authentication, a leader dashboard with charts, project list + create/edit, a project detail view with a drag-and-drop Kanban board (and table view), a task drawer with progress + comments, issue management, member management, and a member-only "My Tasks" view.

The design is built to sit on top of an **existing Express + Prisma + PostgreSQL backend** (repo: `HuongNguyenQuoc/ProjectManagementSystem`). Endpoints, enums, and permission rules below are taken directly from that backend.

## About the Design Files
The file in this bundle — `ProjectHub.dc.html` — is a **design reference created in HTML**. It is a working prototype showing the intended look and behavior, **not production code to copy directly**. The task is to **recreate this UI in a real front-end codebase** (recommended: React + Vite + TypeScript, or Next.js), wired to the existing REST API, using the codebase's established patterns.

The prototype uses in-memory mock data and a small custom template runtime — ignore that plumbing. What matters is the layout, tokens, components, interactions, and the data model it renders.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, shadows, and interactions are all specified via the Nocturne design system. Recreate the UI pixel-perfectly, pulling every value from the design tokens below. Reproduce the Nocturne token set as CSS variables (or a theme object) in the target codebase.

---

## Backend it connects to
Base URL: `/api`. Auth via JWT in an httpOnly cookie (login sets it). Send credentials on every request.

Enums (from Prisma schema):
- `user_status`: ACTIVE, INACTIVE, BLOCKED
- `project_type`: WEB, MOBILE_APP, DESKTOP, API, AI, OTHER
- `project_status`: PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED
- `project_role`: PROJECT_LEADER, MEMBER
- `member_position`: FRONTEND_DEVELOPER, BACKEND_DEVELOPER, BUSINESS_ANALYST, TESTER, UI_UX_DESIGNER
- `task_status`: TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, DONE, CANCELLED
- `task_priority`: LOW, MEDIUM, HIGH, URGENT
- `issue_status`: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- `issue_severity`: LOW, MEDIUM, HIGH, CRITICAL

Endpoints (confirmed in the backend):
- `POST /api/auth/register` — { fullName, email, password }
- `POST /api/auth/login` — { email, password } → sets JWT cookie, returns { user, token }
- `GET /api/projects` — list with stats (name, projectType, leaderName, totalTask, completedTask, progress, startDate, deadline, status)
- `POST /api/projects` — create { name, position, projectType, description?, startDate?, endDate? } (creator becomes PROJECT_LEADER)
- `GET /api/projects/:id` — detail incl. members (members only)
- `PATCH /api/projects/:id` — update (leader only)
- `POST /api/projects/:id/members` — add member { userId, position } (leader only)
- `DELETE /api/projects/:id/members/:userId` — remove member (leader only, not the leader)
- `GET /api/projects/:id/tasks` — list tasks (members)
- `POST /api/projects/:id/tasks` — create task (leader only) { title, description?, priority?, assigneeId?, startDate?, dueDate? }
- `PATCH .../tasks/:taskId` — update; **members may only set `progress` on their assigned tasks; leader may set status/dates too**
- `GET/POST .../tasks/:taskId/comments`
- `GET/POST .../issues`, `PATCH .../issues/:id` (status/severity/assignee — leader only)
- `GET .../dashboard` — **leader only**: { totalMembers, totalTasks, completedTasks, progress, overdueTasks, tasksByStatus, issuesByStatus, tasksByPriority, issuesBySeverity, totalIssues, openIssues }

Progress rule: task `progress` is 0–100. Project `progress` is auto-computed = round(DONE tasks / total tasks × 100). Setting a task to DONE stamps `completedAt`.

---

## Permissions (drive UI conditionals)
**Project Leader:** create/edit/manage projects; manage all tasks; assign tasks; update status; adjust dates; track issues; view the dashboard.
**Member:** access only assigned tasks; update task progress; comment; report issues; view related project info. No dashboard, no create-project/create-task/edit buttons, no status controls.

In the prototype the top-bar segmented control toggles role live — in production, role comes from the user's `project_role` per project.

---

## Screens / Views

### 1. Auth (login / register)
- **Layout:** full-height 2-column grid `1.05fr / 0.95fr`. Left = brand panel with a diagonal gradient (`--color-section` → `--color-bg`), logo, headline, 3 stats. Right = centered form column, max-width 400px.
- **Components:** logo mark (34px rounded-9px accent square, white glyph). H1 44px/1.08. Fields use `.field`+`.input`. Register mode adds a "Full name" field above Email. A `.seg` role picker (Leader / Member). Primary CTA `.btn.btn-primary.btn-block` height 42px. Footer link toggles login/register.
- **Behavior:** submit → authenticated app, land on Dashboard (Leader) or My Tasks (Member).

### 2. App shell
- **Sidebar** 236px, sticky full height, `border-right: 1px var(--color-divider)`. Logo, nav list, user block at bottom (avatar initials, name, role label, sign-out icon button).
  - Leader nav: Dashboard, Projects (badge = count), Board, Issues, Members.
  - Member nav: My Tasks, Projects.
  - Active item: `background: color-mix(accent 15%)`, text `--color-accent-200`.
- **Top bar** 60px, sticky, `backdrop-filter: blur(10px)`, bottom divider. Page title + subtitle (left), search box (220px), role segmented control (right).
- **Content** scroll area, padding 28px 30px 60px.

### 3. Dashboard (Leader only)
- Project selector (`.input` select) + status tag.
- **Stat cards** — 4-col grid, gap 14px. Each `.card` with label, icon chip (30px rounded-8px), 32px value, colored sub-line. Cards: Total tasks, In progress, Overdue, Open issues.
- **Progress ring** — SVG donut r=52, stroke 12px, track `--color-neutral-800`, arc `--color-accent`, rounded cap, animated `stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)`; center % (30px heading) + "complete".
- **Tasks by status** — vertical bar chart (5 bars), colors per status; bars animate height .7s; value labels above.
- **Tasks by priority** / **Issues by severity** — horizontal bars, right-aligned label 78px, track 20px tall, animate width .7s.
- **Timeline (Gantt)** — task rows; left label column 150px; bars positioned by start/due across the min→max date span; inner fill = progress, colored by status; month ticks along the top.

### 4. Projects
- View toggle `.seg` (Cards / Table), project count, "New project" button (leader).
- **Cards:** 3-col grid. Each card = type icon chip (38px), status tag, name (16px heading), type label, `done/total tasks` + `%`, 6px progress bar (accent gradient, animate width .5s), footer with leader avatar+name and deadline.
- **Table:** `.table` columns Project / Type / Leader / Tasks / Progress (inline bar) / Deadline / Status. Rows clickable.

### 5. Project detail
- Back link, 52px type icon, name (26px) + status tag, description. Leader sees Edit + Add task buttons.
- **Tabs** (underline style): Board, Issues (count), Members (count). Board tab shows a Board/List `.seg` on the right.
- **Kanban board:** 5 columns (To Do, In Progress, In Review, Blocked, Done) as `--color-surface` rounded-12px panels. Column header = status dot + label + count pill. Cards are `--color-bg`, rounded-9px, `border-left: 3px` priority color, draggable. Card = code + priority tag, title, 5px progress bar, due date + assignee avatar.
  - **Drag & drop:** HTML5 dnd. On dragover a column shows `background: accent 9%` + `inset 0 0 0 1.5px accent`. On drop, task's status changes to that column (→ DONE sets progress 100).
- **Board list view:** `.table` — Task (title+code) / Assignee / Priority / Status (dot) / Progress / Due.
- **Issues tab:** count + "Report issue" button; `.table` — Issue (title+desc) / Related task / Severity / Status (dot) / Reporter / Assignee.
- **Members tab:** count + "Add member" (leader); 3-col cards — avatar (44px), name (+ crown for leader), position label, email, task-count tag.

### 6. Task drawer (right slide-over, 480px)
- Backdrop `color-mix(neutral-900 55%)` fade .2s; panel slides in from right `.32s cubic-bezier(.22,1,.36,1)`.
- Header: code · project, title (19px), close icon button.
- Priority tag + status pill. Description paragraph. Assignee + Due date grid.
- **Progress:** `<input type=range>` 0–100 step 5, `accent-color: --color-accent`; updates live (100 → status DONE).
- **Status** (leader only): pill buttons for all statuses, active = accent border + tint.
- **Comments:** list (avatar, author, time, text), textarea + send button; adds a comment as the current user.

### 7. My Tasks (Member)
- 3 stat cards (Assigned / In progress / Done). List of assigned tasks: priority left-border card, title + priority tag, project · due, mini progress (130px), caret. Click opens the task drawer.

### Modals (dialog)
`.dialog-backdrop` + `.dialog` (max 520px), scale-in `.28s`. Four forms: **New/Edit project** (name, type, status, description, start/end dates), **Add task** (title, description, priority, assignee, due), **Report issue** (title, description, severity), **Add member** (person select, position). Success → toast (bottom-center, auto-dismiss 2.6s).

---

## Interactions & Behavior
- **Navigation:** client-side screen switching; sidebar Issues/Members deep-link into the active project's tabs.
- **Role switch:** changes nav, available actions, default screen, and the "current user".
- **Drag & drop:** dragstart sets opacity .4; column highlight on dragover; drop reassigns status.
- **Progress slider:** live update; reaching 100% flips to DONE, dropping below 100 from DONE flips to IN_PROGRESS.
- **Animations (all `cubic-bezier(.22,1,.36,1)` unless noted):** screen enter fadeUp .45s; card hover `translateY(-3px)` .22s; task hover `translateY(-2px)`; ring .8s; bars .7s; progress bars .4–.5s; drawer slide .32s; modal scale .28s; toast keyframed 2.6s.
- **Hover states:** cards lift; table rows tint (from Nocturne `.table`); nav/buttons use the accent ramp (built into the design system).

## State Management
Per authenticated session: `user`, `role` (per project). Per screen: `activeProjectId`, `projectTab` (board/issues/members), `boardView` (kanban/table), `projView` (grid/table), `taskOpenId`, open modal, form draft, comment draft, drag id, toast.
Data: projects, project members, tasks (with assignee), issues, comments — fetch from the API. Task/project progress is server-derived; re-fetch or optimistically update after mutations.

## Design Tokens (Nocturne)
Ground `--color-bg #161826`; surface `--color-surface #232532`; text `--color-text #e9e9ed`; accent `--color-accent #9184d9`; divider = `color-mix(srgb, #e9e9ed 16%, transparent)`.
Neutral ramp 100→900: `#f3f5fe #e4e7f5 #cfd3e5 #b2b6ca #9397ab #75798c #595d6c #3f424d #292b31`.
Accent ramp 100→900: `#f5f4ff #e7e5fe #d2cefd #b5abfc #968ae0 #796cbf #5d5294 #423a6a #2b2741`.
Section (dividers/hero): `#262a60` / glow `#353b80` / ghost `#4c5397`.
Semantic (OKLCH, harmonized to the accent's lightness — used for status/priority/severity): success/DONE `oklch(.72 .13 150)`, warning/HIGH `oklch(.76 .13 75)`, danger/URGENT/BLOCKED `oklch(.66 .13 25)`.
Type: Inter (headings weight 500, body 400). H1 42 / H2 32 / H3 25 / H4 20; base 15px/1.55. Never bolden headings past 500.
Spacing (0.70× density): 2.8 / 5.6 / 8.4 / 11.2 / 16.8 / 22.4 px. Radius: sm 4 / md 8 / lg 14. Shadows: sm `0 0 0 1px #3f424d`; md `0 0 0 1px #595d6c, 0 6px 18px rgba(0,0,0,.55)`; lg `0 0 0 1px #9397ab, 0 16px 40px rgba(0,0,0,.65)`.
Icons: **Phosphor** (https://phosphoricons.com) — regular/bold/fill weights. Used across nav, buttons, cards.

Full source of truth: `_ds/nocturne-<id>/styles.css` (included in the full-project download).

## Assets
No image assets — all iconography is Phosphor (icon font / SVG). Avatars are text initials on ramp-tinted circles. Load the Nocturne `styles.css` tokens; load Phosphor from `@phosphor-icons/web`.

## Files
- `ProjectHub.dc.html` — the complete prototype (all screens, logic, mock data). Open it in a browser to see every screen and interaction.
- `_ds/nocturne-<id>/styles.css` — Nocturne tokens + component classes (in the full-project zip).
- Backend reference: `HuongNguyenQuoc/ProjectManagementSystem` (Express + Prisma).
