import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/store-locator/route";
import { env } from "@/config/env";
import { createSessionCookieValue } from "@/services/auth/session-cookie";

const originalGeocodingKey = env.GOOGLE_GEOCODING_API_KEY;

function request(url: string) {
  const session = createSessionCookieValue("user_0001", new Date(Date.now() + 60_000));
  return new NextRequest(url, {
    headers: {
      Cookie: `${env.SESSION_COOKIE_NAME}=${session}`
    }
  });
}

describe("store locator route", () => {
  beforeEach(() => {
    env.GOOGLE_GEOCODING_API_KEY = originalGeocodingKey;
    vi.restoreAllMocks();
  });

  it("returns initial sample locations for authenticated users", async () => {
    const response = await GET(request("http://localhost/api/store-locator"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.source).toBe("default");
    expect(body.stores.length).toBeGreaterThan(0);
  });

  it("sorts coordinate searches by distance", async () => {
    const response = await GET(request("http://localhost/api/store-locator?lat=30.2672&lng=-97.7431&radiusMiles=250"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.source).toBe("coordinates");
    expect(body.stores[0].name).toContain("Austin");
    expect(body.stores.some((store: { name: string }) => store.name.includes("Dallas"))).toBe(true);
  });

  it("validates coordinate pairs", async () => {
    const response = await GET(request("http://localhost/api/store-locator?lat=30.2672"));
    expect(response.status).toBe(422);
  });

  it("uses Google Geocoding for unmatched address searches", async () => {
    env.GOOGLE_GEOCODING_API_KEY = "test-geocode-key";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ results: [{ location: { latitude: 37.422, longitude: -122.084 } }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    const response = await GET(request("http://localhost/api/store-locator?q=1600%20Amphitheatre%20Parkway%20Mountain%20View%20CA&radiusMiles=100"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("geocode");
    expect(body.stores.some((store: { name: string }) => store.name.includes("San Francisco"))).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("https://geocode.googleapis.com/v4/geocode/address/"), expect.objectContaining({ headers: expect.objectContaining({ "X-Goog-Api-Key": "test-geocode-key" }) }));
  });

  it("reports missing Google Geocoding configuration for unknown address searches", async () => {
    env.GOOGLE_GEOCODING_API_KEY = "";
    const response = await GET(request("http://localhost/api/store-locator?q=unknown%20address"));
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body.code).toBe("GEOCODING_NOT_CONFIGURED");
  });
});
