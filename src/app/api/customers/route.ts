import { NextRequest } from "next/server";
import { apiJson, paginate, readSearchParams, requireApiSession, sortByKey } from "@/app/api/_lib";
import { listQuerySchema } from "@/schemas/forms";
import { mockRepository } from "@/mocks/repository";

export function GET(request: NextRequest) {
  const session = requireApiSession(request, ["customers.read"]);
  if (session instanceof Response) return session;
  const query = listQuerySchema.parse(readSearchParams(request));
  const q = query.q.trim().toLowerCase();
  let filtered = mockRepository.account.locations().filter((location) => !q || `${location.name} ${location.code} ${location.status}`.toLowerCase().includes(q));
  filtered = sortByKey(filtered, query.sort, {
    relevance: (location) => location.name,
    name: (location) => location.name,
    status: (location) => location.status
  });
  return apiJson(paginate(filtered, query.page, query.pageSize));
}
