import { addDays, subDays } from "date-fns";
import { buildLineItems, calculateTotals, orderApprovalThreshold, requiresOrderApproval } from "@/lib/business-rules";
import { makeId } from "@/lib/utils";
import { permissionsForRole } from "@/lib/permissions";
import type { Account, Address, AuditEvent, CartItem, CustomerLocation, Invoice, NotificationItem, Order, OrderStatus, PortalDocument, PortalUser, Product, Role, Session, Shipment, SupportCase } from "@/types/domain";

const baseDate = new Date("2026-09-18T09:00:00.000Z");
const categories = [
  ["Food Service", "Packaging"],
  ["Food Service", "Beverages"],
  ["Facilities", "Cleaning"],
  ["Facilities", "Safety"],
  ["Retail Operations", "Labels"],
  ["Retail Operations", "Point of Sale"],
  ["Office", "Paper"],
  ["Cold Chain", "Storage"]
] as const;
const units = ["case", "box", "roll", "pack", "each"] as const;

export const products: Product[] = Array.from({ length: 96 }, (_, index) => {
  const number = index + 1;
  const [category, subcategory] = categories[index % categories.length];
  const availability = number % 13 === 0 ? "OUT_OF_STOCK" : number % 7 === 0 ? "LOW_STOCK" : "IN_STOCK";
  const price = 18 + (number % 19) * 7.35;
  return {
    id: makeId("prod", number),
    sku: `B2B-${category.slice(0, 3).toUpperCase()}-${number.toString().padStart(4, "0")}`,
    name: `${subcategory} Supply ${number}`,
    description: `Commercial-grade ${subcategory.toLowerCase()} item for multi-location retailer purchasing teams.`,
    category,
    subcategory,
    price,
    currency: "USD",
    contractPrice: number % 4 === 0 ? Math.round(price * 92) / 100 : undefined,
    availability,
    unit: units[index % units.length],
    minOrderQuantity: number % 5 === 0 ? 3 : 1,
    inventory: availability === "OUT_OF_STOCK" ? 0 : availability === "LOW_STOCK" ? 8 + (number % 5) : 85 + number,
    leadTimeDays: availability === "LOW_STOCK" ? 5 : 2 + (number % 4),
    tags: [category, subcategory, number % 2 === 0 ? "contract" : "standard"],
    specifications: {
      Material: number % 2 === 0 ? "Recycled blend" : "Commercial grade",
      Pack: `${12 + (number % 6) * 4} per ${units[index % units.length]}`,
      Compliance: number % 3 === 0 ? "Food-safe" : "Retail operations approved"
    },
    locationInventory: [
      { locationId: "loc_0001", inventory: availability === "OUT_OF_STOCK" ? 0 : availability === "LOW_STOCK" ? 5 + (number % 4) : 55 + number, availability, leadTimeDays: availability === "LOW_STOCK" ? 5 : 2 + (number % 3) },
      { locationId: "loc_0002", inventory: number % 11 === 0 ? 0 : availability === "LOW_STOCK" ? 3 + (number % 3) : 35 + number, availability: number % 11 === 0 ? "OUT_OF_STOCK" : availability, leadTimeDays: number % 11 === 0 ? 10 : 3 + (number % 4) }
    ],
    documents: [
      { label: "Specification sheet", type: "specification", href: `/api/products/${makeId("prod", number)}/document/specification` },
      { label: "Safety sheet", type: "safety", href: `/api/products/${makeId("prod", number)}/document/safety` }
    ],
    relatedProductIds: []
  } satisfies Product;
}).map((product, index, list) => ({
  ...product,
  relatedProductIds: [list[(index + 1) % list.length].id, list[(index + 8) % list.length].id, list[(index + 16) % list.length].id]
}));

const addresses: Address[] = [
  { id: "addr_0001", label: "Headquarters", contactName: "Jordan Lee", line1: "100 Commerce Way", city: "Austin", region: "TX", postalCode: "78701", country: "US", type: "both", isDefault: true },
  { id: "addr_0002", label: "North Distribution Center", contactName: "Avery Stone", line1: "4200 Logistics Blvd", city: "Dallas", region: "TX", postalCode: "75201", country: "US", type: "shipping", isDefault: false },
  { id: "addr_0003", label: "Finance Office", contactName: "Morgan Patel", line1: "75 Market Street", line2: "Suite 300", city: "Denver", region: "CO", postalCode: "80202", country: "US", type: "billing", isDefault: false }
];

