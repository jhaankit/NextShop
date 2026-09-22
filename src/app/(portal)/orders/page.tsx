import { Suspense } from "react";
import { OrdersClient } from "@/components/features/orders-client";
import { PageHeader } from "@/components/features/page-header";
import { LoadingState } from "@/components/ui/state";
import { requireSession } from "@/services/auth/server";
export default async function OrdersPage() { await requireSession(["orders.read"]); return <><PageHeader title="Orders" description="Search, filter, reorder, and manage order status across locations." /><Suspense fallback={<LoadingState label="Loading orders" />}><OrdersClient /></Suspense></>; }
