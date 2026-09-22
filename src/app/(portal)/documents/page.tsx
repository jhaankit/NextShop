import { Suspense } from "react";
import { DocumentsClient } from "@/components/features/documents-client";
import { PageHeader } from "@/components/features/page-header";
import { LoadingState } from "@/components/ui/state";
import { requireSession } from "@/services/auth/server";

export default async function DocumentsPage() {
  await requireSession(["invoices.read"]);
  return <><PageHeader title="Documents" description="Find acknowledgements, shipment notices, invoices, credits, and statements." /><Suspense fallback={<LoadingState label="Loading documents" />}><DocumentsClient /></Suspense></>;
}
