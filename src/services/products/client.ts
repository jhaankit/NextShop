import { apiFetch, toQueryString } from "@/services/http";
import type { ListResponse, Product } from "@/types/domain";

export interface ProductQuery {
  q?: string;
  category?: string;
  availability?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductListResponse extends ListResponse<Product> {
  facets: { categories: string[] };
}

export const productsService = {
  getProducts: (query: ProductQuery = {}) => apiFetch<ProductListResponse>(`/api/products${toQueryString(query)}`),
  getProduct: (id: string) => apiFetch<Product>(`/api/products/${id}`),
  getSuggestions: (q: string) => apiFetch<Array<{ id: string; label: string; href: string }>>(`/api/search${toQueryString({ q })}`)
};
