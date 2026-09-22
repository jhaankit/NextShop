"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { DataTable, Pagination, type DataColumn } from "@/components/ui/data-table";
import { Input, Select } from "@/components/ui/input";
import { QueryState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useOrders } from "@/hooks/use-portal-queries";
import { formatDate, formatMoney } from "@/lib/format";
import type { Order } from "@/types/domain";

export function OrdersClient() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = { q: search.get("q") ?? "", status: search.get("status") ?? undefined, sort: search.get("sort") ?? "date-desc", page: Number(search.get("page") ?? 1), pageSize: 10 };
  const orders = useOrders(query);
  function setParam(key: string, value: string) { const params = new URLSearchParams(search.toString()); if (value) params.set(key, value); else params.delete(key); if (key !== "page") params.set("page", "1"); router.push(`${pathname}?${params.toString()}`); }
  const columns: DataColumn<Order>[] = [
    { id: "order", header: "Order", accessor: (o) => o.orderNumber, sortValue: (o) => o.orderNumber },
    { id: "po", header: "PO", accessor: (o) => o.purchaseOrderNumber },
    { id: "date", header: "Date", accessor: (o) => formatDate(o.createdAt), sortValue: (o) => o.createdAt },
    { id: "status", header: "Status", accessor: (o) => <StatusBadge status={o.status} /> },
    { id: "fulfillment", header: "Fulfillment", accessor: (o) => o.shipments[0]?.trackingNumber ?? "Pending" },
    { id: "total", header: "Total", accessor: (o) => formatMoney(o.total, o.currency), sortValue: (o) => o.total }
  ];
  return <div className="space-y-4"><Card><div className="grid gap-3 md:grid-cols-4"><Input placeholder="Search order or PO" value={query.q} onChange={(e) => setParam("q", e.target.value)} /><Select value={query.status ?? ""} onChange={(e) => setParam("status", e.target.value)}><option value="">All statuses</option><option>SUBMITTED</option><option>APPROVED</option><option>REJECTED</option><option>FULFILLING</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option></Select><Select value={query.sort} onChange={(e) => setParam("sort", e.target.value)}><option value="date-desc">Newest</option><option value="date-asc">Oldest</option><option value="total-desc">Total high-low</option><option value="status-asc">Status</option></Select></div></Card><QueryState isLoading={orders.isLoading} error={orders.error} data={orders.data} empty={orders.data?.items.length === 0} onRetry={() => void orders.refetch()}>{(data) => <><DataTable columns={columns} rows={data.items} rowHref={(row) => `/orders/${row.id}`} /><Pagination page={data.page} pageCount={data.pageCount} onPage={(page) => setParam("page", String(page))} /></>}</QueryState></div>;
}
