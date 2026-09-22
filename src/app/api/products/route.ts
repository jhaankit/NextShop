import { NextRequest } from "next/server";
import { activeLocationId, apiJson, paginate, readSearchParams, requireApiSession, sortByKey } from "@/app/api/_lib";
import { listQuerySchema } from "@/schemas/forms";
import { mockRepository } from "@/mocks/repository";

export function GET(request: NextRequest) {
  const session = requireApiSession(request, ["products.read"]);
  if (session instanceof Response) return session;
  const query = listQuerySchema.parse(readSearchParams(request));
  const locationId = activeLocationId(request);
  const q = query.q.trim().toLowerCase();
  let filtered = mockRepository.products.list(locationId).filter((product) => {
    const matchesSearch = !q || [product.name, product.sku, product.description, product.category, product.subcategory, ...product.tags].join(" ").toLowerCase().includes(q);
    const matchesCategory = !query.category || product.category === query.category;
    const matchesAvailability = !query.availability || product.availability === query.availability;
    return matchesSearch && matchesCategory && matchesAvailability;
  });
  filtered = sortByKey(filtered, query.sort, {
    relevance: (product) => product.name,
    name: (product) => product.name,
    price: (product) => product.contractPrice ?? product.price,
    availability: (product) => product.availability,
    category: (product) => product.category
  });
  return apiJson({ ...paginate(filtered, query.page, query.pageSize), facets: { categories: mockRepository.products.categories() } });
}
