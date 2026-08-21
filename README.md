# SprintDesk — Sprint Management Dashboard

A single-page sprint management application built with React 18, TypeScript
(strict mode), Vite, TanStack Query v5, Zustand, Tailwind CSS, React Router
v6, @dnd-kit, and Recharts.

## Demo credentials

DummyJSON's test account, used for the live auth flow:

- Username: `emilys`
- Password: `emilyspass`

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
npm run test      # unit tests (Vitest + React Testing Library)
```

No environment variables are required — all API base URLs
(`dummyjson.com`, `jsonplaceholder.typicode.com`) are public and hardcoded
in the API layer (`src/api/`).

## What's implemented

- **Auth** — DummyJSON login, in-memory access token, persisted refresh
  token, axios interceptor with automatic Bearer attachment, silent
  refresh + request retry on 401, protected/public-only routes, full-screen
  loading state during session bootstrap, logout, Remember Me (30-day
  simulated persistence), password strength indicator.
- **Kanban board** — four columns, drag-and-drop reordering within and
  across columns via `@dnd-kit`, keyboard-accessible dragging
  (`KeyboardSensor`), persisted board state (Zustand `persist`), task
  drawer with editable fields and comments, add/delete with confirmation,
  priority/assignee filtering, undo-last-move.
- **Analytics** — velocity, status distribution, priority breakdown, and
  completion trend, all derived live from board state via Recharts,
  responsive down to 375px.
- **Component library** — Button, Input, Select, Modal (focus trap, Escape
  to close, focus restore), Toast (queued, auto-dismiss, `aria-live`),
  DataTable (sortable, paginated), Skeleton.
- **Notifications** — polls JSONPlaceholder every 15s, diffs against known
  IDs, unread badge, paginated list (20/page), mark-as-read / mark-all,
  persisted via Zustand, pauses on `visibilitychange`, toast on new arrivals
  while the panel is closed.
- **Performance/testing** — route-level code splitting (`React.lazy` +
  `Suspense`), `React.memo`/`useMemo` in list-heavy views, 14 passing unit
  tests covering `useToast`, the board store (add/move/reorder/undo/delete/
  comment), and the auth interceptor (attach token, refresh-and-retry,
  refresh failure → logout, no-refresh-token path) via `axios-mock-adapter`.

## Known limitations / what I'd improve with more time

Documenting these per the assignment's own guidance rather than leaving
them silently unfinished:

- **Lighthouse scores were not run in this environment** (no headless
  Chrome available here). The build is optimized for it — code splitting,
  memoization, no unused deps — but the 88/92 thresholds haven't been
  measured against a real Lighthouse run. Run `npx lighthouse <deployed-url>
  --view` after deploying and tune from there.
- **No live deployment or screen recording** — those need to happen from
  your machine/accounts, not mine. The app runs immediately with `npm run
  dev` and builds cleanly with `npm run build`.
- **The `mock-data.json` provided in the assignment email** was actually
  JSONPlaceholder's `/posts` sample (5 blog-style posts), not task data —
  it doesn't match the Kanban schema the board needs. I built a
  `public/mock-data.json` with the schema the assignment actually
  describes (users, tasks with priority/assignee/dueDate/comments) — see
  `ARCHITECTURE.md` for the reasoning. JSONPlaceholder itself is still used
  exactly as specified, for notification polling only.
- **Storybook and axe-core** (both explicitly optional bonuses) are not
  included.
- **Export analytics as PNG and custom date-range filtering** (optional
  bonuses) are not included.
- Comment authorship in the task drawer is hardcoded to "You" — there's no
  multi-user simulation beyond the seeded mock comments.

## Repository layout

```
src/
  api/          service/data-access layer (axios client, auth, tasks, notifications)
  types/        shared TypeScript types
  store/        Zustand stores (auth, board, notifications, theme, toast)
  hooks/        TanStack Query hooks + thin store hooks (useAuth, useTasksQuery, useToast...)
  components/
    ui/         reusable design-system components (Button, Input, Select, Modal, Toast, DataTable, Skeleton)
    board/      Kanban board (Column, TaskCard, TaskDrawer, AddTaskModal, KanbanBoard)
    layout/     Navbar, route guards, full-screen loader, app shell
    notifications/  NotificationBell
  pages/        route-level pages (Login, Dashboard, Board, Analytics)
  routes/       AppRouter (lazy-loaded routes, guards)
  test/         Vitest unit tests
public/
  mock-data.json   seed dataset for users + tasks
```

See `ARCHITECTURE.md` for the full data-flow explanation and `API.md` for
endpoint documentation.
