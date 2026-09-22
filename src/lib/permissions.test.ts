import { describe, expect, it } from "vitest";
import { hasEveryPermission, hasPermission, permissionsForRole, requiredPermissionsForPath } from "@/lib/permissions";

describe("permissions", () => {
  it("maps roles to centralized permissions", () => {
    expect(permissionsForRole("account-admin")).toContain("users.manage");
    expect(permissionsForRole("account-admin")).toContain("orders.approve");
    expect(permissionsForRole("approver")).toContain("orders.approve");
    expect(permissionsForRole("buyer")).not.toContain("invoices.read");
    expect(permissionsForRole("buyer")).not.toContain("orders.approve");
  });
  it("checks route and action permissions", () => {
    const user = { permissions: permissionsForRole("finance") };
    expect(hasPermission(user, "invoices.read")).toBe(true);
    expect(hasEveryPermission(user, requiredPermissionsForPath("/account"))).toBe(true);
    expect(hasEveryPermission(user, requiredPermissionsForPath("/account/users"))).toBe(false);
    expect(requiredPermissionsForPath("/approvals")).toEqual(["orders.approve"]);
    expect(hasPermission(user, "users.manage")).toBe(false);
  });
});
