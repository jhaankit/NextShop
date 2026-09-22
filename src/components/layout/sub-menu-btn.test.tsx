import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PackageSearch } from "lucide-react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { SubMenuBtn } from "@/components/layout/sub-menu-btn";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("SubMenuBtn", () => {
  beforeAll(() => {
    globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
  });

  it("opens the product submenu and dismisses it with Escape", async () => {
    const user = userEvent.setup();
    render(<SubMenuBtn label="Products" icon={PackageSearch} />);

    const trigger = screen.getByRole("button", { name: "Products menu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Products submenu" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all products" })).toHaveAttribute("href", "/products");
    expect(screen.getByRole("link", { name: "Food Service" })).toHaveAttribute("href", "/products?category=Food+Service");
    expect(screen.getByRole("link", { name: "Packaging" })).toHaveAttribute("href", "/products?category=Food+Service&q=Packaging");

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("region", { name: "Products submenu" })).not.toBeInTheDocument());
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes and calls onNavigate after a submenu link is selected", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<SubMenuBtn label="Products" icon={PackageSearch} onNavigate={onNavigate} />);

    await user.click(screen.getByRole("button", { name: "Products menu" }));
    const contractLink = screen.getByRole("link", { name: /Contract favorites/ });
    contractLink.addEventListener("click", (event) => event.preventDefault());
    await user.click(contractLink);

    expect(onNavigate).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("region", { name: "Products submenu" })).not.toBeInTheDocument());
  });
});
