# API Layer

Presentation components never call APIs directly. They use typed services in `src/services`, which call a replaceable HTTP transport. Mock route handlers under `src/app/api` provide realistic responses for products, cart preview, orders, documents, invoices, customers, account, store locator, notifications, auth, search, support, and health.

Route handlers delegate business reads and mutations to `src/mocks/repository.ts`. That repository wraps synthetic data today, but the same interface can be replaced by REST, GraphQL, an API gateway, or microservices without changing feature components.

## Route Map

- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/session`, and `POST /api/auth/password-reset`
- `GET /api/dashboard`
- `GET /api/products`, `GET /api/products/:id`, and `GET /api/products/:id/document/:type`
- `POST /api/cart/preview`
- `GET /api/orders`, `POST /api/orders`, `GET /api/orders/:id`, and `PATCH /api/orders/:id`
- `GET /api/approvals`
- `GET /api/documents`, `GET /api/documents/:id`, and `GET /api/documents/:id/download`
- `GET /api/invoices`, `GET /api/invoices/:id`, and `GET /api/invoices/:id/document`
- `GET /api/customers`, `GET /api/customers/:id`, `GET /api/account`, `POST /api/account/addresses`, `POST /api/account/users`, and `PATCH /api/account/profile`
- `GET /api/store-locator`
- `GET /api/notifications`, `PATCH /api/notifications`
- `GET /api/support/cases`, `POST /api/support/cases`
- `GET /api/search` and `GET /api/health`

The `retailer_location_id` cookie or `locationId` query parameter scopes location-aware reads for catalog inventory, dashboard metrics, orders, invoices, documents, and global search.

## Store Locator

`GET /api/store-locator` requires an authenticated portal session with `products.read`. It accepts `q`, `lat`, `lng`, `radiusMiles`, and `limit` query parameters. Without a query it returns sample stores for the initial locator view. With `lat` and `lng`, it returns stores within the radius sorted by distance. With `q`, it first resolves matching sample fixture locations for local development; otherwise it uses Google Geocoding v4 server-side when `GOOGLE_GEOCODING_API_KEY` is configured.

Use separate Google Maps keys: `GOOGLE_MAPS_BROWSER_API_KEY` for the browser Maps JavaScript API, restricted by HTTP referrer and API scope, and `GOOGLE_GEOCODING_API_KEY` for server-side Geocoding, restricted by server IP and API scope. The store data in this repo is synthetic and lives in `src/mocks/store-locations.ts`.

## Mock Lifecycle

Order creation validates the current cart preview, creates an acknowledgement document, emits a notification, and records an audit event. Orders above the approval threshold remain `SUBMITTED` until an authorized approver uses `PATCH /api/orders/:id` with `approve` or `reject`; rejected orders require a reason and both decisions append timeline, notification, and audit records. Existing shipped orders include shipment and ASN records. Support cases and profile edits persist in memory for the running process only.

Errors are normalized to safe shapes with status, code, message, and optional field details. Supported statuses include 400, 401, 403, 404, 409, 422, 429, and 500. Client-side service calls emit a session-expiry event on 401 so the provider can redirect through Next navigation instead of using direct browser navigation.
