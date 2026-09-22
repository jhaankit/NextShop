import { NextResponse, type NextRequest } from "next/server";
import { z, type ZodError } from "zod";
import { env } from "@/config/env";
import { errorShape } from "@/lib/errors";
import { requiredPermissionsForPath, hasEveryPermission } from "@/lib/permissions";
import { account } from "@/mocks/data";
import { csrfCookieName, parseSessionCookieValue } from "@/services/auth/session-cookie";
import type { ApiErrorShape, ListResponse, Permission, Session } from "@/types/domain";

export function apiJson<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function apiError(status: number, code: string, message: string, details?: Record<string, string[]>) {
  return NextResponse.json(errorShape(status, code, message, details), { status });
}

export function validationError(error: ZodError) {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    details[key] = [...(details[key] ?? []), issue.message];
  }
  return apiError(422, "VALIDATION_ERROR", "Please review the submitted fields.", details);
}

export function getSessionFromRequest(request: NextRequest): Session | undefined {
  const value = request.cookies.get(env.SESSION_COOKIE_NAME)?.value;
  if (!value) return undefined;
  const payload = parseSessionCookieValue(value);
  if (!payload) return undefined;
  const user = account.users.find((candidate) => candidate.id === payload.userId && candidate.status === "ACTIVE");
  if (!user) return undefined;
  const expiresAt = new Date(payload.expiresAt).toISOString();
  const session = { user, expiresAt };
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    return undefined;
  }
  return session;
}

export function requireApiSession(request: NextRequest, permissions: Permission[] = []): Session | NextResponse<ApiErrorShape> {
  const session = getSessionFromRequest(request);
  if (!session) return apiError(401, "UNAUTHENTICATED", "Sign in to continue.");
  if (!hasEveryPermission(session.user, permissions)) return apiError(403, "FORBIDDEN", "You do not have permission for this resource.");
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const csrfCookie = request.cookies.get(csrfCookieName)?.value;
    const csrfHeader = request.headers.get("x-csrf-token");
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) return apiError(403, "CSRF_TOKEN_INVALID", "The security token is invalid. Refresh and try again.");
  }
  return session;
}

export function requireRoutePermission(request: NextRequest, pathname: string) {
  return requireApiSession(request, requiredPermissionsForPath(pathname));
}

export function readSearchParams(request: NextRequest) {
  return Object.fromEntries(request.nextUrl.searchParams.entries());
}

export function activeLocationId(request: NextRequest) {
  return request.nextUrl.searchParams.get("locationId") ?? request.cookies.get("retailer_location_id")?.value ?? undefined;
}

export function paginate<T>(items: T[], page: number, pageSize: number): ListResponse<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page: current, pageSize, pageCount };
}

export function sortByKey<T>(items: T[], sort: string, selectors: Record<string, (item: T) => string | number>) {
  const [key, direction] = sort.split("-");
  const selector = selectors[key] ?? selectors.relevance;
  return [...items].sort((a, b) => {
    const left = selector(a);
    const right = selector(b);
    if (left < right) return direction === "desc" ? 1 : -1;
    if (left > right) return direction === "desc" ? -1 : 1;
    return 0;
  });
}

export function parseJson<T>(schema: z.ZodType<T>, value: unknown) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) return parsed.error;
  return parsed.data;
}
