import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/config/env";
import { hasEveryPermission } from "@/lib/permissions";
import { account } from "@/mocks/data";
import { parseSessionCookieValue } from "@/services/auth/session-cookie";
import type { Permission, Session } from "@/types/domain";

export async function getCurrentSession(): Promise<Session | undefined> {
  const store = await cookies();
  const value = store.get(env.SESSION_COOKIE_NAME)?.value;
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

export async function requireSession(permissions: Permission[] = []) {
  const session = await getCurrentSession();
  if (!session) redirect("/login?reason=expired");
  if (!hasEveryPermission(session.user, permissions)) redirect("/unauthorized");
  return session;
}
