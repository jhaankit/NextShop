import { Suspense } from "react";
import { InvoicesClient } from "@/components/features/invoices-client";
import { PageHeader } from "@/components/features/page-header";
import { LoadingState } from "@/components/ui/state";
import { requireSession } from "@/services/auth/server";
export default async function InvoicesPage() { await requireSession(["invoices.read"]); return <><PageHeader title="Invoices" description="Track open balances, payment status, due dates, and document downloads." /><Suspense fallback={<LoadingState label="Loading invoices" />}><InvoicesClient /></Suspense></>; }
