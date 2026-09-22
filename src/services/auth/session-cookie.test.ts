import { describe, expect, it } from "vitest";
import { createSessionCookieValue, parseSessionCookieValue } from "@/services/auth/session-cookie";

describe("signed session cookies", () => {
  it("round-trips a valid session payload", () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const value = createSessionCookieValue("user_0001", expiresAt);
    expect(parseSessionCookieValue(value)).toEqual({ userId: "user_0001", expiresAt: expiresAt.getTime() });
  });

  it("rejects tampered payloads", () => {
    const value = createSessionCookieValue("user_0001", new Date(Date.now() + 60_000));
    const [payload, signature] = value.split(".");
    expect(parseSessionCookieValue(`${payload?.slice(0, -1)}x.${signature}`)).toBeUndefined();
  });
});
