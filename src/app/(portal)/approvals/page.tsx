import { Suspense } from "react";
import { ApprovalsClient } from "@/components/features/approvals-client";
import { PageHeader } from "@/components/features/page-header";
import { LoadingState } from "@/components/ui/state";
import { requireSession } from "@/services/auth/server";

export default async function ApprovalsPage() {
  await requireSession(["orders.approve"]);
  return (
    <>
      <PageHeader title="Approvals" description="Review high-value purchase orders before they move to fulfillment." />
      <Suspense fallback={<LoadingState label="Loading approvals" />}>
        <ApprovalsClient />
      </Suspense>
    </>
  );
}
