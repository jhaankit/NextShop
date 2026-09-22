"use client";

import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Building2, ClipboardCheck, FileText, HelpCircle, Home, LogOut, MapPin, Menu, PackageSearch, Receipt, Search, Settings, ShoppingCart, Users } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/features/global-search";
import { Select } from "@/components/ui/input";
import { SubMenuBtn } from "@/components/layout/sub-menu-btn";
import { useAccount, useNotifications, useLogout } from "@/hooks/use-portal-queries";
import { hasEveryPermission } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { Permission, Session } from "@/types/domain";

const navItems: Array<{ href: string; label: string; icon: React.ElementType; permissions: Permission[] }> = [
  { href: "/dashboard", label: "Dashboard", icon: Home, permissions: ["products.read"] },
  { href: "/products", label: "Products", icon: PackageSearch, permissions: ["products.read"] },
  { href: "/cart", label: "Cart", icon: ShoppingCart, permissions: ["orders.create"] },
  { href: "/orders", label: "Orders", icon: Receipt, permissions: ["orders.read"] },
  { href: "/approvals", label: "Approvals", icon: ClipboardCheck, permissions: ["orders.approve"] },
  { href: "/invoices", label: "Invoices", icon: FileText, permissions: ["invoices.read"] },
  { href: "/documents", label: "Documents", icon: FileText, permissions: ["invoices.read"] },
  { href: "/customers", label: "Customers", icon: Building2, permissions: ["customers.read"] },
  { href: "/account", label: "Account", icon: Users, permissions: ["account.manage"] },
  { href: "/support", label: "Support", icon: HelpCircle, permissions: ["products.read"] },
  { href: "/settings", label: "Settings", icon: Settings, permissions: ["products.read"] }
];
const locationStorageEvent = "retailer:location-change";

export function PortalShell({ session, children }: { session: Session; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const fallbackLocationId = session.user.locationIds[0] ?? "";
  const activeLocationId = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener(locationStorageEvent, onStoreChange);
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener(locationStorageEvent, onStoreChange);
      };
    },
    () => {
    const stored = window.localStorage.getItem("retailer_location_id");
      return stored && session.user.locationIds.includes(stored) ? stored : fallbackLocationId;
    },
    () => fallbackLocationId
  );
  const account = useAccount();
  const notifications = useNotifications();
  const logout = useLogout();
  const unread = notifications.data?.filter((note) => !note.readAt).length ?? 0;
  const visibleNav = navItems.filter((item) => hasEveryPermission(session.user, item.permissions));
  const locationOptions = (account.data?.locations ?? []).filter((location) => session.user.locationIds.includes(location.id));
  const locatorActive = pathname.startsWith("/store-locator");

  useEffect(() => {
    if (!activeLocationId) return;
    document.cookie = `retailer_location_id=${encodeURIComponent(activeLocationId)}; path=/; max-age=3600; samesite=lax`;
  }, [activeLocationId]);

  function setActiveLocationId(locationId: string) {
    window.localStorage.setItem("retailer_location_id", locationId);
    window.dispatchEvent(new Event(locationStorageEvent));
    void queryClient.invalidateQueries();
  }

  async function signOut() {
    await logout.mutateAsync();
    router.push("/login");
  }

  function renderNav({ mobile = false }: { mobile?: boolean } = {}) {
    return (
      <nav aria-label="Primary" className="space-y-1">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.href === "/products" && !mobile) {
            return <SubMenuBtn key={item.href} label={item.label} icon={Icon} active={active} />;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                active ? "bg-teal-50 text-teal-900" : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-5 lg:block">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-700 text-white">RP</span>
          Retailer Portal
        </Link>
        <div className="mt-6 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="active-location">
            Active location
          </label>
          <Select id="active-location" value={activeLocationId} onChange={(event) => setActiveLocationId(event.target.value)}>
            {locationOptions.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-8">{renderNav()}</div>
      </aside>
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-80 bg-white p-5 shadow-xl lg:hidden">
            <div className="mb-6 flex items-center justify-between">
              <Dialog.Title className="font-bold">Retailer Portal navigation</Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" aria-label="Close navigation">
                  Close
                </Button>
              </Dialog.Close>
            </div>
            <div className="mb-6 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="mobile-active-location">
                Active location
              </label>
              <Select id="mobile-active-location" value={activeLocationId} onChange={(event) => setActiveLocationId(event.target.value)}>
                {locationOptions.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </Select>
            </div>
            {renderNav({ mobile: true })}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <Button className="lg:hidden" variant="ghost" size="sm" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
            <GlobalSearch
              trigger={
                <Button variant="secondary" className="min-w-0 flex-1 justify-start text-slate-600">
                  <Search className="h-4 w-4" />
                  <span className="sm:hidden">Search</span>
                  <span className="hidden sm:inline">Search products, orders, documents</span>{" "}
                  <kbd className="ml-auto hidden rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700 sm:inline">⌘K</kbd>
                </Button>
              }
            />
            {hasEveryPermission(session.user, ["products.read"]) ? (
              <Button asChild variant={locatorActive ? "primary" : "secondary"} size="sm" className="shrink-0">
                <Link href="/store-locator" aria-label="Find a store">
                  <MapPin className="h-4 w-4" aria-hidden />
                  <span className="hidden md:inline">Find a store</span>
                </Link>
              </Button>
            ) : null}
            <Link href="/notifications" className="relative rounded-md p-2 text-slate-700 hover:bg-slate-100" aria-label={`${unread} unread notifications`}>
              <Bell className="h-5 w-5" />
              {unread ? <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-600" /> : null}
            </Link>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{session.user.name}</p>
              <p className="text-xs text-slate-500">{session.user.role}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        <main id="main" className={cn("px-4 py-6 lg:px-8", locatorActive && "h-[calc(100vh-4.25rem)] overflow-hidden px-0 py-0 lg:px-0")}>
          {children}
        </main>
      </div>
    </div>
  );
}
