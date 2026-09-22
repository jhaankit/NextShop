import { NextRequest } from "next/server";
import { apiError, apiJson, parseJson, requireApiSession, validationError } from "@/app/api/_lib";
import { canApproveOrder, canCancelOrder, canRejectOrder } from "@/lib/business-rules";
import { mockRepository } from "@/mocks/repository";
import { orderDecisionSchema } from "@/schemas/forms";
import type { Permission } from "@/types/domain";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = requireApiSession(request, ["orders.read"]);
  if (session instanceof Response) return session;
  const { id } = await context.params;
  const order = mockRepository.orders.byId(id);
  if (!order) return apiError(404, "ORDER_NOT_FOUND", "Order not found.");
  return apiJson(order);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "INVALID_JSON", "The request body must be valid JSON.");
  }
  const action = typeof body === "object" && body !== null && "action" in body ? body.action : undefined;
  const permission: Permission = action === "cancel" ? "orders.cancel" : action === "approve" || action === "reject" ? "orders.approve" : "orders.read";
  const session = requireApiSession(request, [permission]);
  if (session instanceof Response) return session;
  const { id } = await context.params;
  const order = mockRepository.orders.byId(id);
  if (!order) return apiError(404, "ORDER_NOT_FOUND", "Order not found.");
  if (action === "cancel") {
    if (!canCancelOrder(order.status)) return apiError(409, "ORDER_NOT_CANCELLABLE", "This order can no longer be cancelled.");
    return apiJson(mockRepository.orders.cancel(id, session.user.id));
  }
  if (action === "approve" || action === "reject") {
    const parsed = parseJson(orderDecisionSchema, body);
    if (parsed instanceof Error) return validationError(parsed);
    const canDecide = parsed.action === "approve" ? canApproveOrder(order.status) : canRejectOrder(order.status);
    if (!canDecide) return apiError(409, "ORDER_DECISION_CONFLICT", "This order has already been decided.");
    return apiJson(mockRepository.orders.decide(id, parsed, session.user.id));
  }
  return apiError(400, "UNSUPPORTED_ACTION", "Unsupported order action.");
}
