# Momentum Full-Stack Audit Report

## Architecture Map

```
FRONTEND (React 18 + Vite + TailwindCSS v4 + Zustand + React Query + Recharts)
  ↓
ROUTER (react-router-dom v6 — BrowserRouter)
  ↓
PAGES (8 pages: Dashboard, Today, Tasks, Projects, Planner, Analytics, Login, Register)
  ↓
API CLIENT (Axios via /api → Nginx proxy → Express backend)
  ↓
BACKEND ROUTES (Express Router — 8 modules: auth, tasks, projects, dashboard, focus, planner, analytics, notifications)
  ↓
CONTROLLERS (8 controllers)
  ↓
SERVICES (QuickCapture parser, AIBreakdown, MomentumService, RecommendationService, AuthService)
  ↓
PRISMA ORM
  ↓
POSTGRESQL 17
```

---

## CRITICAL BUGS FOUND & FIXES

### BUG 1: 🔴 Login API Response Contract Mismatch
**Severity:** P0 — Login is completely broken

**Frontend expects** (LoginPage.tsx:23):
```js
res.data.data.tokens.accessToken
```

**Backend returns** (auth.service.ts:160):
```js
{ user: {...}, accessToken: "...", refreshToken: "..." }
```

The backend returns `accessToken` and `refreshToken` as **top-level** fields next to `user`. The frontend expects them nested under a `tokens` object.

**Same bug exists in RegisterPage.tsx:24.**

**Fix:** Update frontend to read `res.data.data.accessToken` instead of `res.data.data.tokens.accessToken`.

---

### BUG 2: 🔴 Tasks API Response Contract Mismatch
**Severity:** P0 — Tasks page shows empty list even when tasks exist

**Frontend expects** (TasksPage.tsx:33, TodayPage.tsx:18, PlannerPage.tsx:23):
```js
res.data.data  // expects array of tasks
```

**Backend returns** (tasks.controller.ts:54):
```js
{ tasks: [...], pagination: { page, limit, total, totalPages } }
```

The backend wraps tasks in an object with `tasks` and `pagination` keys. Frontend expects a flat array at `res.data.data`.

**Fix:** Update frontend to read `res.data.data.tasks` instead of `res.data.data`.

---

### BUG 3: 🟡 /focus route renders DashboardPage instead of dedicated Focus page
**Severity:** P1 — Focus route exists in sidebar but shows wrong content

**Router** (App.tsx:36):
```jsx
<Route path="/focus" element={<DashboardPage />} />
```

The `/focus` route renders `DashboardPage` instead of a Focus page. There is no `FocusPage.tsx`. However, the Focus Mode experience lives entirely in `FocusOverlayModal.tsx` (a fullscreen overlay triggered by `useFocusStore.startFocus()`). The `/focus` sidebar link should trigger the focus overlay, not navigate to a page.

**Fix:** Create a `FocusPage.tsx` that shows focus session history (GET /api/focus/history) and allows starting new sessions.

---

### BUG 4: 🟡 AppLayout has no auth guard — protected routes accessible without login
**Severity:** P1 — No redirect to /login for unauthenticated users

**Current behavior:** `AppLayout.tsx` renders sidebar + outlet for all users, regardless of auth state. There is no `Navigate to="/login"` guard. The `fetchMe` in `App.tsx` sets loading state but never redirects.

**Fix:** Add auth guard to AppLayout that redirects to /login when not authenticated.

---

### BUG 5: 🟡 Logout doesn't redirect to login
**Severity:** P1

**Current behavior:** `useAuthStore.logout()` clears token and state but does NOT navigate to `/login`. User remains on the current page with a broken sidebar (no user info).

**Fix:** Need to trigger navigation to `/login` after logout.

---

## COMPLETE API ROUTE INVENTORY