const users: PortalUser[] = [
  { id: "user_0001", name: "Jordan Lee", email: "admin@example.com", role: "account-admin", permissions: permissionsForRole("account-admin"), status: "ACTIVE", locationIds: ["loc_0001", "loc_0002"], lastActiveAt: subDays(baseDate, 1).toISOString() },
  { id: "user_0002", name: "Casey Buyer", email: "buyer@example.com", role: "buyer", permissions: permissionsForRole("buyer"), status: "ACTIVE", locationIds: ["loc_0001"], lastActiveAt: subDays(baseDate, 2).toISOString() },
  { id: "user_0003", name: "Finley Finance", email: "finance@example.com", role: "finance", permissions: permissionsForRole("finance"), status: "ACTIVE", locationIds: ["loc_0001", "loc_0002"], lastActiveAt: subDays(baseDate, 3).toISOString() },
  { id: "user_0004", name: "Riley Viewer", email: "viewer@example.com", role: "viewer", permissions: permissionsForRole("viewer"), status: "ACTIVE", locationIds: ["loc_0002"], lastActiveAt: subDays(baseDate, 5).toISOString() },
  { id: "user_0005", name: "Taylor Approver", email: "approver@example.com", role: "approver", permissions: permissionsForRole("approver"), status: "ACTIVE", locationIds: ["loc_0002"], lastActiveAt: subDays(baseDate, 1).toISOString() }
];

const defaultHours = { Monday: "8:00 AM - 6:00 PM", Tuesday: "8:00 AM - 6:00 PM", Wednesday: "8:00 AM - 6:00 PM", Thursday: "8:00 AM - 6:00 PM", Friday: "8:00 AM - 6:00 PM", Saturday: "9:00 AM - 3:00 PM", Sunday: "Closed" };
const locations: CustomerLocation[] = [
  { id: "loc_0001", name: "Central Retail Region", code: "CTR", addressId: "addr_0001", status: "ACTIVE", buyerIds: ["user_0001", "user_0002"], profile: { hours: defaultHours, phone: "(512) 555-0190", email: "central@example.com", contacts: [{ id: "contact_0001", name: "Jordan Lee", role: "Operations lead", email: "admin@example.com", phone: "(512) 555-0191" }], communicationPreferences: { orderUpdates: true, invoiceReminders: true, productAlerts: true }, publicationStatus: "CURRENT", updatedAt: subDays(baseDate, 3).toISOString() } },
  { id: "loc_0002", name: "Northwest Retail Region", code: "NWR", addressId: "addr_0002", status: "ACTIVE", buyerIds: ["user_0001", "user_0004"], profile: { hours: { ...defaultHours, Saturday: "Closed" }, phone: "(214) 555-0180", email: "northwest@example.com", contacts: [{ id: "contact_0002", name: "Avery Stone", role: "Fulfillment contact", email: "avery@example.com", phone: "(214) 555-0181" }], communicationPreferences: { orderUpdates: true, invoiceReminders: false, productAlerts: true }, publicationStatus: "PENDING_REVIEW", updatedAt: subDays(baseDate, 1).toISOString() } }
];

export const account: Account = {
  id: "acct_0001",
  companyName: "Retailer Portal Demo Account",
  accountNumber: "ACCT-10488",
  creditLimit: 250000,
  creditUsed: 83425.5,
  currency: "USD",
  paymentTerms: "Net 30",
  taxExempt: false,
  primaryContactId: "user_0001",
  addresses,
  locations,
  users
};

