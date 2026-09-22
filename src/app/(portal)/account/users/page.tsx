import { AccountClient } from "@/components/features/account-client";
import { PageHeader } from "@/components/features/page-header";
import { requireSession } from "@/services/auth/server";

export default async function AccountUsersPage() {
  await requireSession(["users.manage"]);
  return <><PageHeader title="User administration" description="Invite users and review role-based access." /><AccountClient canManageUsers /></>;
}
