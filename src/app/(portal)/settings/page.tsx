import { SettingsClient } from "@/components/features/settings-client";
import { PageHeader } from "@/components/features/page-header";
import { requireSession } from "@/services/auth/server";
export default async function SettingsPage() { await requireSession(["products.read"]); return <><PageHeader title="Profile and settings" description="Manage user preferences and review security readiness." /><SettingsClient /></>; }
