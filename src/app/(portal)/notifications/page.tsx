import { NotificationsClient } from "@/components/features/notifications-client";
import { PageHeader } from "@/components/features/page-header";
import { requireSession } from "@/services/auth/server";
export default async function NotificationsPage() { await requireSession(["products.read"]); return <><PageHeader title="Notifications" description="Review account, catalog, order, invoice, and support events." /><NotificationsClient /></>; }
