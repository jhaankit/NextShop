# Claude Guidance

This project is Retailer Portal, a generic B2B portal sample built on Next.js 16 App Router and React 19.

Read `README.md` first for setup, commands, architecture, configuration, and documentation links. Then follow the shared agent instructions in `AGENTS.md`.

High-priority reminders:

- Keep the generated Next.js 16 warning in `AGENTS.md`; it is re-created by `next dev`.
- Use typed services in `src/services` and query hooks in `src/hooks/use-portal-queries.ts`; do not bypass them from UI code.
- The running app uses Next.js route handlers and `src/mocks/repository.ts`; MSW is for Vitest tests.
- Preserve session, permission, and CSRF behavior when adding pages, routes, or mutations.
- Add environment variables through `src/config/env.ts` and `.env.example`.

@AGENTS.md
