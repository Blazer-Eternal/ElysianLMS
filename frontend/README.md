# ElysianLMS — Frontend

The web client for the ElysianLMS API: a course catalog, a learning player,
a teaching workspace, and an admin console, built on the Next.js App Router.

The backend (`../backend`) is a separate Express + Sequelize + PostgreSQL
service. This app talks to it over REST; nothing here touches the database.

---

## Stack

| Concern            | Choice                                                      |
| ------------------ | ----------------------------------------------------------- |
| Framework          | Next.js 16 (App Router), React 19, TypeScript               |
| Styling            | Tailwind CSS v4 (CSS-first config in `src/app/globals.css`) |
| Server state       | TanStack Query v5 (single query client, stale-while-revalidate) |
| Forms              | react-hook-form + zod (auth flows, password change); plain `FormData` for short inline forms |
| HTTP               | Axios with automatic refresh-token rotation (single-flight) |
| Fonts              | Self-hosted Fontsource: Fraunces (display), Hanken Grotesk (body), IBM Plex Mono (labels/numerals) |
| Linting            | ESLint 10 flat config via `eslint-config-next`              |

## Quick start

```bash
# 1. Backend must be running (default http://localhost:5000)
cd ../backend && npm run dev

# 2. Frontend
cd frontend
cp .env.example .env.local   # only needed if the API is not on localhost:5000
npm install
npm run dev                  # http://localhost:3000
```

### Scripts

| Command         | What it does                          |
| --------------- | ------------------------------------- |
| `npm run dev`   | Dev server with hot reload            |
| `npm run build` | Production build (type-checked)       |
| `npm run start` | Serve the production build            |
| `npm run lint`  | `eslint .` — run this separately; `next build` no longer lints |

### Environment

| Variable             | Default                     | Purpose               |
| -------------------- | --------------------------- | --------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | Backend base URL      |

## Architecture

```
src/
├── app/                  # Routes (App Router)
│   ├── (public)/         #   marketing + catalog: /, /about, /courses, /courses/[id]
│   ├── (auth)/           #   login, register, forgot/reset password (editorial split layout)
│   ├── (app)/            #   signed-in shell (RequireAuth + AppShell):
│   │                     #   dashboards, my-learning, orders, profile, settings,
│   │                     #   learn/[courseId](+ quiz), teaching(+ [courseId]),
│   │                     #   admin/{users,orders,categories}
│   ├── layout.tsx        #   fonts, theme init script, providers, metadata
│   ├── not-found.tsx     #   root 404
│   └── error.tsx         #   root error boundary (client)
├── features/             # Feature modules: queries/mutations + components
│   ├── auth/             #   provider, service, RequireAuth
│   ├── catalog/          #   course grid, categories, reviews, enrollment actions
│   ├── courses/          #   course detail pieces (curriculum, review section)
│   ├── dashboards/       #   student / teacher / admin panels + their queries
│   ├── learn/            #   player: outline, lesson view, quiz runner, progress
│   ├── teaching/         #   workspace: sections/lessons, quiz editor, staff, details
│   ├── admin/            #   users/orders/categories data layer + AdminGate
│   └── orders/           #   student order list
├── components/
│   ├── ui/               #   design-system kit (Button, fields, Badge, Icon, …)
│   ├── layout/           #   AppShell, Navbar, PageContainer/PageHeader
│   └── providers/        #   Query, Toast, Theme providers
├── constants/            # nav sections, status tone/hint maps
├── lib/                  # api-client, theme init script, utils
└── types/                # mirrors of every backend payload shape
```

**Rule of thumb:** routes render, features own data + composition, `components/ui`
owns primitives. Every backend payload has an explicit type in `src/types` —
shapes were written from the backend's controllers/validators, not guessed.

## Design system

Tokens live in `src/app/globals.css` (Tailwind v4 CSS-first):

- **Palette:** warm paper (`#FCFBF9`), pine green as the single primary,
  amber for attention, clay for destructive/negative. Dark mode is a
  class-toggled palette with the same hierarchy (no low-contrast gray mush).
- **Type:** Fraunces for display/headings, Hanken Grotesk for body,
  IBM Plex Mono for labels, ids, scores, and timestamps.
- **Interaction:** solid color swaps and a 1px lift — buttons never fade on
  hover; disabled states stay visible and unreachable.
