# Retailer Portal

A production-oriented, independent B2B retailer portal sample built with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Radix UI, TanStack Query/Table, Zustand, React Hook Form, Zod, Vitest with MSW, Playwright, Storybook, Docker, and GitHub Actions.

The app is generic sample software. External retailer portals are used only as workflow references, not as source material for branding or copied content.

## Prerequisites

- Node.js 22+
- pnpm 12+
- Docker for production image verification or containerized runs

## Quick Start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000` and sign in with one of the mock accounts below. The default password is `password`, controlled by `MOCK_AUTH_PASSWORD`.

| Email | Role |
| --- | --- |
| `admin@example.com` | Account admin |
| `approver@example.com` | Approver |
| `buyer@example.com` | Buyer |
| `finance@example.com` | Finance |
| `viewer@example.com` | Viewer |

## Configuration

All environment variables are validated in `src/config/env.ts`. Copy `.env.example` to `.env.local` for local development.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_NAME` | Display name shown in the app. |
| `NEXT_PUBLIC_API_URL` | Optional external API base URL. Leave empty for same-origin Next.js route handlers. |
| `NEXT_PUBLIC_ENVIRONMENT` | `development`, `test`, `staging`, or `production`. |
| `NEXT_PUBLIC_ENABLE_MSW` | Reserved flag; runtime mocking currently uses Next.js route handlers, not browser MSW. |
| `AUTH_ISSUER`, `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET` | Mock auth provider and session-signing configuration. |
| `MOCK_AUTH_PASSWORD` | Shared password for mock accounts. |
| `SESSION_COOKIE_NAME`, `SESSION_TTL_SECONDS` | Signed session cookie configuration. |
| `GOOGLE_MAPS_BROWSER_API_KEY` | Optional Maps JavaScript API key for the store locator. Restrict by HTTP referrer. |
| `GOOGLE_MAPS_MAP_ID` | Optional map ID for Advanced Markers. `DEMO_MAP_ID` is fine for local experiments. |
| `GOOGLE_GEOCODING_API_KEY` | Optional server-side Geocoding v4 key. Restrict by server IP. |

For production, set a real `AUTH_CLIENT_SECRET`; `src/config/env.ts` rejects the built-in default in production.

## Architecture

The portal uses typed service boundaries even though the demo backend is in-process:

```text
UI pages and feature clients
  -> TanStack Query hooks in src/hooks/use-portal-queries.ts
  -> typed services in src/services
  -> apiFetch in src/services/http.ts
  -> Next.js route handlers in src/app/api
  -> in-memory repository in src/mocks/repository.ts
```

MSW is used by Vitest through `vitest.setup.ts` and `src/mocks/node.ts`. The running app talks to Next.js route handlers under `src/app/api`; those handlers delegate to `src/mocks/repository.ts`, which owns the synthetic lifecycle for products, cart previews, orders, fulfillment documents, invoices, support cases, notifications, and account profiles.

Auth is enforced from server layouts/pages and API helpers rather than middleware. Sessions use a signed cookie, mutating API calls use a double-submit CSRF token, and route/API access is driven by role permissions in `src/lib/permissions.ts`. The active customer location is scoped through a location cookie or request parameter.

Store locator fixtures live in `src/mocks/store-locations.ts`; address search calls Google Geocoding only when the server-side key is configured. Mock mutations persist only for the running process, so restarting the dev server restores the synthetic fixtures.

## Project Layout

```text
src/app            App Router pages, layouts, and API route handlers
src/components     Feature clients, layout, shared components, and UI primitives
src/hooks          Portal query hooks and shared React hooks
src/lib            Permissions, business rules, observability, and utilities
src/mocks          Synthetic data, repository, MSW test handlers, and store fixtures
src/schemas        Zod form and API validation schemas
src/services       Typed client services and auth/session helpers
src/stores         Client-side persisted state such as the cart
src/types          Domain contracts shared across layers
tests/e2e          Playwright browser coverage
docs               Deeper architecture, API, auth, testing, deployment, and assumptions docs
```

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Next.js development server. |
| `pnpm build` | Create the production Next.js build. |
| `pnpm start` | Start the built Next.js app. |
| `pnpm lint` | Run ESLint. |
| `pnpm typecheck` | Run TypeScript with `--noEmit`. |
| `pnpm test` | Run Vitest once. |
| `pnpm test:watch` | Run Vitest in watch mode. |
| `pnpm test:e2e` | Run Playwright against the standalone production server. |
| `pnpm storybook` | Start Storybook on port 6006. |
| `pnpm storybook:build` | Build the static Storybook output locally. |
| `docker build .` | Verify the production container image builds. |
| `docker compose up --build` | Build and run the portal service from `compose.yaml`. |

## Quality And CI

For local confidence before opening a PR, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The pull request workflow runs those same four checks. The main branch workflow also installs Chromium, runs `pnpm test:e2e`, and verifies `docker build .`. Storybook has local commands but is not currently part of CI.

## Docker

```bash
docker build -t retailer-portal .
docker run --env-file .env.local -p 3000:3000 retailer-portal
```

Or use Compose:

```bash
docker compose up --build
```

The Docker image uses Next.js standalone output, runs as a non-root user, exposes port 3000, and includes a healthcheck against `/api/health`.

## Demo Workflows

- Sign in, reveal the password field, or request a simulated password reset.
- Switch the active customer location from the portal shell.
- Browse the catalog with active-location pricing, inventory, and product document links.
- Add items to cart, preview server-side pricing/inventory, and submit a purchase order.
- Approve or reject high-value submitted orders from the approver queue.
- Track order status, line-level fulfillment, shipment notices, tracking numbers, and acknowledgements.
- Search and download generic documents: acknowledgements, ASNs, invoices, credits, and statements.
- Maintain location profiles, responsibility contacts, addresses, users, notifications, support cases, and local settings.
- Find nearby sample stores from the portal header using address search, Google Maps, or browser geolocation.

## Further Documentation

- `docs/architecture.md` covers system structure, data flow, state ownership, and key patterns.
- `docs/api.md` documents service and route-handler contracts.
- `docs/authentication.md` explains mock auth, sessions, CSRF, roles, and permissions.
- `docs/testing.md` covers Vitest, MSW, Playwright, accessibility checks, and Storybook.
- `docs/deployment.md` covers production configuration and deployment steps.
- `docs/assumptions.md` records business rules such as pricing, tax, freight, and approval behavior.
- `docs/accessibility.md` summarizes accessibility standards and verification.
- `docs/reference-workflows.md` maps the generic demo workflows used by the portal.
