<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Context

Retailer Portal is a generic B2B portal sample built with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Radix UI, TanStack Query/Table, Zustand, React Hook Form, Zod, Vitest with MSW, Playwright, Storybook, Docker, and GitHub Actions.

Start with `README.md` for setup and commands. Use the focused guides in `docs/` for deeper context:

- `docs/architecture.md` for data flow, state ownership, and source layout.
- `docs/api.md` for service and route-handler contracts.
- `docs/authentication.md` for sessions, CSRF, roles, and permissions.
- `docs/testing.md` for Vitest, MSW, Playwright, accessibility, and Storybook.
- `docs/deployment.md` for production configuration and Docker behavior.
- `docs/assumptions.md` for business rules and demo constraints.

## Source Layout

- `src/app` contains App Router pages, layouts, and API route handlers. Portal pages live under `src/app/(portal)`, and auth pages live under `src/app/(auth)`.
- `src/components/features` contains interactive feature clients, usually named `*-client.tsx`.
- `src/components/ui`, `src/components/shared`, and `src/components/layout` contain reusable UI primitives, shared widgets, and portal chrome.
- `src/hooks/use-portal-queries.ts` is the main TanStack Query boundary for portal server state.
- `src/services` contains typed client services, HTTP transport, and auth/session helpers.
- `src/mocks` contains synthetic fixtures, the in-memory repository, and MSW test handlers.
- `src/lib` contains permissions, business rules, observability, and utilities.
- `src/schemas/forms.ts` contains Zod validation schemas, and `src/types/domain.ts` contains shared domain contracts.

## Implementation Rules

- Keep presentation code behind the service boundary. Components and hooks should call typed services from `src/services`; they should not hand-roll `fetch` calls to app APIs.
- Keep route handlers thin. API routes under `src/app/api` should validate, authorize, call `src/mocks/repository.ts` or service helpers, and return typed responses.
- Treat MSW as test infrastructure. Vitest starts MSW through `vitest.setup.ts` and `src/mocks/node.ts`; the running app uses Next.js route handlers rather than browser MSW.
- Read environment values only through `src/config/env.ts`. Add new variables to the Zod schema and `.env.example`, and do not hardcode secrets.
- Use Zod schemas for form and request validation. Prefer extending `src/schemas/forms.ts` or adding a nearby schema over inline ad hoc validation.
- Preserve auth and authorization behavior. Portal pages use server-side session helpers such as `requireSession`; API routes should use the API auth helpers and update `src/lib/permissions.ts` when adding protected surfaces.
- Preserve CSRF behavior. Mutating service calls should go through `apiFetch` in `src/services/http.ts` so the CSRF token handling stays consistent.
- Respect state ownership: TanStack Query for server state, URL search params for filters, Zustand only for persisted client state such as the cart, and local React state for view-local interactions.
- Keep mock mutations process-local unless explicitly implementing persistence. Restarting the dev server should reset synthetic fixtures.

## Testing And Validation

- Co-locate Vitest files as `*.test.ts` or `*.test.tsx` near the code they cover.
- Put browser workflows in `tests/e2e`; Playwright runs against the standalone production server configured in `playwright.config.ts`.
- Add or update Storybook stories for reusable UI states where it improves reviewability.
- Before handing off substantive changes, prefer `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. Use `pnpm test:e2e`, `pnpm storybook:build`, and Docker checks when the change touches browser workflows, Storybook, production output, or deployment behavior.
