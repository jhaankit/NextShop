import { describe, expect, it } from "vitest";
import { buildLineItems, calculateTotals, canApproveOrder, canCancelOrder, canRejectOrder, orderApprovalThreshold, requiresOrderApproval, validateCart } from "@/lib/business-rules";
import { products } from "@/mocks/data";

describe("business rules", () => {
  it("calculates totals with discounts and tax", () => {
    const lineItems = buildLineItems([{ productId: products[0].id, quantity: 100 }], products);
    const totals = calculateTotals(lineItems, false);
    expect(totals.subtotal).toBeGreaterThan(0);
    expect(totals.total).toBeGreaterThan(totals.subtotal - totals.discount);
  });
  it("validates inventory and cancellation states", () => {
    const out = products.find((product) => product.availability === "OUT_OF_STOCK");
    expect(out).toBeDefined();
    if (out) expect(validateCart([{ productId: out.id, quantity: 1 }], products)[0]?.code).toBe("UNAVAILABLE");
    expect(canCancelOrder("APPROVED")).toBe(true);
    expect(canCancelOrder("SHIPPED")).toBe(false);
  });

  it("requires approval only above the configured threshold", () => {
    expect(requiresOrderApproval(orderApprovalThreshold)).toBe(false);
    expect(requiresOrderApproval(orderApprovalThreshold + 0.01)).toBe(true);
    expect(canApproveOrder("SUBMITTED")).toBe(true);
    expect(canRejectOrder("SUBMITTED")).toBe(true);
    expect(canApproveOrder("APPROVED")).toBe(false);
    expect(canRejectOrder("REJECTED")).toBe(false);
  });
});
