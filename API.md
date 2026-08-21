# API Documentation

SprintDesk talks to three data sources. All calls are centralized in
`src/api/` — see `ARCHITECTURE.md` for the layering rationale.

---

## 1. DummyJSON — Authentication

Base URL: `https://dummyjson.com`

### `POST /auth/login`

Used by: `authApi.login` (`src/api/authApi.ts`)

**Request body**
```json
{
  "username": "emilys",
  "password": "emilyspass",
  "expiresInMins": 1
}
```

**Response `200`**
```json
{
  "id": 1,
  "username": "emilys",
  "email": "emily.johnson@x.dummyjson.com",
  "firstName": "Emily",
  "lastName": "Johnson",
  "image": "https://dummyjson.com/icon/emilys/128",
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

**Response `400`** — invalid credentials.

`expiresInMins: 1` is intentionally short so the silent-refresh path is
exercised during normal use of the app, not only in the interceptor's unit
tests.

### `POST /auth/refresh`

Used by: `authApi.refresh` (called directly from `useSessionBootstrap` on
app load, and from the response interceptor in `api/client.ts` on a 401).

**Request body**
```json
{ "refreshToken": "<jwt>", "expiresInMins": 1 }
```

**Response `200`** — same shape as login (new `accessToken` +
`refreshToken`).

**Response `403`** — refresh token invalid/expired → the app calls
`useAuthStore.logout()` and redirects to `/login`.

### `GET /auth/me`

Used by: `authApi.me` (available for profile-refresh use cases; not
currently called on a hot path since the login/refresh responses already
carry the full profile).

**Headers**: `Authorization: Bearer <accessToken>`

---

## 2. Sprint dataset (mock, local)

Base: `/mock-data.json` (served from `public/`, same origin — no CORS).

Used by: `taskApi.fetchDataset` (`src/api/taskApi.ts`), consumed via
`useTasksQuery` / `useUsersQuery`.

**Shape**
```ts
{
  users: { id: number; name: string; avatar: string }[];
  tasks: {
    id: number;
    title: string;
    description: string;
    status: "backlog" | "in_progress" | "review" | "done";
    priority: "low" | "medium" | "high";
    assigneeId: number;
    dueDate: string;   // ISO date
    sprint: string;
    createdAt: string; // ISO datetime
    comments: { id: number; author: string; text: string; createdAt: string }[];
  }[]
}
```

`taskApi.fetchDataset` truncates to the first 30 tasks per the assignment
spec (`.slice(0, 30)`), even though the seed file currently ships 15.

This is the layer to change first when pointing SprintDesk at a real
backend — replace the `fetch('/mock-data.json')` call with a real HTTP
call returning the same shape (or adapt the shape at this boundary), and
nothing above `taskApi` needs to change.

---

## 3. JSONPlaceholder — Notification polling

Base URL: `https://jsonplaceholder.typicode.com`

### `GET /posts?_limit=5`

Used by: `notificationApi.fetchLatestPosts` (`src/api/notificationApi.ts`),
polled every 15s by `useNotificationsPolling` while the tab is visible.

**Response `200`**
```json
[
  { "userId": 1, "id": 1, "title": "...", "body": "..." }
]
```

Each post is mapped to an `AppNotification` (`id`, truncated `title` as
the notification title, `body`, `read: false`, `createdAt: <poll time>`).
`notificationStore` diffs incoming IDs against `knownIds` so re-polling
the same 5 posts doesn't re-fire the same notification twice.

---

## Error handling summary

| Source | Failure mode | Handling |
|---|---|---|
| DummyJSON login | 400 | Toast: "Invalid username or password." |
| Any authenticated call | 401 | Interceptor attempts one silent refresh + retry (queued if a refresh is already in flight) |
| DummyJSON refresh | 403 / network error | `logout()` clears state, user redirected to `/login` |
| mock-data.json | fetch not ok | `useTasksQuery` surfaces `isError`; `KanbanBoard`/`DashboardPage` render an inline error message |
| JSONPlaceholder polling | request error | TanStack Query's default retry (1) applies; failures don't interrupt the UI, next interval retries |
