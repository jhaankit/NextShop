import { NextRequest } from "next/server";
import { apiError, apiJson, readSearchParams, requireApiSession, validationError } from "@/app/api/_lib";
import { env } from "@/config/env";
import { defaultLocatorCenter, defaultStoreResults, findFixtureCenter, storesNearCenter } from "@/lib/store-locator";
import { storeLocations } from "@/mocks/store-locations";
import { storeLocatorQuerySchema } from "@/schemas/forms";
import type { GeoPoint, StoreLocatorResponse } from "@/types/domain";

type GeocodingResponse = {
  results?: Array<{
    location?: {
      latitude?: number;
      longitude?: number;
      lat?: number;
      lng?: number;
    };
  }>;
};

function locationFromGeocode(response: GeocodingResponse): GeoPoint | undefined {
  const location = response.results?.[0]?.location;
  const lat = location?.latitude ?? location?.lat;
  const lng = location?.longitude ?? location?.lng;
  return typeof lat === "number" && typeof lng === "number" ? { lat, lng } : undefined;
}

async function geocodeAddress(query: string) {
  if (!env.GOOGLE_GEOCODING_API_KEY) return "missing-key" as const;

  const response = await fetch(`https://geocode.googleapis.com/v4/geocode/address/${encodeURIComponent(query)}`, {
    headers: {
      "X-Goog-Api-Key": env.GOOGLE_GEOCODING_API_KEY,
      "X-Goog-FieldMask": "results.location"
    }
  });

  if (response.status === 429) return "rate-limited" as const;
  if (!response.ok) return "upstream-error" as const;

  return locationFromGeocode((await response.json()) as GeocodingResponse);
}

export async function GET(request: NextRequest) {
  const session = requireApiSession(request, ["products.read"]);
  if (session instanceof Response) return session;

  const parsed = storeLocatorQuerySchema.safeParse(readSearchParams(request));
  if (!parsed.success) return validationError(parsed.error);

  const { q, lat, lng, radiusMiles, limit } = parsed.data;

  if (!q && lat === undefined && lng === undefined) {
    return apiJson<StoreLocatorResponse>({
      stores: defaultStoreResults(storeLocations, limit),
      center: defaultLocatorCenter,
      radiusMiles,
      source: "default"
    });
  }

  let center: GeoPoint | undefined;
  let source: StoreLocatorResponse["source"] = "coordinates";

  if (lat !== undefined && lng !== undefined) {
    center = { lat, lng };
  } else if (q) {
    const fixtureCenter = findFixtureCenter(q, storeLocations);
    if (fixtureCenter) {
      center = fixtureCenter;
      source = "fixture";
    } else {
      const geocoded = await geocodeAddress(q);
      if (geocoded === "missing-key") return apiError(503, "GEOCODING_NOT_CONFIGURED", "Address search needs a configured Google Geocoding API key.");
      if (geocoded === "rate-limited") return apiError(429, "GEOCODING_RATE_LIMITED", "Google Geocoding is rate limited. Please try again shortly.");
      if (geocoded === "upstream-error") return apiError(502, "GEOCODING_UNAVAILABLE", "Google Geocoding is temporarily unavailable.");
      if (!geocoded) {
        return apiJson<StoreLocatorResponse>({ stores: [], center: defaultLocatorCenter, query: q, radiusMiles, source: "geocode" });
      }
      center = geocoded;
      source = "geocode";
    }
  }

  const stores = center ? storesNearCenter(storeLocations, center, radiusMiles, limit) : [];
  return apiJson<StoreLocatorResponse>({ stores, center: center ?? defaultLocatorCenter, query: q || undefined, radiusMiles, source });
}
