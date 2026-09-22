"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, Grid2X2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, Pagination, type DataColumn } from "@/components/ui/data-table";
import { Input, Select } from "@/components/ui/input";
import { QueryState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useProducts } from "@/hooks/use-portal-queries";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/types/domain";

const fallbackCategories = ["Food Service", "Facilities", "Retail Operations", "Office", "Cold Chain"];
const availability = ["", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"];

export function ProductsClient() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = Number(search.get("page") ?? 1);
  const view = search.get("view") ?? "grid";
  const query = { q: search.get("q") ?? "", category: search.get("category") ?? undefined, availability: search.get("availability") ?? undefined, sort: search.get("sort") ?? "name-asc", page, pageSize: 12 };
  const products = useProducts(query);
  const categories = products.data?.facets.categories ?? fallbackCategories;
  function setParam(key: string, value: string) { const params = new URLSearchParams(search.toString()); if (value) params.set(key, value); else params.delete(key); if (key !== "page") params.set("page", "1"); router.push(`${pathname}?${params.toString()}`); }
  const columns: DataColumn<Product>[] = [
    { id: "name", header: "Product", accessor: (p) => p.name, sortValue: (p) => p.name },
    { id: "sku", header: "SKU", accessor: (p) => p.sku },
    { id: "category", header: "Category", accessor: (p) => p.category },
    { id: "price", header: "Price", accessor: (p) => formatMoney(p.contractPrice ?? p.price, p.currency), sortValue: (p) => p.contractPrice ?? p.price },
    { id: "status", header: "Availability", accessor: (p) => <StatusBadge status={p.availability} /> },
    { id: "inventory", header: "Inventory", accessor: (p) => `${p.inventory} ${p.unit}`, sortValue: (p) => p.inventory }
  ];
  return <div className="space-y-4"><Card className="space-y-4"><div className="flex items-center gap-2 text-sm font-semibold"><Filter className="h-4 w-4" />Filters</div><div className="grid gap-3 md:grid-cols-5"><Input value={query.q} placeholder="Search product or SKU" onChange={(e) => setParam("q", e.target.value)} /><Select value={query.category ?? ""} onChange={(e) => setParam("category", e.target.value)} aria-label="Category filter"><option value="">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</Select><Select value={query.availability ?? ""} onChange={(e) => setParam("availability", e.target.value)} aria-label="Availability filter">{availability.map((item) => <option key={item} value={item}>{item || "All availability"}</option>)}</Select><Select value={query.sort} onChange={(e) => setParam("sort", e.target.value)} aria-label="Sort products"><option value="name-asc">Name A-Z</option><option value="price-asc">Price low-high</option><option value="price-desc">Price high-low</option><option value="availability-asc">Availability</option></Select><div className="flex gap-2"><Button variant={view === "grid" ? "primary" : "secondary"} onClick={() => setParam("view", "grid")} aria-label="Grid view"><Grid2X2 className="h-4 w-4" /></Button><Button variant={view === "table" ? "primary" : "secondary"} onClick={() => setParam("view", "table")} aria-label="Table view"><List className="h-4 w-4" /></Button><Button variant="ghost" onClick={() => router.push(pathname)}>Clear</Button></div></div></Card><QueryState isLoading={products.isLoading} error={products.error} data={products.data} empty={products.data?.items.length === 0} onRetry={() => void products.refetch()}>{(data) => <>{view === "table" ? <DataTable columns={columns} rows={data.items} rowHref={(row) => `/products/${row.id}`} selectable /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.items.map((product) => <ProductCard key={product.id} product={product} />)}</div>}<Pagination page={data.page} pageCount={data.pageCount} onPage={(next) => setParam("page", String(next))} /></>}</QueryState></div>;
}
function ProductCard({ product }: { product: Product }) { return <Card className="flex flex-col"><div className="mb-4 h-32 rounded-lg bg-gradient-to-br from-teal-50 to-slate-100" aria-hidden /><div className="flex-1"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{product.sku}</p><h2 className="mt-1 text-lg font-semibold"><Link href={`/products/${product.id}`} className="hover:underline">{product.name}</Link></h2></div><StatusBadge status={product.availability} /></div><p className="mt-2 text-sm text-slate-600">{product.description}</p><p className="mt-3 text-xs text-slate-500">{product.inventory} {product.unit} available at active location · {product.leadTimeDays} day lead time</p></div><div className="mt-4 flex items-center justify-between"><span className="font-bold">{formatMoney(product.contractPrice ?? product.price, product.currency)} / {product.unit}</span><Button asChild size="sm"><Link href={`/products/${product.id}`}>Details</Link></Button></div></Card>; }
