import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const passwordResetSchema = z.object({
  email: z.email("Enter a valid email address"),
  relationship: z.enum(["retailer", "national-account"])
});

export const addressSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(2),
  contactName: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  region: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2),
  type: z.enum(["shipping", "billing", "both"]),
  isDefault: z.boolean().default(false)
});

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  email: z.email(),
  role: z.enum(["account-admin", "buyer", "approver", "finance", "viewer"]),
  status: z.enum(["ACTIVE", "INVITED", "DISABLED"]).default("INVITED"),
  locationIds: z.array(z.string()).default([])
});

export const storeProfileSchema = z.object({
  locationId: z.string().min(1),
  phone: z.string().min(7),
  email: z.email(),
  weekdayHours: z.string().min(3),
  weekendHours: z.string().min(3),
  orderUpdates: z.boolean().default(true),
  invoiceReminders: z.boolean().default(true),
  productAlerts: z.boolean().default(true),
  contactName: z.string().min(2),
  contactRole: z.string().min(2),
  contactEmail: z.email(),
  contactPhone: z.string().min(7)
});

export const checkoutSchema = z.object({
  purchaseOrderNumber: z.string().min(3, "Enter a purchase order number"),
  customerLocationId: z.string().min(1, "Choose a location"),
  shippingAddressId: z.string().min(1, "Choose a shipping address"),
  billingAddressId: z.string().min(1, "Choose a billing address"),
  requestedDeliveryDate: z.string().optional(),
  notes: z.string().max(500).optional()
});

export const orderDecisionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("reject"), reason: z.string().trim().min(5, "Enter a rejection reason") })
]);

export const supportCaseSchema = z.object({
  subject: z.string().min(5),
  category: z.enum(["order", "invoice", "catalog", "account", "technical"]),
  message: z.string().min(20),
  priority: z.enum(["low", "normal", "high"]).default("normal")
});

export const listQuerySchema = z.object({
  q: z.string().optional().default(""),
  category: z.string().optional(),
  availability: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  locationId: z.string().optional(),
  sort: z.string().optional().default("relevance"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(12),
  view: z.enum(["grid", "table"]).optional().default("grid")
});

const optionalQueryNumber = (schema: z.ZodNumber) =>
  z.preprocess((value) => (value === "" || value === undefined ? undefined : value), z.coerce.number().pipe(schema).optional());

export const storeLocatorQuerySchema = z
  .object({
    q: z.string().trim().max(120, "Search must be 120 characters or fewer.").optional().default(""),
    lat: optionalQueryNumber(z.number().min(-90).max(90)),
    lng: optionalQueryNumber(z.number().min(-180).max(180)),
    radiusMiles: optionalQueryNumber(z.number().positive().max(500)).default(100),
    limit: optionalQueryNumber(z.number().int().positive().max(50)).default(25)
  })
  .superRefine((value, context) => {
    if ((value.lat === undefined) !== (value.lng === undefined)) {
      context.addIssue({ code: "custom", message: "Latitude and longitude must be provided together.", path: ["lat"] });
    }
  });

export type LoginInput = z.output<typeof loginSchema>;
export type PasswordResetInput = z.output<typeof passwordResetSchema>;
export type CheckoutInput = z.output<typeof checkoutSchema>;
export type OrderDecisionInput = z.output<typeof orderDecisionSchema>;
export type AddressInput = z.output<typeof addressSchema>;
export type AddressFormValues = z.input<typeof addressSchema>;
export type UserInput = z.output<typeof userSchema>;
export type UserFormValues = z.input<typeof userSchema>;
export type SupportCaseInput = z.output<typeof supportCaseSchema>;
export type SupportCaseFormValues = z.input<typeof supportCaseSchema>;
export type StoreProfileInput = z.output<typeof storeProfileSchema>;
export type StoreProfileFormValues = z.input<typeof storeProfileSchema>;
export type StoreLocatorQueryInput = z.output<typeof storeLocatorQuerySchema>;
