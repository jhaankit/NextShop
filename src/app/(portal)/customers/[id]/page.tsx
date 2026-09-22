import { CustomerDetailClient } from "@/components/features/customer-detail-client";
import { requireSession } from "@/services/auth/server";
export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) { await requireSession(["customers.read"]); const { id } = await params; return <CustomerDetailClient id={id} />; }
