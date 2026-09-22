import { apiFetch, toQueryString } from "@/services/http";
import type { ListResponse, PortalDocument } from "@/types/domain";

export const documentsService = {
  getDocuments: (query: Record<string, string | number | undefined> = {}) => apiFetch<ListResponse<PortalDocument>>(`/api/documents${toQueryString(query)}`),
  getDocument: (id: string) => apiFetch<PortalDocument>(`/api/documents/${id}`)
};
