import { apiFetch } from "@/services/http";
import type { CartValidationIssue } from "@/lib/business-rules";
import type { CartItem, OrderLineItem } from "@/types/domain";

export const cartService = {
  preview: (payload: { items: CartItem[]; locationId?: string }) => apiFetch<{ issues: CartValidationIssue[]; lineItems: OrderLineItem[]; totals: { subtotal: number; discount: number; tax: number; shipping: number; total: number } }>("/api/cart/preview", { method: "POST", body: JSON.stringify(payload) })
};
