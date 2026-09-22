"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { DataTable, Pagination, type DataColumn } from "@/components/ui/data-table";
import { Input, Select } from "@/components/ui/input";
import { QueryState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useInvoices } from "@/hooks/use-portal-queries";
import { formatDate, formatMoney } from "@/lib/format";
import type { Invoice } from "@/types/domain";

export function InvoicesClient() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = { q: search.get("q") ?? "", status: search.get("status") ?? undefined, sort: search.get("sort") ?? "due-asc", page: Number(search.get("page") ?? 1), pageSize: 10 };
  const invoices = useInvoices(query);
  function setParam(key: string, value: string) { const params = new URLSearchParams(search.toString()); if (value) params.set(key, value); else params.delete(key); if (key !== "page") params.set("page", "1"); router.push(`${pathname}?${params.toString()}`); }
  const columns: DataColumn<Invoice>[] = [
    { id: "invoice", header: "Invoice", accessor: (i) => i.invoiceNumber },
    { id: "date", header: "Invoice date", accessor: (i) => formatDate(i.invoiceDate), sortValue: (i) => i.invoiceDate },
    { id: "due", header: "Due", accessor: (i) => formatDate(i.dueDate), sortValue: (i) => i.dueDate },
    { id: "status", header: "Status", accessor: (i) => <StatusBadge status={i.status} /> },
    { id: "amount", header: "Amount", accessor: (i) => formatMoney(i.amount, i.currency), sortValue: (i) => i.amount },
    { id: "outstanding", header: "Outstanding", accessor: (i) => formatMoney(i.outstandingAmount, i.currency), sortValue: (i) => i.outstandingAmount }
  ];
  return <div className="space-y-4"><Card><div className="grid gap-3 md:grid-cols-4"><Input placeholder="Search invoice" value={query.q} onChange={(e) => setParam("q", e.target.value)} /><Select value={query.status ?? ""} onChange={(e) => setParam("status", e.target.value)}><option value="">All statuses</option><option>OPEN</option><option>PARTIALLY_PAID</option><option>PAID</option><option>OVERDUE</option></Select><Select value={query.sort} onChange={(e) => setParam("sort", e.target.value)}><option value="due-asc">Due soon</option><option value="date-desc">Newest</option><option value="amount-desc">Amount high-low</option></Select></div></Card><QueryState isLoading={invoices.isLoading} error={invoices.error} data={invoices.data} empty={invoices.data?.items.length === 0} onRetry={() => void invoices.refetch()}>{(data) => <><DataTable columns={columns} rows={data.items} rowHref={(row) => `/invoices/${row.id}`} /><Pagination page={data.page} pageCount={data.pageCount} onPage={(page) => setParam("page", String(page))} /></>}</QueryState></div>;
}
