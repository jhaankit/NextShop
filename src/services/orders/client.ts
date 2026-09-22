import { apiFetch, toQueryString } from "@/services/http";
import type { CartItem, ListResponse, Order } from "@/types/domain";
import type { CheckoutInput, OrderDecisionInput } from "@/schemas/forms";

export const ordersService = {
  getOrders: (query: Record<string, string | number | undefined> = {}) => apiFetch<ListResponse<Order>>(`/api/orders${toQueryString(query)}`),
  getApprovals: (query: Record<string, string | number | undefined> = {}) => apiFetch<ListResponse<Order>>(`/api/approvals${toQueryString(query)}`),
  getOrder: (id: string) => apiFetch<Order>(`/api/orders/${id}`),
  createOrder: (payload: CheckoutInput & { items: CartItem[]; idempotencyKey?: string }) => apiFetch<Order>("/api/orders", { method: "POST", body: JSON.stringify(payload) }),
  cancelOrder: (id: string) => apiFetch<Order>(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify({ action: "cancel" }) }),
  decideOrder: (id: string, payload: OrderDecisionInput) => apiFetch<Order>(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
};