function createOrder(index: number, status: OrderStatus): Order {
  const cart: CartItem[] = [
    { productId: products[(index * 3) % products.length].id, quantity: 2 + (index % 4) },
    { productId: products[(index * 5 + 7) % products.length].id, quantity: 1 + (index % 3) }
  ];
  const lineItems = buildLineItems(cart, products);
  const locationId = locations[index % locations.length].id;
  const totals = calculateTotals(lineItems, account.taxExempt);
  const createdAt = subDays(baseDate, index * 3).toISOString();
  const shippedAt = addDays(new Date(createdAt), 4).toISOString();
  const deliveredAt = addDays(new Date(createdAt), 7).toISOString();
  const shipments: Shipment[] = ["FULFILLING", "SHIPPED", "DELIVERED"].includes(status) ? [{
    id: makeId("ship", index),
    orderId: makeId("ord", index),
    shipmentNumber: `ASN-${(39000 + index).toString()}`,
    status: status === "DELIVERED" ? "DELIVERED" : status === "SHIPPED" ? "SHIPPED" : "PICKING",
    carrier: index % 2 === 0 ? "Northstar Freight" : "Regional Carrier",
    trackingNumber: `TRK${(880000 + index).toString()}`,
    estimatedDeliveryDate: deliveredAt,
    shippedAt: ["SHIPPED", "DELIVERED"].includes(status) ? shippedAt : undefined,
    deliveredAt: status === "DELIVERED" ? deliveredAt : undefined,
    lineItems: lineItems.map((item) => ({ productId: item.productId, quantity: item.allocatedQuantity })),
    events: [
      { label: "Shipment prepared", at: addDays(new Date(createdAt), 2).toISOString() },
      ...(status === "SHIPPED" || status === "DELIVERED" ? [{ label: "Shipment tendered to carrier", at: shippedAt }] : []),
      ...(status === "DELIVERED" ? [{ label: "Delivered", at: deliveredAt }] : [])
    ]
  }] : [];
  return {
    id: makeId("ord", index),
    orderNumber: `SO-${(19000 + index).toString()}`,
    status,
    createdAt,
    updatedAt: addDays(new Date(createdAt), Math.min(index, 8)).toISOString(),
    requestedDeliveryDate: addDays(new Date(createdAt), 7 + (index % 5)).toISOString(),
    purchaseOrderNumber: `PO-${7000 + index}`,
    customerLocationId: locationId,
    shippingAddress: addresses[index % 2],
    billingAddress: addresses[2],
    lineItems,
    currency: "USD",
    shipments,
    documentIds: [makeId("doc", index), ...(shipments.length ? [makeId("doc", 100 + index)] : [])],
    approval: {
      required: status === "SUBMITTED" || status === "REJECTED" || requiresOrderApproval(totals.total),
      threshold: orderApprovalThreshold,
      decisions: []
    },
    timeline: [
      { status: "SUBMITTED", at: createdAt, label: "Order submitted" },
      ...(status !== "SUBMITTED" && status !== "REJECTED" ? [{ status: "APPROVED" as OrderStatus, at: addDays(new Date(createdAt), 1).toISOString(), label: "Credit and inventory approved" }] : []),
      ...(["FULFILLING", "SHIPPED", "DELIVERED"].includes(status) ? [{ status: "FULFILLING" as OrderStatus, at: addDays(new Date(createdAt), 2).toISOString(), label: "Warehouse fulfillment started" }] : []),
      ...(["SHIPPED", "DELIVERED"].includes(status) ? [{ status: "SHIPPED" as OrderStatus, at: addDays(new Date(createdAt), 4).toISOString(), label: "Shipment tendered to carrier" }] : []),
      ...(status === "DELIVERED" ? [{ status: "DELIVERED" as OrderStatus, at: addDays(new Date(createdAt), 7).toISOString(), label: "Delivered" }] : []),
      ...(status === "CANCELLED" ? [{ status: "CANCELLED" as OrderStatus, at: addDays(new Date(createdAt), 1).toISOString(), label: "Cancelled by account user" }] : []),
      ...(status === "REJECTED" ? [{ status: "REJECTED" as OrderStatus, at: addDays(new Date(createdAt), 1).toISOString(), label: "Rejected by approver" }] : [])
    ],
    ...totals
  };
}

const statuses: OrderStatus[] = ["SUBMITTED", "APPROVED", "FULFILLING", "SHIPPED", "DELIVERED", "CANCELLED", "REJECTED"];
export const orders: Order[] = Array.from({ length: 34 }, (_, index) => createOrder(index + 1, statuses[index % statuses.length]));

export const invoices: Invoice[] = orders.slice(0, 24).map((order, index) => {
  const status = index % 6 === 0 ? "OVERDUE" : index % 5 === 0 ? "PARTIALLY_PAID" : index % 4 === 0 ? "PAID" : "OPEN";
  const amount = order.total;
  return {
    id: makeId("inv", index + 1),
    invoiceNumber: `INV-${(55000 + index).toString()}`,
    orderId: order.id,
    status,
    invoiceDate: addDays(new Date(order.createdAt), 2).toISOString(),
    dueDate: addDays(new Date(order.createdAt), 32).toISOString(),
    amount,
    outstandingAmount: status === "PAID" ? 0 : status === "PARTIALLY_PAID" ? Math.round(amount * 0.4 * 100) / 100 : amount,
    currency: "USD",
    documentUrl: `/api/invoices/${makeId("inv", index + 1)}/document`
  } satisfies Invoice;
});

