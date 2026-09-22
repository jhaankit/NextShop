import { Suspense } from "react";
import { ProductsClient } from "@/components/features/products-client";
import { PageHeader } from "@/components/features/page-header";
import { LoadingState } from "@/components/ui/state";
import { requireSession } from "@/services/auth/server";
export default async function ProductsPage() { await requireSession(["products.read"]); return <><PageHeader title="Product catalog" description="Search contract items, compare availability, and build replenishment orders." /><Suspense fallback={<LoadingState label="Loading catalog" />}><ProductsClient /></Suspense></>; }
