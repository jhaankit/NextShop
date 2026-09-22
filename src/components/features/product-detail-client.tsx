"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QueryState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useProduct } from "@/hooks/use-portal-queries";
import { formatMoney } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";

export function ProductDetailClient({ id }: { id: string }) {
  const query = useProduct(id);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  return <QueryState isLoading={query.isLoading} error={query.error} data={query.data} onRetry={() => void query.refetch()}>{(product) => <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><Card><div className="mb-6 h-64 rounded-xl bg-gradient-to-br from-teal-50 to-slate-100" aria-hidden /><p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{product.sku}</p><h1 className="mt-2 text-3xl font-bold">{product.name}</h1><p className="mt-3 text-slate-600">{product.description}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{Object.entries(product.specifications).map(([key, value]) => <div key={key} className="rounded-lg border border-slate-200 p-3"><p className="text-xs font-semibold uppercase text-slate-500">{key}</p><p>{value}</p></div>)}</div>{product.documents.length ? <div className="mt-6"><h2 className="font-semibold">Product documents</h2><div className="mt-2 grid gap-2 sm:grid-cols-2">{product.documents.map((document) => <a key={document.href} href={document.href} className="rounded-md border border-slate-200 px-3 py-2 text-sm text-teal-700 hover:bg-slate-50">{document.label}</a>)}</div></div> : null}</Card><div className="space-y-6"><Card><CardHeader><CardTitle>Contract pricing</CardTitle><StatusBadge status={product.availability} /></CardHeader><p className="text-3xl font-bold">{formatMoney(product.contractPrice ?? product.price, product.currency)} <span className="text-sm font-normal text-slate-500">/ {product.unit}</span></p><p className="mt-2 text-sm text-slate-600">Minimum order: {product.minOrderQuantity}. Lead time: {product.leadTimeDays} days. Inventory at active location: {product.inventory}.</p>{product.availability === "OUT_OF_STOCK" ? <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800" role="status">This item is unavailable at the active location. Switch locations or contact support for alternatives.</p> : null}<div className="mt-5 flex gap-2"><Input type="number" min={product.minOrderQuantity} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} aria-label="Quantity" /><Button disabled={product.availability === "OUT_OF_STOCK"} onClick={() => addItem(product.id, Math.max(product.minOrderQuantity, quantity))}>Add to cart</Button></div></Card><Card><CardHeader><CardTitle>Related products</CardTitle></CardHeader><div className="space-y-2">{product.relatedProductIds.map((relatedId) => <Link key={relatedId} href={`/products/${relatedId}`} className="block rounded-md border border-slate-200 px-3 py-2 text-sm text-teal-700 hover:bg-slate-50">View related item {relatedId}</Link>)}</div></Card></div></div>}</QueryState>;
}
