import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireSession } from "@/services/auth/server";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  return <PortalShell session={session}>{children}</PortalShell>;
}