| Method | Path | Auth | Controller | Frontend Used? | Status |
|--------|------|------|-----------|---------------|--------|
| POST | /api/auth/register | No | auth.register | ✅ RegisterPage | 🔴 Response contract mismatch |
| POST | /api/auth/login | No | auth.login | ✅ LoginPage | 🔴 Response contract mismatch |
| POST | /api/auth/refresh | No | auth.refresh | ❌ Not used | ✅ Works |
| POST | /api/auth/logout | No | auth.logout | ❌ Not called by frontend | ⚠️ Frontend only clears localStorage |
| GET | /api/auth/me | Yes | auth.me | ✅ useAuthStore.fetchMe | ✅ Fixed (was using wrong middleware) |
| GET | /api/tasks | Yes | tasks.getTasks | ✅ TasksPage, TodayPage, PlannerPage | 🔴 Response shape mismatch |
| POST | /api/tasks | Yes | tasks.createTask | ❌ Not directly used | ✅ Works |
| POST | /api/tasks/quick | Yes | tasks.quickCaptureTask | ✅ QuickTaskInputModal | ✅ Works |
| GET | /api/tasks/:id | Yes | tasks.getTaskById | ✅ TasksPage (AI breakdown) | ✅ Works |
| PATCH | /api/tasks/:id | Yes | tasks.updateTask | ✅ Multiple pages | ✅ Works |
| DELETE | /api/tasks/:id | Yes | tasks.deleteTask | ✅ TasksPage | ✅ Works |
| POST | /api/tasks/:id/breakdown | Yes | tasks.aiBreakdownTask | ✅ TasksPage | ✅ Works |
| GET | /api/projects | Yes | projects.getProjects | ✅ ProjectsPage | ✅ Works |
| POST | /api/projects | Yes | projects.createProject | ✅ ProjectsPage | ✅ Works |
| GET | /api/projects/:id | Yes | projects.getProjectById | ❌ Not used | ✅ Works |
| PATCH | /api/projects/:id | Yes | projects.updateProject | ❌ Not used | ✅ Works |
| DELETE | /api/projects/:id | Yes | projects.deleteProject | ❌ Not used | ✅ Works |
| GET | /api/dashboard | Yes | dashboard.getDashboardSummary | ✅ DashboardPage | ✅ Works |
| POST | /api/focus/session | Yes | focus.logFocusSession | ✅ FocusOverlayModal | ✅ Works |
| GET | /api/focus/history | Yes | focus.getFocusHistory | ❌ Not used by any page | ✅ Works |
| GET | /api/planner/plan | Yes | planner.getDailyPlan | ✅ PlannerPage | ✅ Works |
| PUT | /api/planner/plan | Yes | planner.updateDailyPlan | ❌ Not used | ✅ Works |
| POST | /api/planner/review | Yes | planner.submitDailyReview | ✅ PlannerPage | ✅ Works |
| GET | /api/analytics | Yes | analytics.getAnalytics | ✅ AnalyticsPage | ✅ Works |
| GET | /api/notifications | Yes | notifications.getNotifications | ✅ TopNav | ✅ Works |
| PATCH | /api/notifications/:id/read | Yes | notifications.markNotificationRead | ✅ TopNav | ✅ Works |
| GET | /api/notifications/tags | Yes | notifications.getTags | ❌ Not used | ✅ Works |
| GET | /api/health | No | inline | ❌ Not used by frontend | ✅ Works |

---

## FIXES TO APPLY

1. **LoginPage.tsx** — Fix response contract: `data.accessToken` not `data.tokens.accessToken`
2. **RegisterPage.tsx** — Same fix as LoginPage
3. **TasksPage.tsx** — Read `res.data.data.tasks` not `res.data.data`
4. **TodayPage.tsx** — Same fix
5. **PlannerPage.tsx** — Same fix
6. **App.tsx** — Add auth guard, create FocusPage for /focus route
7. **AppLayout.tsx** — Add auth redirect when not authenticated
8. **Sidebar.tsx** — Make logout navigate to /login
9. **useAuthStore.ts** — Fix logout to navigate

---

## PHASE 2 — ADDITIONAL BUGS FOUND & FIXED

All original 9 fixes above: ✅ Applied

| # | File | Fix | Status |
|---|------|-----|--------|
| 6 | `CommandPalette.tsx` | Read `data.data.tasks` not `data.data` | ✅ Fixed |
| 7 | `CommandPalette.tsx` | Navigate to `/projects` not `/projects/:id` | ✅ Fixed |
| 8 | `auth.controller.ts` | Cast `req` to `AuthenticatedRequest` in `me()` | ✅ Fixed |
| 9 | `useAuthStore.ts` | Remove dashboard fallback; rely on auth guard | ✅ Fixed |
| 10 | `auth.service.ts` | Return `xp`, `level`, `streak`, `timezone`, `avatar` from `getMe` | ✅ Fixed |
| 11 | `auth.service.ts` | Return full user profile from register/login/refresh | ✅ Fixed |
| 12 | `AppLayout.tsx` | `onTaskCreated` callback not wired | ⚠️ Known P3 limitation |
| 13 | `TopNav.tsx` | Click-outside handler on notification dropdown | ✅ Fixed |

