"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Clock, Loader2, LocateFixed, MapPin, Navigation, Phone, Search } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/state";
import { useStoreLocator } from "@/hooks/use-portal-queries";
import { defaultLocatorCenter, formatStoreAddress } from "@/lib/store-locator";
import { cn } from "@/lib/utils";
import type { GeoPoint, StoreLocation } from "@/types/domain";

const StoreLocatorMap = dynamic(() => import("@/components/features/store-locator-map").then((module) => module.StoreLocatorMap), {
  ssr: false,
  loading: () => <LoadingState label="Loading map" />
});

const radiusOptions = [25, 50, 100, 250, 500];

function readNumber(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function directionsUrl(store: StoreLocation) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formatStoreAddress(store))}`;
}

function StoreCard({ store, selected, onSelect }: { store: StoreLocation; selected: boolean; onSelect: () => void }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const hours = store.hours[today] ?? "Hours vary";

  return (
    <article className={cn("rounded-xl border bg-white p-4 shadow-sm transition", selected ? "border-teal-600 ring-2 ring-teal-100" : "border-slate-200 hover:border-slate-300")}>
      <button type="button" className="block w-full text-left" onClick={onSelect}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-950">{store.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{formatStoreAddress(store)}</p>
          </div>
          {store.distanceMiles !== undefined ? <span className="shrink-0 rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">{store.distanceMiles} mi</span> : null}
        </div>
      </button>
      <div className="mt-3 space-y-2 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" aria-hidden />
          {hours}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-slate-400" aria-hidden />
          <a href={`tel:${store.phone}`} className="hover:text-teal-700">
            {store.phone}
          </a>
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {store.services.slice(0, 3).map((service) => (
          <span key={service} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
            {service}
          </span>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Button asChild variant="secondary" size="sm">
          <a href={directionsUrl(store)} target="_blank" rel="noreferrer">
            <Navigation className="h-4 w-4" aria-hidden />
            Directions
          </a>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/support?store=${encodeURIComponent(store.id)}`}>Contact support</Link>
        </Button>
      </div>
    </article>
  );
}

export function StoreLocatorClient({ googleMapsApiKey, mapId }: { googleMapsApiKey: string; mapId: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const paramsText = searchParams.toString();
  const query = useMemo(() => {
    const params = new URLSearchParams(paramsText);
    return {
      q: params.get("q") ?? "",
      lat: readNumber(params.get("lat")),
      lng: readNumber(params.get("lng")),
      radiusMiles: readNumber(params.get("radiusMiles")) ?? 100,
      limit: 25
    };
  }, [paramsText]);
  const [searchText, setSearchText] = useState(query.q);
  const [selectedStoreId, setSelectedStoreId] = useState<string>();
  const [locationMessage, setLocationMessage] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const locator = useStoreLocator(query);
  const stores = useMemo(() => locator.data?.stores ?? [], [locator.data?.stores]);
  const center: GeoPoint = locator.data?.center ?? defaultLocatorCenter;
  const selectedStore = stores.find((store) => store.id === selectedStoreId) ?? stores[0];

  function pushParams(params: URLSearchParams) {
    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(paramsText);
    const text = searchText.trim();
    params.delete("lat");
    params.delete("lng");
    if (text) params.set("q", text);
    else params.delete("q");
    pushParams(params);
  }

  function changeRadius(value: string) {
    const params = new URLSearchParams(paramsText);
    params.set("radiusMiles", value);
    pushParams(params);
  }

  function useCurrentLocation() {
    setLocationMessage("");
    if (!navigator.geolocation) {
      setLocationMessage("Your browser does not support location lookup.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams(paramsText);
        params.delete("q");
        params.set("lat", String(position.coords.latitude));
        params.set("lng", String(position.coords.longitude));
        pushParams(params);
        setSearchText("");
        setLocationMessage("Showing stores near your current location.");
        setIsLocating(false);
      },
      () => {
        setLocationMessage("Location permission was denied or unavailable. Search by address instead.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 }
    );
  }

  return (
    <div className="grid flex-1 overflow-hidden lg:grid-cols-[minmax(20rem,26rem)_1fr]">
      <aside className="flex min-h-[28rem] flex-col border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
        <div className="space-y-3 border-b border-slate-200 p-4">
          <form onSubmit={submitSearch} className="flex gap-2" role="search">
            <label htmlFor="store-search" className="sr-only">
              Address, city, state, or ZIP
            </label>
            <Input id="store-search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Address, City, State, and/or ZIP" />
            <Button type="submit" aria-label="Search stores">
              <Search className="h-4 w-4" aria-hidden />
            </Button>
          </form>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Button type="button" variant="ghost" className="justify-start text-teal-700" onClick={useCurrentLocation} disabled={isLocating}>
              {isLocating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LocateFixed className="h-4 w-4" aria-hidden />}
              Use My Current Location
            </Button>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Radius
              <Select value={String(query.radiusMiles)} onChange={(event) => changeRadius(event.target.value)} className="w-28" aria-label="Search radius">
                {radiusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} mi
                  </option>
                ))}
              </Select>
            </label>
          </div>
          <p className="min-h-5 text-sm text-slate-600" role="status" aria-live="polite">
            {locationMessage || (locator.isFetching ? "Searching stores..." : locator.data ? `${stores.length} location${stores.length === 1 ? "" : "s"} found.` : "")}
          </p>
          {locator.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">{locator.error.message}</p> : null}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {locator.isLoading ? (
            <LoadingState label="Loading stores" />
          ) : stores.length ? (
            <div className="space-y-3">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} selected={store.id === selectedStore?.id} onSelect={() => setSelectedStoreId(store.id)} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
              <div className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4" aria-hidden />
                <p>Sorry! We could not find any locations for your search. Please try another location or increase the radius.</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      <section className="min-h-[28rem] bg-slate-100" aria-label="Store map">
        <StoreLocatorMap apiKey={googleMapsApiKey} mapId={mapId} stores={stores} center={selectedStore?.position ?? center} selectedStoreId={selectedStore?.id} onSelectStore={setSelectedStoreId} />
      </section>
    </div>
  );
}
