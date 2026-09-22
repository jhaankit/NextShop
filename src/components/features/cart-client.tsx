"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/state";
import { QueryState } from "@/components/shared/query-state";
import { formatMoney } from "@/lib/format";
import { useCartPreview } from "@/hooks/use-portal-queries";
import { useCartStore } from "@/stores/cart-store";

export function CartClient() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const preview = useCartPreview(items);
  if (items.length === 0) return <EmptyState title="Your cart is empty" message="Browse the catalog to add contract items." />;
  return <QueryState isLoading={preview.isLoading} error={preview.error} data={preview.data} onRetry={() => void preview.refetch()}>{(data) => <div className="grid gap-6 lg:grid-cols-[1fr_360px]"><div className="space-y-4">{data.lineItems.map((line) => <Card key={line.productId}><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><h2 className="font-semibold">{line.name}</h2><p className="text-sm text-slate-600">{line.sku} · {formatMoney(line.unitPrice)} / {line.unit}</p><p className="mt-1 text-xs text-slate-500">{line.fulfillmentStatus === "BACKORDERED" ? `${line.backorderedQuantity} backordered` : "Allocated for fulfillment"}</p></div><div className="flex items-center gap-2"><Input className="w-24" type="number" min={1} value={line.quantity} onChange={(e) => updateQuantity(line.productId, Number(e.target.value))} aria-label={`Quantity for ${line.name}`} /><Button variant="ghost" onClick={() => removeItem(line.productId)}>Remove</Button></div></div></Card>)}</div><Card className="h-fit"><CardHeader><CardTitle>Order summary</CardTitle></CardHeader>{data.issues.length ? <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800" role="alert">{data.issues.map((issue) => <p key={`${issue.productId}-${issue.code}`}>{issue.message}</p>)}</div> : null}<Totals totals={data.totals} /><div className="mt-5 grid gap-2"><Button asChild disabled={data.issues.length > 0}><Link href="/checkout">Checkout</Link></Button><Button variant="secondary" onClick={clear}>Clear cart</Button></div></Card></div>}</QueryState>;
}
function Totals({ totals }: { totals: { subtotal: number; discount: number; tax: number; shipping: number; total: number } }) { return <dl className="space-y-2 text-sm"><Row label="Subtotal" value={totals.subtotal} /><Row label="Discount" value={-totals.discount} /><Row label="Tax" value={totals.tax} /><Row label="Shipping" value={totals.shipping} /><div className="border-t border-slate-200 pt-2 text-base font-bold"><Row label="Total" value={totals.total} /></div></dl>; }
function Row({ label, value }: { label: string; value: number }) { return <div className="flex justify-between"><dt>{label}</dt><dd>{formatMoney(value)}</dd></div>; }
