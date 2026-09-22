import { CheckoutClient } from "@/components/features/checkout-client";
import { PageHeader } from "@/components/features/page-header";
import { requireSession } from "@/services/auth/server";
export default async function CheckoutPage() { await requireSession(["orders.create"]); return <><PageHeader title="Checkout" description="Submit a validated purchase order for account approval and fulfillment." /><CheckoutClient /></>; }
