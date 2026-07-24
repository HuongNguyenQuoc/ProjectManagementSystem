# ProjectHub — Frontend

React + TypeScript + Vite client for the Project Management System, wired to the
Express/Prisma backend in the repo root. Recreates the `ProjectHub.dc.html` design
(Nocturne design system) as real, backend-correct screens.

## Stack

- React 19 + React Router 7 (client-side routing)
- TanStack Query 5 (server state, caching, optimistic updates)
- Axios (httpOnly-cookie auth against `/api`)
- Vite + Tailwind's `@tailwindcss/vite` plugin (Tailwind itself isn't used for
  components — the UI is built from the Nocturne design tokens in `src/index.css`)
- Phosphor Icons (`@phosphor-icons/react`)

## Running locally

```bash
npm install
npm run dev       # http://localhost:5173, proxies /api -> http://localhost:3000
```

The backend must be running separately (`npm run dev` from the repo root) with a
reachable Postgres database. Vite's dev server proxies `/api/*` to
`http://localhost:3000` (see `vite.config.ts`), which is required because the
backend sets `sameSite: 'strict'` on its JWT cookie.

```bash
npm run build      # tsc -b && vite build
npm run lint        # eslint .
```

## Structure

```text
src/
  api/          thin fetch wrappers, one file per backend resource
  components/
    ui/         design-system primitives (Button, Dialog, Tag, Field, ...)
    charts/     ProgressRing, VerticalBars/HorizontalBars, Gantt
    layout/     Sidebar, Topbar, AppShell, ProtectedRoute
    task/       KanbanBoard, TaskCard, TaskTable, TaskDrawer
    project/    IssuesTable, MembersGrid
    modals/     Project/Task/Issue/Member forms
  context/      Auth, ActiveProject, PageHeader, Toast providers
  hooks/        React Query hooks per resource + small UI hooks
  lib/          axios client, query client, formatters, design-system constants
  pages/        one component per route
  types/api.ts  DTOs mirrored 1:1 from the backend services/controllers
```

## Backend fidelity notes

The UI is built strictly against what the Express services actually do, not
just the REST surface — a few things worth knowing if you touch either side:

- **Role is per-project, not per-account.** There's no global "I am a leader"
  flag. `ActiveProjectProvider` resolves the signed-in user's `projectRole`
  from the *active* project's membership list and drives the Sidebar/Topbar
  nav from that. Switching projects can change your role.
- **`GET /api/projects` lists every project**, not just yours — the backend
  has no membership filter on that endpoint. Detail/task/issue endpoints do
  enforce membership (403 otherwise), so `ProjectDetailPage` renders an
  explicit "you're not a member" state rather than assuming access.
- **Task permissions are asymmetric.** Only the project leader can create
  tasks or change `status`/dates; a member can only move `progress` on a task
  assigned to them. The Kanban board disables drag-and-drop for members
  accordingly (`canDragStatus`), and the task drawer's status pills are
  leader-only.
- **`GET /api/users/lookup?email=`** is a small backend addition made
  alongside this UI — the original API had no way to turn an email into a
  `userId` for the "Add member" flow. It's an exact-match lookup only, no
  listing/enumeration, gated behind `requireAuth` like everything else.
- **Task list `progress`/`assigneeId`** were added to `listTasksByProjectService`'s
  mapping for the same reason — the Kanban cards, task drawer, and "My Tasks"
  page all need them and the backend previously only returned `assigneeName`.
- **Project progress and task progress are server-derived.** The client never
  computes a project's percentage locally beyond what `/dashboard` or
  `/projects` already return; mutations just invalidate the relevant queries.
