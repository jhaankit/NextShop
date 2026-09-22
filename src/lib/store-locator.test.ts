import { describe, expect, it } from "vitest";
import { defaultStoreResults, distanceMiles, findFixtureCenter, storesNearCenter } from "@/lib/store-locator";
import { storeLocations } from "@/mocks/store-locations";

describe("store locator helpers", () => {
  it("calculates distance in miles", () => {
    const austin = { lat: 30.2672, lng: -97.7431 };
    const dallas = { lat: 32.7767, lng: -96.797 };
    expect(distanceMiles(austin, dallas)).toBeGreaterThan(180);
    expect(distanceMiles(austin, dallas)).toBeLessThan(200);
  });

  it("returns nearby stores sorted by distance", () => {
    const stores = storesNearCenter(storeLocations, { lat: 30.2672, lng: -97.7431 }, 250, 10);
    expect(stores[0]?.name).toContain("Austin");
    expect(stores.some((store) => store.name.includes("Dallas"))).toBe(true);
    expect(stores.every((store) => store.distanceMiles !== undefined && store.distanceMiles <= 250)).toBe(true);
  });

  it("resolves fixture centers and default store ordering", () => {
    expect(findFixtureCenter("78704", storeLocations)).toEqual(storeLocations[0]?.position);
    expect(defaultStoreResults(storeLocations, 2)).toHaveLength(2);
  });
});
