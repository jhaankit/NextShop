import { NextRequest } from "next/server";
import { activeLocationId, apiJson, paginate, readSearchParams, requireApiSession, sortByKey } from "@/app/api/_lib";
import { listQuerySchema } from "@/schemas/forms";
import { mockRepository } from "@/mocks/repository";

export function GET(request: NextRequest) {
  const session = requireApiSession(request, ["invoices.read"]);
  if (session instanceof Response) return session;
  const query = listQuerySchema.parse(readSearchParams(request));
  const filtered = mockRepository.documents.list({ q: query.q, type: query.type, status: query.status, locationId: query.locationId ?? activeLocationId(request) });
  const sorted = sortByKey(filtered, query.sort, {
    relevance: (document) => document.issuedAt,
    date: (document) => document.issuedAt,
    type: (document) => document.type,
    amount: (document) => document.amount ?? 0
  });
  return apiJson(paginate(sorted, query.page, query.pageSize));
}
