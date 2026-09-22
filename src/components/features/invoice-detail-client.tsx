"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useInvoice } from "@/hooks/use-portal-queries";
import { formatDate, formatMoney } from "@/lib/format";

export function InvoiceDetailClient({ id }: { id: string }) {
  const query = useInvoice(id);
  return <QueryState isLoading={query.isLoading} error={query.error} data={query.data} onRetry={() => void query.refetch()}>{(invoice) => <div className="grid gap-6 lg:grid-cols-[1fr_360px]"><Card><p className="text-sm text-slate-500">Related order</p><Link href={`/orders/${invoice.orderId}`} className="text-teal-700 underline">{invoice.orderId}</Link><h1 className="mt-4 text-3xl font-bold">{invoice.invoiceNumber}</h1><div className="mt-4"><StatusBadge status={invoice.status} /></div></Card><Card><CardHeader><CardTitle>Invoice summary</CardTitle></CardHeader><dl className="space-y-3 text-sm"><Row label="Invoice date" value={formatDate(invoice.invoiceDate)} /><Row label="Due date" value={formatDate(invoice.dueDate)} /><Row label="Amount" value={formatMoney(invoice.amount, invoice.currency)} /><Row label="Outstanding" value={formatMoney(invoice.outstandingAmount, invoice.currency)} /></dl><Button asChild className="mt-5 w-full"><a href={invoice.documentUrl}>Download invoice</a></Button><Button asChild variant="secondary" className="mt-2 w-full"><Link href={`/documents?q=${invoice.invoiceNumber}`}>Find related documents</Link></Button></Card></div>}</QueryState>;
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4"><dt className="text-slate-600">{label}</dt><dd className="font-medium">{value}</dd></div>; }
