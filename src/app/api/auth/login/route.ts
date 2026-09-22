import { addSeconds } from "date-fns";
import { NextRequest } from "next/server";
import { env } from "@/config/env";
import { apiError, apiJson, parseJson, validationError } from "@/app/api/_lib";
import { loginSchema } from "@/schemas/forms";
import { getUserByEmail } from "@/mocks/data";
import { createCsrfToken, createSessionCookieValue, csrfCookieName } from "@/services/auth/session-cookie";

export async function POST(request: NextRequest) {
  const parsed = parseJson(loginSchema, await request.json());
  if (parsed instanceof Error) return validationError(parsed);
  const user = getUserByEmail(parsed.email);
  if (!user || parsed.password !== env.MOCK_AUTH_PASSWORD) return apiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  const expiresAt = addSeconds(new Date(), env.SESSION_TTL_SECONDS);
  const session = { user, expiresAt: expiresAt.toISOString() };
  const response = apiJson(session);
  response.cookies.set(env.SESSION_COOKIE_NAME, createSessionCookieValue(user.id, expiresAt), {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NEXT_PUBLIC_ENVIRONMENT === "production",
    path: "/",
    maxAge: env.SESSION_TTL_SECONDS
  });
  response.cookies.set(csrfCookieName, createCsrfToken(), {
    httpOnly: false,
    sameSite: "lax",
    secure: env.NEXT_PUBLIC_ENVIRONMENT === "production",
    path: "/",
    maxAge: env.SESSION_TTL_SECONDS
  });
  return response;
}
