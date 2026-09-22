import { NextRequest } from "next/server";
import { activeLocationId, apiJson, paginate, readSearchParams, requireApiSession, sortByKey } from "@/app/api/_lib";
import { mockRepository } from "@/mocks/repository";
import { listQuerySchema } from "@/schemas/forms";

export function GET(request: NextRequest) {
  const session = requireApiSession(request, ["orders.approve"]);
  if (session instanceof Response) return session;
  const query = listQuerySchema.parse(readSearchParams(request));
  const locationId = activeLocationId(request);
  const q = query.q.trim().toLowerCase();
  let filtered = mockRepository.orders.pendingApprovals(locationId).filter((order) => {
    return !q || `${order.orderNumber} ${order.purchaseOrderNumber} ${order.total}`.toLowerCase().includes(q);
  });
  filtered = sortByKey(filtered, query.sort, {
    relevance: (order) => order.createdAt,
    date: (order) => order.createdAt,
    total: (order) => order.total,
    status: (order) => order.status
  });
  return apiJson(paginate(filtered, query.page, query.pageSize));
}
