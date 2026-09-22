"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDocument } from "@/hooks/use-portal-queries";
import { formatDate, formatMoney } from "@/lib/format";

export function DocumentDetailClient({ id }: { id: string }) {
  const query = useDocument(id);
  return <QueryState isLoading={query.isLoading} error={query.error} data={query.data} onRetry={() => void query.refetch()}>{(document) => <div className="grid gap-6 lg:grid-cols-[1fr_360px]"><Card><p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{document.type}</p><h1 className="mt-2 text-3xl font-bold">{document.documentNumber}</h1><p className="mt-3 text-slate-600">{document.title}</p><div className="mt-4"><StatusBadge status={document.status} /></div></Card><Card><CardHeader><CardTitle>Document summary</CardTitle></CardHeader><dl className="space-y-3 text-sm"><Row label="Issued" value={formatDate(document.issuedAt)} />{document.dueAt ? <Row label="Due" value={formatDate(document.dueAt)} /> : null}{document.amount !== undefined ? <Row label="Amount" value={formatMoney(document.amount, document.currency)} /> : null}{document.outstandingAmount !== undefined ? <Row label="Outstanding" value={formatMoney(document.outstandingAmount, document.currency)} /> : null}{document.orderId ? <Row label="Order" value={document.orderId} /> : null}</dl><Button asChild className="mt-5 w-full"><a href={document.downloadUrl}>Download document</a></Button>{document.orderId ? <Button asChild variant="secondary" className="mt-2 w-full"><Link href={`/orders/${document.orderId}`}>Open order</Link></Button> : null}</Card></div>}</QueryState>;
}

function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4"><dt className="text-slate-600">{label}</dt><dd className="font-medium">{value}</dd></div>; }
