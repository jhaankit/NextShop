import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/password-reset/route";

function request(email: string, relationship = "retailer") {
  return new NextRequest("http://localhost/api/auth/password-reset", {
    method: "POST",
    body: JSON.stringify({ email, relationship }),
    headers: { "Content-Type": "application/json" }
  });
}

describe("password reset route", () => {
  it("returns a generic success for retailer accounts", async () => {
    const response = await POST(request("admin@example.com"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.status).toBe("SENT");
  });

  it("routes national account help separately", async () => {
    const response = await POST(request("buyer@example.com", "national-account"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.status).toBe("REFERRED");
  });
});
