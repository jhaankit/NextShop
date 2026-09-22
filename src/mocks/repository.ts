import { addDays } from "date-fns";
import { buildLineItems, calculateTotals, canApproveOrder, canCancelOrder, canRejectOrder, chooseAddress, orderApprovalThreshold, requiresOrderApproval, validateCart } from "@/lib/business-rules";
import { account, auditEvents, categoriesList, documents, invoices, notifications, orders, products, supportCases } from "@/mocks/data";
import { permissionsForRole } from "@/lib/permissions";
import type { CartValidationIssue } from "@/lib/business-rules";
import type { Address, CartItem, Invoice, NotificationItem, Order, OrderApprovalAction, PortalDocument, Product, Role, StoreProfile, SupportCase } from "@/types/domain";
import type { AddressInput, CheckoutInput, OrderDecisionInput, StoreProfileInput, SupportCaseInput, UserInput } from "@/schemas/forms";

function productForLocation(product: Product, locationId?: string): Product {
  const stock = product.locationInventory.find((item) => item.locationId === locationId) ?? product.locationInventory[0];
  if (!stock) return product;
  return { ...product, inventory: stock.inventory, availability: stock.availability, leadTimeDays: stock.leadTimeDays };
}

function filterByLocation<T extends { customerLocationId?: string; locationId?: string }>(items: T[], locationId?: string) {
  if (!locationId) return items;
  return items.filter((item) => item.customerLocationId === locationId || item.locationId === locationId);
}

function audit(actorId: string, action: string, entityType: string, entityId: string) {
  auditEvents.unshift({ id: `audit_${(auditEvents.length + 1).toString().padStart(4, "0")}`, actorId, action, entityType, entityId, at: new Date().toISOString() });
}

function actorName(actorId: string) {
  return account.users.find((user) => user.id === actorId)?.name ?? "System";
}

function notifyOrderDecision(order: Order, action: OrderApprovalAction, reason?: string) {
  const approved = action === "approve";
  notifications.unshift({
    id: `note_${(notifications.length + 1).toString().padStart(4, "0")}`,
    category: "orders",
    title: approved ? "Order approved" : "Order rejected",
    message: approved ? `${order.orderNumber} has been approved and is ready for fulfillment.` : `${order.orderNumber} was rejected.${reason ? ` Reason: ${reason}` : ""}`,
    href: `/orders/${order.id}`,
    createdAt: new Date().toISOString()
  });
}

