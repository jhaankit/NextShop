import { CartClient } from "@/components/features/cart-client";
import { PageHeader } from "@/components/features/page-header";
import { requireSession } from "@/services/auth/server";
export default async function CartPage() { await requireSession(["orders.create"]); return <><PageHeader title="Cart" description="Review availability, quantities, pricing, tax, shipping, and order conflicts before checkout." /><CartClient /></>; }
