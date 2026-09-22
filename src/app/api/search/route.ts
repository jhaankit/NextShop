import { NextRequest } from "next/server";
import { activeLocationId, apiJson, readSearchParams, requireApiSession } from "@/app/api/_lib";
import { mockRepository } from "@/mocks/repository";

export function GET(request: NextRequest) {
  const session = requireApiSession(request);
  if (session instanceof Response) return session;
  const q = (readSearchParams(request).q ?? "").toString().trim().toLowerCase();
  const locationId = activeLocationId(request);
  if (!q) return apiJson([]);
  const productHits = mockRepository.products.list(locationId)
    .filter((product) => `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(q))
    .slice(0, 5)
    .map((product) => ({ id: product.id, label: `${product.name} (${product.sku})`, href: `/products/${product.id}` }));
  const orderHits = mockRepository.orders.list(locationId)
    .filter((order) => `${order.orderNumber} ${order.purchaseOrderNumber}`.toLowerCase().includes(q))
    .slice(0, 3)
    .map((order) => ({ id: order.id, label: order.orderNumber, href: `/orders/${order.id}` }));
  const invoiceHits = mockRepository.invoices.list()
    .filter((invoice) => invoice.invoiceNumber.toLowerCase().includes(q))
    .slice(0, 3)
    .map((invoice) => ({ id: invoice.id, label: invoice.invoiceNumber, href: `/invoices/${invoice.id}` }));
  const documentHits = mockRepository.documents.list({ q, locationId })
    .slice(0, 3)
    .map((document) => ({ id: document.id, label: `${document.documentNumber} (${document.type})`, href: `/documents/${document.id}` }));
  return apiJson([...productHits, ...orderHits, ...invoiceHits, ...documentHits]);
}
