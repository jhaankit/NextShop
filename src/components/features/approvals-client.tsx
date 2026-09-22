"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Pagination, type DataColumn } from "@/components/ui/data-table";
import { Input, Select } from "@/components/ui/input";
import { OrderApprovalActions } from "@/components/features/order-approval-actions";
import { QueryState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useApprovals } from "@/hooks/use-portal-queries";
import { formatDate, formatMoney } from "@/lib/format";
import type { Order } from "@/types/domain";

export function ApprovalsClient() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = { q: search.get("q") ?? "", sort: search.get("sort") ?? "date-desc", page: Number(search.get("page") ?? 1), pageSize: 10 };
  const approvals = useApprovals(query);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(search.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  const columns: DataColumn<Order>[] = [
    { id: "order", header: "Order", accessor: (order) => order.orderNumber, sortValue: (order) => order.orderNumber },
    { id: "po", header: "PO", accessor: (order) => order.purchaseOrderNumber },
    { id: "submitted", header: "Submitted", accessor: (order) => formatDate(order.createdAt), sortValue: (order) => order.createdAt },
    { id: "status", header: "Status", accessor: (order) => <StatusBadge status={order.status} /> },
    { id: "total", header: "Total", accessor: (order) => formatMoney(order.total, order.currency), sortValue: (order) => order.total },
    { id: "actions", header: "Decision", accessor: (order) => <OrderApprovalActions order={order} />, hideable: false }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pending approvals</CardTitle>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Search order, PO, or amount" value={query.q} onChange={(event) => setParam("q", event.target.value)} />
          <Select value={query.sort} onChange={(event) => setParam("sort", event.target.value)} aria-label="Sort approvals">
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="total-desc">Total high-low</option>
            <option value="total-asc">Total low-high</option>
          </Select>
        </div>
      </Card>
      <QueryState isLoading={approvals.isLoading} error={approvals.error} data={approvals.data} empty={approvals.data?.items.length === 0} onRetry={() => void approvals.refetch()}>
        {(data) => (
          <>
            <DataTable columns={columns} rows={data.items} rowHref={(order) => `/orders/${order.id}`} emptyMessage="No orders are waiting for approval." />
            <Pagination page={data.page} pageCount={data.pageCount} onPage={(page) => setParam("page", String(page))} />
          </>
        )}
      </QueryState>
    </div>
  );
}
