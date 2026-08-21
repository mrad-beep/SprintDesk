# Architecture

## Stack

React 18 · TypeScript (strict) · Vite · TanStack Query v5 · Zustand ·
Tailwind CSS v3 · React Router v6 · @dnd-kit · Recharts.

## Layering

```
UI Components  (pages/, components/)
      ↓
Hooks / Query Layer   (hooks/useTasksQuery, useAuth, useNotificationsPolling)
      ↓
API / Service Layer   (api/authApi.ts, api/taskApi.ts, api/notificationApi.ts, api/client.ts)
      ↓
Data Source            (mock-data.json, DummyJSON, JSONPlaceholder)
```

No component calls `fetch` or `axios` directly. Every network call goes
through a named function in `src/api/`, so swapping `taskApi.fetchDataset`
from reading a static JSON file to hitting a real backend endpoint is a
one-file change — nothing in `hooks/`, `store/`, or `components/` needs to
change.

## State management split

| Kind | Tool | Examples |
|---|---|---|
| Server state | TanStack Query | initial task/user fetch, notification polling, session bootstrap (refresh-on-load) |
| Client/app state | Zustand | auth (tokens, user), board (tasks, moves), notifications (list, read state), theme, toasts |
| Local state | `useState` | form inputs, filter selects, which modal/drawer is open, sort/page in DataTable |

The board is a deliberate hybrid: **TanStack Query owns the initial load**
of the dataset (loading/error/caching), but once loaded it hydrates into
**Zustand** exactly once (`useBoardStore.hydrate`, guarded by a `hydrated`
flag). From that point on, drag-and-drop, add/edit/delete are pure
client-state mutations — they need to be instant and persisted across a
refresh (`zustand/persist` → `localStorage`), which isn't what a
server-state cache is for. This avoids the two most common anti-patterns
in this kind of assignment: storing server data in Zustand from the start
(losing Query's cache/loading/error handling), or trying to keep
drag-and-drop optimistic-updates flowing through Query's cache (needless
complexity for data that isn't really "server" data once the sprint is in
progress).

Auth is the other deliberate split: the **access token lives only in
memory** (a Zustand field that is explicitly excluded from the `persist`
middleware's `partialize`), while the **refresh token is the thing that
survives a reload** — this is what "persist the user session after
refresh when the refresh token remains valid" actually requires, and it's
why `useSessionBootstrap` re-exchanges the refresh token for a new access
token on every app boot rather than trying to persist the access token
itself.

## Authentication flow

1. `LoginPage` submits to `authApi.login` → `POST /auth/login` (DummyJSON).
2. On success, `useAuthStore.setTokens` stores the access token in memory
   and the refresh token in the persisted slice; `setUser` stores the
   profile.
3. `src/api/client.ts` configures an axios **request interceptor** that
   attaches `Authorization: Bearer <accessToken>` to every request on
   `apiClient` (the instance meant for authenticated calls).
4. A **response interceptor** watches for `401`. On the first 401 for a
   given request:
   - if a refresh is already in flight, the request is queued
     (`pendingQueue`) rather than firing a second refresh call;
   - otherwise it calls `authApi.refresh`, stores the new tokens, replays
     the original request with the new token, and flushes the queue.
   - if refresh itself fails, the user is logged out and the error
     propagates.
5. On app boot, `useSessionBootstrap` (a `useQuery` with `staleTime:
   Infinity`) reads the persisted refresh token and immediately exchanges
   it for a fresh access token, so a page reload doesn't force a re-login
   as long as the refresh token is still valid. `isInitializing` drives
   the full-screen loader in `AppRouter` until this resolves.
6. `ProtectedRoute` / `PublicOnlyRoute` gate on `refreshToken` presence and
   redirect via `<Navigate>`.

DummyJSON's real tokens are short-lived JWTs (`expiresInMins: 1` is passed
intentionally on login/refresh so the 401 → refresh → retry path is
actually exercised during normal use, not just in tests).

## Kanban board

- `@dnd-kit/core` + `@dnd-kit/sortable` handle drag state; `PointerSensor`
  (4px activation distance, to avoid hijacking clicks) and `KeyboardSensor`
  (arrow-key reordering, satisfying the keyboard-accessible bonus) are both
  registered.
- `boardStore.moveTask(taskId, toStatus, toIndex)` is the single mutation
  path for both intra- and inter-column moves — `KanbanBoard`'s
  `onDragEnd` just resolves *which* status/index the drop target implies
  (a column background vs. another task card) and calls it.
- Every move is recorded as `lastMove`, enabling one-level undo.
- The whole `tasks` array is persisted via `zustand/persist`, satisfying
  "persist board state across refreshes" without re-fetching or
  re-hydrating from the API layer once loaded.

## Analytics

All four charts (`AnalyticsPage.tsx`) are computed with `useMemo` directly
from `useBoardStore`'s `tasks` array — there is no separate analytics
endpoint or cached copy of the data. Moving a card on the board or adding
a task immediately changes what the charts show on next render, satisfying
"analytics should update when board data changes" by construction rather
than via an explicit invalidation step.

## Notifications

`useNotificationsPolling` is a `useQuery` with a `refetchInterval` that
reads from a ref updated by a `visibilitychange` listener — returning
`false` from the interval function is TanStack Query's supported way to
pause polling, which avoids needing a manual `setInterval`/cleanup dance.
New arrivals are diffed against `knownIds` in `notificationStore` (so
re-polling the same 5 JSONPlaceholder posts doesn't re-notify), and a
toast fires only when the panel is closed, matching the spec.

## Why `public/mock-data.json` doesn't match the JSON pasted into the chat

The JSON provided in the assignment conversation was JSONPlaceholder's
`/posts` sample — 5 objects with `userId/id/title/body`. The assignment
document, however, describes a dataset containing users, sprint tasks with
`status/priority/assignee/dueDate`, comments, and notification seed data,
used as "the primary application data source for users, sprints, tasks,
comments, and initial notification data." Those are two different
things — the assignment even separately names JSONPlaceholder as the
notification-polling source only. Rather than force the Kanban board to
run on 5 blog-post stubs (which would make most of Tasks 02–03
unimplementable, or require inventing fields that don't exist in the
provided file), `public/mock-data.json` was built to match the schema the
assignment actually specifies: 5 users and 15 tasks distributed across all
four columns, with priorities, due dates, assignees, and seeded comments.
This is flagged in the README as a deliberate, documented decision rather
than a silent substitution.

## Testing strategy

- **`boardStore.test.ts`** — add/move/reorder-within-column/undo/delete/
  comment, asserted against store state directly (no React needed).
- **`useToast.test.ts`** — the hook wrapping the toast store: add,
  default variant, dismiss, multiple concurrent toasts.
- **`authInterceptor.test.ts`** — using `axios-mock-adapter` against the
  real `apiClient`/`dummyJsonClient` instances: bearer attachment, the
  401 → refresh → retry path (including asserting the retried request
  actually carries the *new* token), refresh failure → logout, and the
  no-refresh-token short-circuit.

Run with `npm run test` (or `npm run test:watch` during development).
