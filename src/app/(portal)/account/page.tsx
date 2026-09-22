import { AccountClient } from "@/components/features/account-client";
import { PageHeader } from "@/components/features/page-header";
import { hasEveryPermission } from "@/lib/permissions";
import { requireSession } from "@/services/auth/server";
export default async function AccountPage() {
  const session = await requireSession(["account.manage"]);
  return <><PageHeader title="Account management" description="Maintain company information, locations, addresses, users, roles, and permissions." /><AccountClient canManageUsers={hasEveryPermission(session.user, ["users.manage"])} /></>;
}
