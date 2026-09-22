import { cookies } from "next/headers";
import { DashboardClient } from "@/components/features/dashboard-client";
import { PageHeader } from "@/components/features/page-header";
import { hasPermission } from "@/lib/permissions";
import { mockRepository } from "@/mocks/repository";
import { requireSession } from "@/services/auth/server";
export default async function DashboardPage() {
  const session = await requireSession(["products.read"]);
  const locationId = (await cookies()).get("retailer_location_id")?.value;
  const initialData = mockRepository.dashboard.summary(locationId);
  return <><PageHeader title="Dashboard" description="Account health, ordering activity, invoices, and priority alerts." /><DashboardClient initialData={initialData} canApproveOrders={hasPermission(session.user, "orders.approve")} /></>;
}
