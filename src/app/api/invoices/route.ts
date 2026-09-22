import { NextRequest } from "next/server";
import { activeLocationId, apiJson, paginate, readSearchParams, requireApiSession, sortByKey } from "@/app/api/_lib";
import { listQuerySchema } from "@/schemas/forms";
import { mockRepository } from "@/mocks/repository";

export function GET(request: NextRequest) {
  const session = requireApiSession(request, ["invoices.read"]);
  if (session instanceof Response) return session;
  const query = listQuerySchema.parse(readSearchParams(request));
  const q = query.q.trim().toLowerCase();
  let filtered = mockRepository.invoices.list(activeLocationId(request)).filter((invoice) => {
    const matchesSearch = !q || `${invoice.invoiceNumber} ${invoice.status}`.toLowerCase().includes(q);
    const matchesStatus = !query.status || invoice.status === query.status;
    return matchesSearch && matchesStatus;
  });
  filtered = sortByKey(filtered, query.sort, {
    relevance: (invoice) => invoice.invoiceDate,
    date: (invoice) => invoice.invoiceDate,
    due: (invoice) => invoice.dueDate,
    amount: (invoice) => invoice.amount,
    status: (invoice) => invoice.status
  });
  return apiJson(paginate(filtered, query.page, query.pageSize));
}
