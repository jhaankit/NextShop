import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/config/env";

export const csrfCookieName = "retailer_csrf";

interface SessionPayload {
  userId: string;
  expiresAt: number;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", env.AUTH_CLIENT_SECRET).update(value).digest("base64url");
}

export function createSessionCookieValue(userId: string, expiresAt: Date) {
  const payload = base64UrlEncode(JSON.stringify({ userId, expiresAt: expiresAt.getTime() } satisfies SessionPayload));
  return `${payload}.${sign(payload)}`;
}

export function parseSessionCookieValue(value: string): SessionPayload | undefined {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return undefined;
  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return undefined;
  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as Partial<SessionPayload>;
    if (!parsed.userId || typeof parsed.expiresAt !== "number") return undefined;
    return { userId: parsed.userId, expiresAt: parsed.expiresAt };
  } catch {
    return undefined;
  }
}

export function createCsrfToken() {
  return crypto.randomUUID();
}
