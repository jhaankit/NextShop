import { apiFetch, toQueryString } from "@/services/http";
import type { Invoice, ListResponse } from "@/types/domain";

export const invoicesService = {
  getInvoices: (query: Record<string, string | number | undefined> = {}) => apiFetch<ListResponse<Invoice>>(`/api/invoices${toQueryString(query)}`),
  getInvoice: (id: string) => apiFetch<Invoice>(`/api/invoices/${id}`)
};
