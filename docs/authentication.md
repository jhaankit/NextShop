# Authentication

The initial provider is a mock enterprise identity adapter. It exposes login, logout, session lookup, protected routes, session expiration, authentication errors, CSRF protection, password-reset simulation, and permission checks.

The mock session cookie is signed with an HMAC using server-only configuration and stores only a user id plus expiry timestamp. Mutating API requests use a double-submit CSRF token: login issues a readable CSRF cookie and the shared client transport sends it as `X-CSRF-Token` for non-GET requests.

The architecture is provider-neutral. OAuth 2.0, OIDC, SAML SSO, Okta, Auth0, and Microsoft Entra ID can replace the mock provider behind the same server-facing session contract. Authorization is permission-based and centralized in `src/lib/permissions.ts`.

High-value order approval uses the same permission system. Account admins and approvers receive `orders.approve`, can open `/approvals`, and can approve or reject submitted orders. Buyers, finance users, and viewers can see order status where they have `orders.read`, but they cannot make approval decisions.

The mock password-reset route returns safe generic responses and includes a small in-memory throttle. It does not send email.

Production adapters should add provider token validation, key rotation, refresh flows, durable audit events, distributed rate limiting, and organization-specific MFA/session policies.
