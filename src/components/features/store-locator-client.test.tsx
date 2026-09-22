import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StoreLocatorClient } from "@/components/features/store-locator-client";

const navigation = vi.hoisted(() => ({
  params: new URLSearchParams(),
  push: vi.fn()
}));

vi.mock("next/dynamic", () => ({
  default: () => function DynamicMap() {
    return <div>Map panel</div>;
  }
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/store-locator",
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => navigation.params
}));

function renderLocator() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <StoreLocatorClient googleMapsApiKey="" mapId="DEMO_MAP_ID" />
    </QueryClientProvider>
  );
}

describe("StoreLocatorClient", () => {
  beforeEach(() => {
    navigation.params = new URLSearchParams();
    navigation.push.mockClear();
  });

  it("renders store results and submits address searches", async () => {
    const user = userEvent.setup();
    renderLocator();

    expect(await screen.findByText("Harbor Paint & Design - Austin")).toBeInTheDocument();
    await user.type(screen.getByLabelText(/address, city, state, or zip/i), "Austin, TX");
    await user.click(screen.getByRole("button", { name: /search stores/i }));

    expect(navigation.push).toHaveBeenCalledWith(expect.stringContaining("/store-locator?q=Austin"));
  });

  it("shows a helpful message when current location is unavailable", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((_success, error: PositionErrorCallback) => error({ code: 1, message: "Denied", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 }))
      }
    });

    renderLocator();
    await screen.findByText("Harbor Paint & Design - Austin");
    await user.click(screen.getByRole("button", { name: /use my current location/i }));

    expect(await screen.findByText(/Location permission was denied or unavailable/)).toBeInTheDocument();
  });
});