export const mockRepository = {
  dashboard: {
    summary: (locationId?: string) => {
      const locationOrders = filterByLocation(orders, locationId);
      const locationDocuments = filterByLocation(documents, locationId);
      const invoiceIds = new Set(locationDocuments.filter((document) => document.type === "INVOICE").map((document) => document.invoiceId));
      const outstanding = invoices.filter((invoice) => invoice.outstandingAmount > 0 && (!locationId || invoiceIds.has(invoice.id)));
      return {
        account,
        openOrders: locationOrders.filter((order) => !["DELIVERED", "CANCELLED", "REJECTED"].includes(order.status)).length,
        outstandingInvoices: outstanding.length,
        outstandingBalance: outstanding.reduce((sum, invoice) => sum + invoice.outstandingAmount, 0),
        pendingApprovals: locationOrders.filter((order) => order.status === "SUBMITTED").length,
        recentOrders: locationOrders.slice(0, 5),
        pendingShipments: locationOrders.flatMap((order) => order.shipments).filter((shipment) => shipment.status !== "DELIVERED").slice(0, 4),
        recentDocuments: locationDocuments.slice(0, 4),
        recentActivity: [
          { id: "activity_1", label: "Contract catalog refreshed", at: notifications[2]?.createdAt ?? new Date().toISOString(), href: "/products" },
          { id: "activity_2", label: "Payment terms reviewed", at: invoices[0]?.invoiceDate ?? new Date().toISOString(), href: "/account" },
          { id: "activity_3", label: "Order SO-19002 approved", at: orders[1]?.updatedAt ?? new Date().toISOString(), href: "/orders/ord_0002" }
        ],
        notifications: notifications.slice(0, 4)
      };
    }
  },
  products: {
    list: (locationId?: string) => products.map((product) => productForLocation(product, locationId)),
    categories: categoriesList,
    byId: (id: string, locationId?: string) => {
      const product = products.find((candidate) => candidate.id === id);
      return product ? productForLocation(product, locationId) : undefined;
    },
    related: (product: Product) => product.relatedProductIds.map((id) => products.find((candidate) => candidate.id === id)).filter((item) => item !== undefined)
  },
  orders: {
    list: (locationId?: string) => filterByLocation([...orders], locationId),
    pendingApprovals: (locationId?: string) => filterByLocation([...orders], locationId).filter((order) => order.status === "SUBMITTED"),
    byId: (id: string) => orders.find((order) => order.id === id),
    preview: (payload: { items: CartItem[]; locationId?: string }): { issues: CartValidationIssue[]; lineItems: Order["lineItems"]; totals: ReturnType<typeof calculateTotals> } => {
      const locationProducts = mockRepository.products.list(payload.locationId);
      const issues = validateCart(payload.items, locationProducts);
      const validItems = payload.items.filter((item) => locationProducts.some((product) => product.id === item.productId));
      const lineItems = buildLineItems(validItems, locationProducts);
      return { issues, lineItems, totals: calculateTotals(lineItems, account.taxExempt) };
    },
    create: (payload: CheckoutInput & { items: CartItem[]; idempotencyKey?: string }, actorId = "system"): { issues: CartValidationIssue[] } | { order: Order } => {
      const locationProducts = mockRepository.products.list(payload.customerLocationId);
      const issues = validateCart(payload.items, locationProducts);
      if (issues.length > 0) return { issues };
      const lineItems = buildLineItems(payload.items, locationProducts);
      const totals = calculateTotals(lineItems, account.taxExempt);
      const requiresApproval = requiresOrderApproval(totals.total);
      const now = new Date();
      const id = `ord_${(orders.length + 1).toString().padStart(4, "0")}`;
      const order: Order = {
        id,
        orderNumber: `SO-${19000 + orders.length + 1}`,
        status: requiresApproval ? "SUBMITTED" : "APPROVED",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        requestedDeliveryDate: payload.requestedDeliveryDate,
        purchaseOrderNumber: payload.purchaseOrderNumber,
        customerLocationId: payload.customerLocationId,
        shippingAddress: chooseAddress(account.addresses, payload.shippingAddressId),
        billingAddress: chooseAddress(account.addresses, payload.billingAddressId),
        lineItems,
        currency: "USD",
        shipments: [],
        documentIds: [`doc_${(documents.length + 1).toString().padStart(4, "0")}`],
        approval: {
          required: requiresApproval,
          threshold: orderApprovalThreshold,
          decisions: []
        },
        timeline: [{ status: "SUBMITTED", at: now.toISOString(), label: "Order submitted" }],
        ...totals
      };
      if (order.status === "APPROVED") order.timeline.push({ status: "APPROVED", at: addDays(now, 0).toISOString(), label: "Automatically approved against account rules" });
      orders.unshift(order);
      const acknowledgement: PortalDocument = { id: order.documentIds[0]!, documentNumber: `ACK-${order.orderNumber.replace("SO-", "")}`, type: "ACKNOWLEDGEMENT", status: "AVAILABLE", title: `Order acknowledgement for ${order.orderNumber}`, orderId: order.id, locationId: order.customerLocationId, issuedAt: now.toISOString(), downloadUrl: `/api/documents/${order.documentIds[0]}/download` };
      documents.unshift(acknowledgement);
      notifications.unshift({ id: `note_${(notifications.length + 1).toString().padStart(4, "0")}`, category: "orders", title: "Order submitted", message: `${order.orderNumber} is available with acknowledgement ${acknowledgement.documentNumber}.`, href: `/orders/${order.id}`, createdAt: now.toISOString() });
      audit(actorId, "order.create", "order", order.id);
      return { order };
    },
    decide: (id: string, payload: OrderDecisionInput, actorId = "system") => {
      const order = orders.find((candidate) => candidate.id === id);
      if (!order) return undefined;
      const transitionAllowed = payload.action === "approve" ? canApproveOrder(order.status) : canRejectOrder(order.status);
      if (!transitionAllowed) return order;
      const now = new Date().toISOString();
      const reason = "reason" in payload ? payload.reason.trim() : undefined;
      order.status = payload.action === "approve" ? "APPROVED" : "REJECTED";
      order.updatedAt = now;
      order.approval = {
        required: order.approval?.required ?? true,
        threshold: order.approval?.threshold ?? orderApprovalThreshold,
        decisions: [
          ...(order.approval?.decisions ?? []),
          {
            id: `approval_${(order.approval?.decisions.length ?? 0) + 1}`,
            action: payload.action,
            actorId,
            actorName: actorName(actorId),
            reason,
            decidedAt: now
          }
        ]
      };
      order.timeline.push({
        status: order.status,
        at: now,
        label: payload.action === "approve" ? "Approved by account approver" : `Rejected by account approver${reason ? `: ${reason}` : ""}`
      });
      notifyOrderDecision(order, payload.action, reason);
      audit(actorId, `order.${payload.action}`, "order", order.id);
      return order;
    },
    cancel: (id: string, actorId = "system") => {
      const order = orders.find((candidate) => candidate.id === id);
      if (!order) return undefined;
      if (!canCancelOrder(order.status)) return order;
      order.status = "CANCELLED";
      order.updatedAt = new Date().toISOString();
      order.timeline.push({ status: "CANCELLED", at: order.updatedAt, label: "Cancelled by account user" });
      audit(actorId, "order.cancel", "order", order.id);
      return order;
    }
  },
  invoices: {
    list: (locationId?: string) => {
      if (!locationId) return [...invoices];
      const invoiceIds = new Set(filterByLocation(documents, locationId).filter((document) => document.type === "INVOICE").map((document) => document.invoiceId));
      return invoices.filter((invoice) => invoiceIds.has(invoice.id));
    },
    byId: (id: string): Invoice | undefined => invoices.find((invoice) => invoice.id === id)
  },
  documents: {
    list: (query: { q?: string; type?: string; status?: string; locationId?: string } = {}) => {
      const q = query.q?.trim().toLowerCase() ?? "";
      return filterByLocation([...documents], query.locationId).filter((document) => {
        const matchesSearch = !q || `${document.documentNumber} ${document.title} ${document.type}`.toLowerCase().includes(q);
        const matchesType = !query.type || document.type === query.type;
        const matchesStatus = !query.status || document.status === query.status;
        return matchesSearch && matchesType && matchesStatus;
      });
    },
    byId: (id: string) => documents.find((document) => document.id === id)
  },
  account: {
    get: () => account,
    locations: () => [...account.locations],
    locationById: (id: string) => account.locations.find((location) => location.id === id),
    saveProfile: (payload: StoreProfileInput, actorId = "system"): StoreProfile | undefined => {
      const location = account.locations.find((candidate) => candidate.id === payload.locationId);
      if (!location) return undefined;
      location.profile = {
        ...location.profile,
        phone: payload.phone,
        email: payload.email,
        hours: { Monday: payload.weekdayHours, Tuesday: payload.weekdayHours, Wednesday: payload.weekdayHours, Thursday: payload.weekdayHours, Friday: payload.weekdayHours, Saturday: payload.weekendHours, Sunday: payload.weekendHours },
        communicationPreferences: { orderUpdates: payload.orderUpdates, invoiceReminders: payload.invoiceReminders, productAlerts: payload.productAlerts },
        contacts: [{ id: location.profile.contacts[0]?.id ?? `contact_${Date.now()}`, name: payload.contactName, role: payload.contactRole, email: payload.contactEmail, phone: payload.contactPhone }],
        publicationStatus: "PENDING_REVIEW",
        updatedAt: new Date().toISOString()
      };
      audit(actorId, "profile.update", "location", location.id);
      return location.profile;
    },
    saveAddress: (payload: AddressInput): Address => {
      const address = { ...payload, id: payload.id ?? `addr_${(account.addresses.length + 1).toString().padStart(4, "0")}` };
      const index = account.addresses.findIndex((candidate) => candidate.id === address.id);
      if (index >= 0) account.addresses[index] = address;
      else account.addresses.push(address);
      return address;
    },
    saveUser: (payload: UserInput, actorId = "system") => {
      const user = { ...payload, id: payload.id ?? `user_${(account.users.length + 1).toString().padStart(4, "0")}`, permissions: permissionsForRole(payload.role as Role) };
      const index = account.users.findIndex((candidate) => candidate.id === user.id);
      if (index >= 0) account.users[index] = user;
      else account.users.push(user);
      audit(actorId, "user.save", "user", user.id);
      return user;
    }
  },
  notifications: {
    list: () => [...notifications],
    markRead: (id: string) => {
      const notification = notifications.find((candidate) => candidate.id === id);
      if (!notification) return undefined;
      notification.readAt = notification.readAt ?? new Date().toISOString();
      return notification;
    },
    markAllRead: (): NotificationItem[] => {
      const now = new Date().toISOString();
      notifications.forEach((notification) => { notification.readAt = notification.readAt ?? now; });
      return notifications;
    }
  },
  support: {
    list: (): SupportCase[] => [...supportCases],
    create: (payload: SupportCaseInput, actorId = "system") => {
      const supportCase: SupportCase = { ...payload, id: `case_${(supportCases.length + 1).toString().padStart(4, "0")}`, status: "OPEN", createdAt: new Date().toISOString() };
      supportCases.unshift(supportCase);
      notifications.unshift({ id: `note_${(notifications.length + 1).toString().padStart(4, "0")}`, category: "support", title: "Support case opened", message: `${supportCase.id} is now open.`, href: "/support", createdAt: supportCase.createdAt });
      audit(actorId, "support.create", "support-case", supportCase.id);
      return supportCase;
    }
  }
};
