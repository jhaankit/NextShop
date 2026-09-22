"use client";

import { AdvancedMarker, APIProvider, Map, Pin } from "@vis.gl/react-google-maps";
import { AlertTriangle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeoPoint, StoreLocation } from "@/types/domain";

interface StoreLocatorMapProps {
  apiKey: string;
  mapId: string;
  stores: StoreLocation[];
  center: GeoPoint;
  selectedStoreId?: string;
  onSelectStore: (id: string) => void;
}

export function StoreLocatorMap({ apiKey, mapId, stores, center, selectedStoreId, onSelectStore }: StoreLocatorMapProps) {
  if (!apiKey) {
    return (
      <div className="flex h-full min-h-[24rem] flex-col items-center justify-center bg-teal-50 p-8 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-teal-700 shadow-sm">
          <MapPin className="h-8 w-8" aria-hidden />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-950">Google Maps key required</h2>
        <p className="mt-2 max-w-md text-sm text-slate-600">Add `GOOGLE_MAPS_BROWSER_API_KEY` to your environment to render the interactive map. Store search results still work with the sample data.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <APIProvider apiKey={apiKey}>
        <Map mapId={mapId || "DEMO_MAP_ID"} center={center} defaultCenter={center} defaultZoom={stores.length ? 5 : 4} gestureHandling="greedy" disableDefaultUI={false} className="h-full min-h-[24rem] w-full">
          {stores.map((store) => {
            const selected = store.id === selectedStoreId;
            return (
              <AdvancedMarker key={store.id} position={store.position} onClick={() => onSelectStore(store.id)} title={store.name}>
                <div className={cn("rounded-full transition-transform", selected && "scale-125")}>
                  <Pin background={selected ? "#0f766e" : "#dc2626"} borderColor="#ffffff" glyphColor="#ffffff" />
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>
      {!stores.length ? (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 shadow-sm sm:right-auto">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4" aria-hidden />
            <span>No stores are currently visible for this search area.</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
