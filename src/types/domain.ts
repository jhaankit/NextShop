export type Permission =
  | "products.read"
  | "orders.read"
  | "orders.create"
  | "orders.cancel"
  | "orders.approve"
  | "invoices.read"
  | "customers.read"
  | "account.manage"
  | "users.manage";

export type Role = "account-admin" | "buyer" | "approver" | "finance" | "viewer";
export type Availability = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
export type OrderStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "FULFILLING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type InvoiceStatus = "OPEN" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "VOID";
export type NotificationCategory = "orders" | "invoices" | "account" | "support" | "system" | "catalog";
export type FulfillmentStatus = "PENDING" | "ALLOCATED" | "BACKORDERED" | "PICKING" | "SHIPPED" | "DELIVERED";
export type DocumentType = "ACKNOWLEDGEMENT" | "ASN" | "INVOICE" | "CREDIT" | "STATEMENT";
export type DocumentStatus = "AVAILABLE" | "PENDING" | "VOID";
export type SupportCaseStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface Money {
  amount: number;
  currency: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  currency: string;
  contractPrice?: number;
  availability: Availability;
  unit: string;
  minOrderQuantity: number;
  inventory: number;
  leadTimeDays: number;
  tags: string[];
  specifications: Record<string, string>;
  relatedProductIds: string[];
  locationInventory: Array<{ locationId: string; inventory: number; availability: Availability; leadTimeDays: number }>;
  documents: Array<{ label: string; type: "specification" | "safety" | "warranty"; href: string }>;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderLineItem {
  productId: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  fulfillmentStatus: FulfillmentStatus;
  allocatedQuantity: number;
  backorderedQuantity: number;
}

export interface Shipment {
  id: string;
  orderId: string;
  shipmentNumber: string;
  status: Extract<FulfillmentStatus, "PICKING" | "SHIPPED" | "DELIVERED">;
  carrier: string;
  trackingNumber: string;
  estimatedDeliveryDate: string;
  shippedAt?: string;
  deliveredAt?: string;
  lineItems: Array<{ productId: string; quantity: number }>;
  events: Array<{ label: string; at: string }>;
}

export type OrderApprovalAction = "approve" | "reject";

export interface OrderApprovalDecision {
  id: string;
  action: OrderApprovalAction;
  actorId: string;
  actorName: string;
  reason?: string;
  decidedAt: string;
}

export interface Address {
  id: string;
  label: string;
  contactName: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  type: "shipping" | "billing" | "both";
  isDefault: boolean;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: Omit<Address, "id" | "contactName" | "type" | "isDefault">;
  position: GeoPoint;
  phone: string;
  email: string;
  hours: Record<string, string>;
  services: string[];
  distanceMiles?: number;
}

export interface StoreLocatorResponse {
  stores: StoreLocation[];
  center: GeoPoint;
  query?: string;
  radiusMiles: number;
  source: "default" | "coordinates" | "geocode" | "fixture";
}

export interface CustomerLocation {
  id: string;
  name: string;
  code: string;
  addressId: string;
  status: "ACTIVE" | "ON_HOLD";
  buyerIds: string[];
  profile: StoreProfile;
}

export interface ResponsibilityContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface StoreProfile {
  hours: Record<string, string>;
  phone: string;
  email: string;
  contacts: ResponsibilityContact[];
  communicationPreferences: {
    orderUpdates: boolean;
    invoiceReminders: boolean;
    productAlerts: boolean;
  };
  publicationStatus: "CURRENT" | "PENDING_REVIEW";
  updatedAt: string;
}

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
  status: "ACTIVE" | "INVITED" | "DISABLED";
  locationIds: string[];
  lastActiveAt?: string;
}

export interface Account {
  id: string;
  companyName: string;
  accountNumber: string;
  creditLimit: number;
  creditUsed: number;
  currency: string;
  paymentTerms: string;
  taxExempt: boolean;
  primaryContactId: string;
  addresses: Address[];
  locations: CustomerLocation[];
  users: PortalUser[];
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  requestedDeliveryDate?: string;
  purchaseOrderNumber: string;
  customerLocationId: string;
  shippingAddress: Address;
  billingAddress: Address;
  lineItems: OrderLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  shipments: Shipment[];
  documentIds: string[];
  approval: {
    required: boolean;
    threshold: number;
    decisions: OrderApprovalDecision[];
  };
  timeline: Array<{ status: OrderStatus; at: string; label: string }>;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  outstandingAmount: number;
  currency: string;
  documentUrl: string;
}

export interface PortalDocument {
  id: string;
  documentNumber: string;
  type: DocumentType;
  status: DocumentStatus;
  title: string;
  orderId?: string;
  invoiceId?: string;
  locationId: string;
  issuedAt: string;
  dueAt?: string;
  amount?: number;
  outstandingAmount?: number;
  currency?: string;
  downloadUrl: string;
}

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  href: string;
  createdAt: string;
  readAt?: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface Session {
  user: PortalUser;
  expiresAt: string;
}

export interface DashboardSummary {
  account: Account;
  openOrders: number;
  outstandingInvoices: number;
  outstandingBalance: number;
  pendingApprovals: number;
  recentOrders: Order[];
  pendingShipments: Shipment[];
  recentDocuments: PortalDocument[];
  recentActivity: Array<{ id: string; label: string; at: string; href: string }>;
  notifications: NotificationItem[];
}

export interface SupportCase {
  id: string;
  subject: string;
  category: "order" | "invoice" | "catalog" | "account" | "technical";
  priority: "low" | "normal" | "high";
  message: string;
  status: SupportCaseStatus;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  at: string;
}

export interface ApiErrorShape {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