export const documents: PortalDocument[] = [
  ...orders.flatMap((order, index): PortalDocument[] => [
    { id: makeId("doc", index + 1), documentNumber: `ACK-${(29000 + index + 1).toString()}`, type: "ACKNOWLEDGEMENT", status: "AVAILABLE", title: `Order acknowledgement for ${order.orderNumber}`, orderId: order.id, locationId: order.customerLocationId, issuedAt: addDays(new Date(order.createdAt), 1).toISOString(), downloadUrl: `/api/documents/${makeId("doc", index + 1)}/download` },
    ...order.shipments.map((shipment) => ({ id: makeId("doc", 101 + index), documentNumber: shipment.shipmentNumber, type: "ASN" as const, status: "AVAILABLE" as const, title: `Advance shipment notice for ${order.orderNumber}`, orderId: order.id, locationId: order.customerLocationId, issuedAt: shipment.shippedAt ?? shipment.events[0]?.at ?? order.updatedAt, downloadUrl: `/api/documents/${makeId("doc", 101 + index)}/download` }))
  ]),
  ...invoices.map((invoice, index): PortalDocument => {
    const order = orders.find((candidate) => candidate.id === invoice.orderId);
    return { id: makeId("doc", 201 + index), documentNumber: invoice.invoiceNumber, type: "INVOICE", status: invoice.status === "VOID" ? "VOID" : "AVAILABLE", title: `Invoice ${invoice.invoiceNumber}`, orderId: invoice.orderId, invoiceId: invoice.id, locationId: order?.customerLocationId ?? "loc_0001", issuedAt: invoice.invoiceDate, dueAt: invoice.dueDate, amount: invoice.amount, outstandingAmount: invoice.outstandingAmount, currency: invoice.currency, downloadUrl: `/api/documents/${makeId("doc", 201 + index)}/download` };
  }),
  { id: "doc_credit_0001", documentNumber: "CR-12001", type: "CREDIT", status: "AVAILABLE", title: "Service credit for damaged shipment", orderId: orders[3]?.id, locationId: orders[3]?.customerLocationId ?? "loc_0001", issuedAt: subDays(baseDate, 11).toISOString(), amount: -124.5, outstandingAmount: 0, currency: "USD", downloadUrl: "/api/documents/doc_credit_0001/download" },
  { id: "doc_statement_0001", documentNumber: "STMT-2026-09", type: "STATEMENT", status: "AVAILABLE", title: "September account statement", locationId: "loc_0001", issuedAt: baseDate.toISOString(), amount: invoices.reduce((sum, invoice) => sum + invoice.outstandingAmount, 0), outstandingAmount: invoices.reduce((sum, invoice) => sum + invoice.outstandingAmount, 0), currency: "USD", downloadUrl: "/api/documents/doc_statement_0001/download" }
];

export const notifications: NotificationItem[] = [
  { id: "note_0001", category: "orders", title: "Order approved", message: "SO-19002 has moved to fulfillment.", href: "/orders/ord_0002", createdAt: subDays(baseDate, 1).toISOString() },
  { id: "note_0002", category: "invoices", title: "Invoice due soon", message: "INV-55003 is due in five days.", href: "/invoices/inv_0003", createdAt: subDays(baseDate, 2).toISOString() },
  { id: "note_0003", category: "catalog", title: "Contract price updated", message: "New contract pricing is available for packaging supplies.", href: "/products?category=Food%20Service", createdAt: subDays(baseDate, 4).toISOString(), readAt: subDays(baseDate, 3).toISOString() },
  { id: "note_0004", category: "account", title: "New user invited", message: "Taylor Approver has been invited to the account.", href: "/account/users", createdAt: subDays(baseDate, 6).toISOString(), readAt: subDays(baseDate, 5).toISOString() }
];

export const supportCases: SupportCase[] = [
  { id: "case_0001", subject: "Need delivery update", category: "order", priority: "normal", message: "Please confirm the expected delivery window for our open shipment.", status: "IN_PROGRESS", createdAt: subDays(baseDate, 1).toISOString() }
];

export const auditEvents: AuditEvent[] = [];

export const sessions = new Map<string, Session>();

export function getUserByEmail(email: string) {
  return account.users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.status !== "DISABLED");
}

export function categoriesList() {
  return Array.from(new Set(products.map((product) => product.category))).sort();
}

export function updateUserRole(id: string, role: Role) {
  const user = account.users.find((candidate) => candidate.id === id);
  if (!user) return undefined;
  user.role = role;
  user.permissions = permissionsForRole(role);
  return user;
}
