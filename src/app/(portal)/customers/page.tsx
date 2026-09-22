import { Suspense } from "react";
import { CustomersClient } from "@/components/features/customers-client";
import { PageHeader } from "@/components/features/page-header";
import { LoadingState } from "@/components/ui/state";
import { requireSession } from "@/services/auth/server";
export default async function CustomersPage() { await requireSession(["customers.read"]); return <><PageHeader title="Customer locations" description="Manage account locations, buyers, and fulfillment scope." /><Suspense fallback={<LoadingState label="Loading customers" />}><CustomersClient /></Suspense></>; }
