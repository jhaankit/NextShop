import { describe, expect, it } from "vitest";
import { mockRepository } from "@/mocks/repository";
import { account } from "@/mocks/data";
import { orderApprovalThreshold, unitPrice } from "@/lib/business-rules";

describe("mockRepository workflow linkage", () => {
  it("previews active-location cart inventory and totals", () => {
    const product = mockRepository.products.list("loc_0001")[0];
    const preview = mockRepository.orders.preview({ locationId: "loc_0001", items: [{ productId: product.id, quantity: product.minOrderQuantity }] });
    expect(preview.issues).toHaveLength(0);
    expect(preview.lineItems[0]?.allocatedQuantity).toBeGreaterThan(0);
    expect(preview.totals.total).toBeGreaterThan(0);
  });

  it("creates an order acknowledgement document and notification", () => {
    const product = mockRepository.products.list("loc_0001").find((item) => item.availability !== "OUT_OF_STOCK");
    expect(product).toBeDefined();
    if (!product) return;
    const result = mockRepository.orders.create({
      purchaseOrderNumber: "PO-UNIT-100",
      customerLocationId: "loc_0001",
      shippingAddressId: account.addresses[0].id,
      billingAddressId: account.addresses[2].id,
      items: [{ productId: product.id, quantity: product.minOrderQuantity }]
    }, "user_0001");
    expect("order" in result).toBe(true);
    if ("order" in result) {
      expect(result.order.documentIds).toHaveLength(1);
      expect(mockRepository.documents.byId(result.order.documentIds[0]!)).toMatchObject({ type: "ACKNOWLEDGEMENT", orderId: result.order.id });
    }
  });

  it("holds high-value orders for approval", () => {
    const product = mockRepository.products.list("loc_0001").find((item) => item.availability !== "OUT_OF_STOCK" && unitPrice(item) * item.inventory > orderApprovalThreshold);
    expect(product).toBeDefined();
    if (!product) return;
    const quantity = Math.ceil((orderApprovalThreshold + 100) / unitPrice(product));
    const result = mockRepository.orders.create({
      purchaseOrderNumber: "PO-APPROVAL-100",
      customerLocationId: "loc_0001",
      shippingAddressId: account.addresses[0].id,
      billingAddressId: account.addresses[2].id,
      items: [{ productId: product.id, quantity }]
    }, "user_0002");
    expect("order" in result).toBe(true);
    if ("order" in result) {
      expect(result.order.status).toBe("SUBMITTED");
      expect(result.order.approval).toMatchObject({ required: true, threshold: orderApprovalThreshold, decisions: [] });
      expect(mockRepository.orders.pendingApprovals("loc_0001").some((order) => order.id === result.order.id)).toBe(true);
    }
  });

  it("records approval and rejection decisions once", () => {
    const approvalTarget = mockRepository.orders.pendingApprovals("loc_0002")[0];
    expect(approvalTarget).toBeDefined();
    if (!approvalTarget) return;
    const before = mockRepository.dashboard.summary("loc_0002").pendingApprovals;
    const approved = mockRepository.orders.decide(approvalTarget.id, { action: "approve" }, "user_0005");
    expect(approved?.status).toBe("APPROVED");
    expect(approved?.approval.decisions[0]).toMatchObject({ action: "approve", actorId: "user_0005", actorName: "Taylor Approver" });
    expect(mockRepository.dashboard.summary("loc_0002").pendingApprovals).toBe(before - 1);
    const duplicate = mockRepository.orders.decide(approvalTarget.id, { action: "reject", reason: "Submitted by mistake" }, "user_0005");
    expect(duplicate?.status).toBe("APPROVED");
    expect(duplicate?.approval.decisions).toHaveLength(1);

    const rejectionTarget = mockRepository.orders.pendingApprovals("loc_0002")[0];
    expect(rejectionTarget).toBeDefined();
    if (!rejectionTarget) return;
    const rejected = mockRepository.orders.decide(rejectionTarget.id, { action: "reject", reason: "Budget owner declined" }, "user_0005");
    expect(rejected?.status).toBe("REJECTED");
    expect(rejected?.approval.decisions[0]).toMatchObject({ action: "reject", reason: "Budget owner declined" });
    expect(mockRepository.notifications.list()[0]).toMatchObject({ title: "Order rejected", href: `/orders/${rejectionTarget.id}` });
  });

  it("updates location profile and persists support cases", () => {
    const profile = mockRepository.account.saveProfile({
      locationId: "loc_0001",
      phone: "(555) 010-1000",
      email: "central-updated@example.com",
      weekdayHours: "8:00 AM - 5:00 PM",
      weekendHours: "Closed",
      orderUpdates: true,
      invoiceReminders: false,
      productAlerts: true,
      contactName: "Morgan Lee",
      contactRole: "Store contact",
      contactEmail: "morgan@example.com",
      contactPhone: "(555) 010-1001"
    }, "user_0001");
    expect(profile?.publicationStatus).toBe("PENDING_REVIEW");
    const supportCase = mockRepository.support.create({ subject: "Shipment question", category: "order", message: "Please help with the shipment timing for this order.", priority: "normal" }, "user_0001");
    expect(mockRepository.support.list()[0]).toMatchObject({ id: supportCase.id, status: "OPEN" });
  });
});
