import { env } from "@/config/env";
import { apiJson } from "@/app/api/_lib";
import { csrfCookieName } from "@/services/auth/session-cookie";

export async function POST() {
  const response = apiJson({ ok: true as const });
  response.cookies.set(env.SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  response.cookies.set(csrfCookieName, "", { path: "/", maxAge: 0 });
  return response;
}