- **Icons:** one hand-drawn 24×24 stroke set (`components/ui/icon.tsx`),
  used where they aid scanning, never as decoration.
- **Theming:** `theme-init.ts` inlines a pre-paint script (no flash), and
  `ThemeProvider` reads localStorage/`matchMedia` through
  `useSyncExternalStore` — no setState-in-effect anywhere.

## Auth model

- **Access token:** 15-minute JWT held **in memory only** (lost on reload).
- **Refresh token:** 7-day opaque token in `localStorage`
  (`elysian.auth.v1`), rotated on every refresh; replay of a rotated token
  logs the session out everywhere.
- **User object:** persisted alongside the refresh token and treated as
  authoritative — there is no `GET /auth/me` on this backend, and none is
  called.
- **Refresh:** axios interceptor performs a single-flight refresh; all
  failed 401s queue behind one `POST /auth/refresh`.
- **Change password** revokes all sessions server-side, so the settings
  flow signs out and lands on `/login?reset=1`.
- **Route protection:** `RequireAuth` in the `(app)` layout (client-side
  gate; the API enforces authorization on every request regardless).

## API conventions this client respects

- **Envelope:** `{ success, message?, data }` — `apiClient` unwraps `data`;
  `getData()` returns it. Two endpoints keep siblings *next to* `data`
  instead of inside it: course `pagination` and review `summary` — those
  are read from the envelope directly.
- **Mutations are PATCH** (plus POST/DELETE where the routes define them);
  there are no PUT endpoints.
- **Quiz integrity:** correctness (`isCorrect`) and `GET /quiz/:id/staff`
  are never called from student-facing code; students only submit answers
  and receive scores after submission.
- **Curriculum reads:** section/lesson endpoints are staff-only — students
  get outlines from `GET /progress/course/:id`.
- **Publishing:** draft → pending (requires ≥1 section and lesson) →
  admin publishes/rejects; teachers may only target `pending`/`archived`,
  admins may set any status.
- **Orders:** created `pending` via `POST /order {courseId, gateway}`;
  admin confirms/fails/refunds manually until gateway webhooks exist.
- **Query keys:** `["course", id, …]`, `["dashboard", role]`,
  `["admin-orders", status]`, `["sections", id]`, `["quiz", id]`, …
  — mutations invalidate exactly the lists they change.

## Page map

| Route                     | What it does                                                   |
| ------------------------- | -------------------------------------------------------------- |
| `/`                       | Editorial landing                                              |
| `/about`                  | Story + principles                                             |
| `/courses`                | Paginated catalog with category filters                       |
| `/courses/[id]`           | Course detail: facts, curriculum (if enrolled), reviews        |
| `/login` `/register`      | Session entry (`?next=`, `?registered=1`, `?reset=1` banners)  |
| `/forgot-password` `/reset-password` | Token-based reset (dev shows the reset link)         |
| `/dashboard`              | Role dispatcher → student / teacher / admin panels            |
| `/my-learning`            | Enrollments with progress filters                             |
| `/orders`                 | Order history with per-status guidance                        |
| `/profile` `/settings`    | Identity facts; password change, theme, session info          |
| `/learn/[courseId]`       | Player: outline, lesson media, mark complete                  |
| `/learn/[courseId]/quiz/[quizId]` | Focused quiz runner with attempt history               |
| `/teaching`               | Course index for teaching staff                               |
| `/teaching/[courseId]`    | Workspace: curriculum builder, details, staff                 |
| `/admin/users`            | Role assignment + deletion (no ban API exists)                |
| `/admin/orders`           | Reconciliation queue: confirm / fail / refund                 |
| `/admin/categories`       | Category CRUD                                                 |

## Known constraints (backend contract, by design)

- No profile editing or avatar upload endpoints — profile/settings show facts.
- No ban endpoint — admin shows `isBanned` read-only.
- Staff are added by numeric user id (no user-search endpoint).
- `GET /course/:id` only returns published courses; staff/owners read drafts
  via `GET /course/mine`.
- No search parameter on the catalog; the users page filters client-side.

## Verification

```bash
npx tsc --noEmit   # types
npx eslint .       # lint (zero warnings expected)
npm run build      # production build, all routes
```
