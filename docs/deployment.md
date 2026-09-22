# Deployment

The app is built as a Next.js standalone output and packaged with a multi-stage Dockerfile. The runtime image uses a non-root user, exposes port 3000, and provides `/api/health` for health checks.

Use real secrets only through deployment environment variables. Never expose API secrets or identity-provider client secrets to `NEXT_PUBLIC_*` variables.
