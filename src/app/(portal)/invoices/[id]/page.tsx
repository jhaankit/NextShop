import { InvoiceDetailClient } from "@/components/features/invoice-detail-client";
import { requireSession } from "@/services/auth/server";
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) { await requireSession(["invoices.read"]); const { id } = await params; return <InvoiceDetailClient id={id} />; }
