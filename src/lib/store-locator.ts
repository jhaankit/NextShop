import type { GeoPoint, StoreLocation } from "@/types/domain";

export const defaultLocatorCenter: GeoPoint = { lat: 39.8283, lng: -98.5795 };
const earthRadiusMiles = 3958.7613;

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceMiles(from: GeoPoint, to: GeoPoint) {
  const deltaLat = degreesToRadians(to.lat - from.lat);
  const deltaLng = degreesToRadians(to.lng - from.lng);
  const startLat = degreesToRadians(from.lat);
  const endLat = degreesToRadians(to.lat);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) ** 2;
  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a));
}

export function formatStoreAddress(store: StoreLocation) {
  const { line1, line2, city, region, postalCode, country } = store.address;
  return [line1, line2, `${city}, ${region} ${postalCode}`, country].filter(Boolean).join(", ");
}

export function storeSearchText(store: StoreLocation) {
  return [store.name, store.address.label, formatStoreAddress(store), store.phone, store.email, ...store.services].join(" ").toLowerCase();
}

export function storeMatchesQuery(store: StoreLocation, query: string) {
  const normalized = query.trim().toLowerCase();
  return !normalized || storeSearchText(store).includes(normalized);
}

export function findFixtureCenter(query: string, stores: StoreLocation[]) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return undefined;
  return stores.find((store) => storeMatchesQuery(store, normalized))?.position;
}

export function storesNearCenter(stores: StoreLocation[], center: GeoPoint, radiusMiles: number, limit: number) {
  return stores
    .map((store) => ({ ...store, distanceMiles: Math.round(distanceMiles(center, store.position) * 10) / 10 }))
    .filter((store) => (store.distanceMiles ?? 0) <= radiusMiles)
    .sort((a, b) => (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function defaultStoreResults(stores: StoreLocation[], limit: number) {
  return [...stores].sort((a, b) => a.address.region.localeCompare(b.address.region) || a.address.city.localeCompare(b.address.city) || a.name.localeCompare(b.name)).slice(0, limit);
}
