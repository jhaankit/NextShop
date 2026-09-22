# Testing

- Vitest covers business rules, repository workflow linkage, permission policies, signed session cookies, auth route handlers, and React components.
- MSW provides environment-level request interception for integration tests and Storybook.
- Playwright covers authentication, password reset, active-location context, dashboard accessibility, catalog, cart, checkout, order details, documents, invoice/account restrictions, and responsive projects.
- Axe checks are included in E2E for automated WCAG regression coverage.
- Storybook covers reusable UI primitives and states, including loading, empty, error, validation, selectable tables, and long-content-ready compositions.

Recommended next additions for a real team are route-handler contract tests, mutation conflict tests, visual regression, and a larger permission matrix run for each role.
