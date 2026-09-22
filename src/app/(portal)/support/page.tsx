import { SupportClient } from "@/components/features/support-client";
import { PageHeader } from "@/components/features/page-header";
import { requireSession } from "@/services/auth/server";
export default async function SupportPage() { await requireSession(["products.read"]); return <><PageHeader title="Support" description="Create cases for orders, invoices, catalog access, account setup, or technical issues." /><SupportClient /></>; }
