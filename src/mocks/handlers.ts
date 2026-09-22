import { http, HttpResponse } from "msw";
import { buildLineItems, calculateTotals } from "@/lib/business-rules";
import { account, invoices, notifications, orders, products } from "@/mocks/data";
import { storeLocations } from "@/mocks/store-locations";

export const handlers = [
  http.post("/api/auth/login", () => HttpResponse.json({ user: account.users[0], expiresAt: new Date(Date.now() + 3600_000).toISOString() })),
  http.get("/api/products", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase() ?? "";
    const items = products.filter((product) => !q || product.name.toLowerCase().includes(q) || product.sku.toLowerCase().includes(q)).slice(0, 12);
    return HttpResponse.json({ items, total: items.length, page: 1, pageSize: 12, pageCount: 1 });
  }),
  http.get("/api/products/:id", ({ params }) => {
    const product = products.find((item) => item.id === params.id);
    return product ? HttpResponse.json(product) : new HttpResponse(null, { status: 404 });
  }),
  http.get("/api/dashboard", () => HttpResponse.json({ account, openOrders: 4, outstandingInvoices: 3, outstandingBalance: 1200, recentOrders: orders.slice(0, 3), recentActivity: [], notifications })),
  http.get("/api/orders", () => HttpResponse.json({ items: orders.slice(0, 10), total: orders.length, page: 1, pageSize: 10, pageCount: 4 })),
  http.post("/api/orders", async ({ request }) => {
    const body = await request.json() as { items: Array<{ productId: string; quantity: number }>; purchaseOrderNumber: string; customerLocationId: string; shippingAddressId: string; billingAddressId: string; };
    const lineItems = buildLineItems(body.items, products);
    return HttpResponse.json({ ...orders[0], id: "ord_test", orderNumber: "SO-TEST", lineItems, ...calculateTotals(lineItems, false) }, { status: 201 });
  }),
  http.get("/api/invoices", () => HttpResponse.json({ items: invoices.slice(0, 10), total: invoices.length, page: 1, pageSize: 10, pageCount: 3 })),
  http.get("/api/customers", () => HttpResponse.json({ items: account.locations, total: account.locations.length, page: 1, pageSize: 10, pageCount: 1 })),
  http.get("/api/account", () => HttpResponse.json(account)),
  http.get("/api/store-locator", () => HttpResponse.json({ stores: storeLocations.slice(0, 3), center: { lat: 39.8283, lng: -98.5795 }, radiusMiles: 100, source: "default" })),
  http.get("/api/notifications", () => HttpResponse.json(notifications)),
  http.get("/api/search", () => HttpResponse.json(products.slice(0, 3).map((product) => ({ id: product.id, label: product.name, href: `/products/${product.id}` }))))
];
