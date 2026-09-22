import { Suspense } from "react";
import { StoreLocatorClient } from "@/components/features/store-locator-client";
import { PageHeader } from "@/components/features/page-header";
import { LoadingState } from "@/components/ui/state";
import { env } from "@/config/env";
import { requireSession } from "@/services/auth/server";

export default async function StoreLocatorPage() {
  await requireSession(["products.read"]);

  return (
    <div className="flex h-full min-h-[calc(100vh-4.25rem)] flex-col bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-4 py-4 lg:px-8">
        <PageHeader title="Find a store" description="Search by address, city, state, ZIP code, or your current location." />
      </div>
      <Suspense fallback={<LoadingState label="Loading store locator" />}>
        <StoreLocatorClient googleMapsApiKey={env.GOOGLE_MAPS_BROWSER_API_KEY} mapId={env.GOOGLE_MAPS_MAP_ID} />
      </Suspense>
    </div>
  );
}
