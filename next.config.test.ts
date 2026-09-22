import { describe, expect, it } from "vitest";
import { securityHeaders } from "./next.config";

function header(name: string) {
  return securityHeaders.find((item) => item.key === name)?.value ?? "";
}

describe("security headers", () => {
  it("allows same-origin geolocation for the locator", () => {
    expect(header("Permissions-Policy")).toContain("geolocation=(self)");
  });

  it("allows the Google Maps origins required by the locator", () => {
    const csp = header("Content-Security-Policy");
    expect(csp).toContain("https://maps.googleapis.com");
    expect(csp).toContain("https://maps.gstatic.com");
    expect(csp).toContain("https://geocode.googleapis.com");
    expect(csp).toContain("frame-ancestors 'none'");
  });
});
