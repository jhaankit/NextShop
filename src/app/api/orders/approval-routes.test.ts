import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET as GET_APPROVALS } from "@/app/api/approvals/route";
import { PATCH } from "@/app/api/orders/[id]/route";
import { env } from "@/config/env";
import { mockRepository } from "@/mocks/repository";
import { createSessionCookieValue, csrfCookieName } from "@/services/auth/session-cookie";

const csrfToken = "test-csrf-token";

function authCookie(userId: string) {
  const session = createSessionCookieValue(userId, new Date(Date.now() + 60_000));
  return `${env.SESSION_COOKIE_NAME}=${session}; ${csrfCookieName}=${csrfToken}`;
}

function request(url: string, userId: string, body?: unknown) {
  return new NextRequest(url, {
    method: body ? "PATCH" : "GET",
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie(userId),
      "X-CSRF-Token": csrfToken
    }
  });
}

function routeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("approval routes", () => {
  it("lists location-scoped pending approvals for approvers", async () => {
    const response = await GET_APPROVALS(request("http://localhost/api/approvals?locationId=loc_0002", "user_0005"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.every((order: { status: string; customerLocationId: string }) => order.status === "SUBMITTED" && order.customerLocationId === "loc_0002")).toBe(true);
  });

  it("rejects approval queue access for buyers", async () => {
    const response = await GET_APPROVALS(request("http://localhost/api/approvals?locationId=loc_0001", "user_0002"));
    expect(response.status).toBe(403);
  });

  it("approves pending orders and rejects duplicate decisions", async () => {
    const target = mockRepository.orders.pendingApprovals("loc_0002")[0];
    expect(target).toBeDefined();
    if (!target) return;
    const approvedResponse = await PATCH(request(`http://localhost/api/orders/${target.id}`, "user_0005", { action: "approve" }), routeContext(target.id));
    const approved = await approvedResponse.json();
    expect(approvedResponse.status).toBe(200);
    expect(approved.status).toBe("APPROVED");
    expect(approved.approval.decisions[0]).toMatchObject({ action: "approve", actorId: "user_0005" });

    const duplicateResponse = await PATCH(request(`http://localhost/api/orders/${target.id}`, "user_0005", { action: "reject", reason: "Duplicate decision" }), routeContext(target.id));
    expect(duplicateResponse.status).toBe(409);
  });

  it("requires reject reasons and approval permissions", async () => {
    const target = mockRepository.orders.pendingApprovals("loc_0002")[0];
    expect(target).toBeDefined();
    if (!target) return;
    const validationResponse = await PATCH(request(`http://localhost/api/orders/${target.id}`, "user_0005", { action: "reject" }), routeContext(target.id));
    expect(validationResponse.status).toBe(422);

    const forbiddenResponse = await PATCH(request(`http://localhost/api/orders/${target.id}`, "user_0002", { action: "approve" }), routeContext(target.id));
    expect(forbiddenResponse.status).toBe(403);
  });
});
