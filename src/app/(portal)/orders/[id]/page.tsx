import { OrderDetailClient } from "@/components/features/order-detail-client";
import { hasPermission } from "@/lib/permissions";
import { requireSession } from "@/services/auth/server";
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) { const session = await requireSession(["orders.read"]); const { id } = await params; return <OrderDetailClient id={id} canApprove={hasPermission(session.user, "orders.approve")} />; }
