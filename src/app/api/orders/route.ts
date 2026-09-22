import { NextRequest } from "next/server";
import { z } from "zod";
import { activeLocationId, apiError, apiJson, paginate, parseJson, readSearchParams, requireApiSession, sortByKey, validationError } from "@/app/api/_lib";
import { listQuerySchema, checkoutSchema } from "@/schemas/forms";
import { observability } from "@/lib/observability";
import { mockRepository } from "@/mocks/repository";

const checkoutItemsSchema = z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() }));

export function GET(request: NextRequest) {
  const session = requireApiSession(request, ["orders.read"]);
  if (session instanceof Response) return session;
  const query = listQuerySchema.parse(readSearchParams(request));
  const locationId = activeLocationId(request);
  const q = query.q.trim().toLowerCase();
  let filtered = mockRepository.orders.list(locationId).filter((order) => {
    const matchesSearch = !q || `${order.orderNumber} ${order.purchaseOrderNumber} ${order.status}`.toLowerCase().includes(q);
    const matchesStatus = !query.status || order.status === query.status;
    return matchesSearch && matchesStatus;
  });
  filtered = sortByKey(filtered, query.sort, {
    relevance: (order) => order.createdAt,
    date: (order) => order.createdAt,
    total: (order) => order.total,
    status: (order) => order.status
  });
  return apiJson(paginate(filtered, query.page, query.pageSize));
}

export async function POST(request: NextRequest) {
  const session = requireApiSession(request, ["orders.create"]);
  if (session instanceof Response) return session;
  const parsed = parseJson(checkoutSchema.extend({ items: checkoutItemsSchema, idempotencyKey: z.string().optional() }), await request.json());
  if (parsed instanceof Error) return validationError(parsed);
  if (parsed.items.length === 0) return apiError(422, "EMPTY_CART", "Add at least one item before checkout.");
  const result = mockRepository.orders.create(parsed, session.user.id);
  if ("issues" in result) return apiError(409, "CART_CONFLICT", "Some items changed before checkout.", { cart: result.issues.map((issue) => issue.message) });
  observability.recordMetric({ name: "order.created", tags: { status: result.order.status, locationId: result.order.customerLocationId } });
  return apiJson(result.order, { status: 201 });
}
