import type { Permission, PortalUser, Role } from "@/types/domain";

export const rolePermissions: Record<Role, Permission[]> = {
  "account-admin": ["products.read", "orders.read", "orders.create", "orders.cancel", "orders.approve", "invoices.read", "customers.read", "account.manage", "users.manage"],
  buyer: ["products.read", "orders.read", "orders.create", "customers.read"],
  approver: ["products.read", "orders.read", "orders.create", "orders.cancel", "orders.approve", "customers.read"],
  finance: ["products.read", "orders.read", "invoices.read", "customers.read", "account.manage"],
  viewer: ["products.read", "orders.read", "invoices.read", "customers.read"]
};

export function permissionsForRole(role: Role) {
  return rolePermissions[role];
}

export function hasPermission(user: Pick<PortalUser, "permissions"> | undefined, permission: Permission) {
  return Boolean(user?.permissions.includes(permission));
}

export function hasEveryPermission(user: Pick<PortalUser, "permissions"> | undefined, permissions: Permission[]) {
  return permissions.every((permission) => hasPermission(user, permission));
}

export const routePermissions: Record<string, Permission[]> = {
  "/dashboard": ["products.read"],
  "/products": ["products.read"],
  "/cart": ["orders.create"],
  "/checkout": ["orders.create"],
  "/orders": ["orders.read"],
  "/approvals": ["orders.approve"],
  "/invoices": ["invoices.read"],
  "/documents": ["invoices.read"],
  "/customers": ["customers.read"],
  "/account/users": ["users.manage"],
  "/account": ["account.manage"],
  "/notifications": ["products.read"],
  "/support": ["products.read"],
  "/settings": ["products.read"]
};

export function requiredPermissionsForPath(pathname: string) {
  const match = Object.entries(routePermissions)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return match?.[1] ?? [];
}
