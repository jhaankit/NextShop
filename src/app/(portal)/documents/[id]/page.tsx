import { DocumentDetailClient } from "@/components/features/document-detail-client";
import { requireSession } from "@/services/auth/server";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession(["invoices.read"]);
  const { id } = await params;
  return <DocumentDetailClient id={id} />;
}
