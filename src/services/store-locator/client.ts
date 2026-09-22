import { apiFetch, toQueryString } from "@/services/http";
import type { StoreLocatorResponse } from "@/types/domain";

export interface StoreLocatorQuery {
  q?: string;
  lat?: number;
  lng?: number;
  radiusMiles?: number;
  limit?: number;
}

export const storeLocatorService = {
  search: (query: StoreLocatorQuery = {}) => apiFetch<StoreLocatorResponse>(`/api/store-locator${toQueryString(query)}`)
};
