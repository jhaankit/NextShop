"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { DataTable, Pagination, type DataColumn } from "@/components/ui/data-table";
import { Input, Select } from "@/components/ui/input";
import { QueryState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCustomers } from "@/hooks/use-portal-queries";
import type { CustomerLocation } from "@/types/domain";

export function CustomersClient() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = { q: search.get("q") ?? "", sort: search.get("sort") ?? "name-asc", page: Number(search.get("page") ?? 1), pageSize: 10 };
  const customers = useCustomers(query);
  function setParam(key: string, value: string) { const params = new URLSearchParams(search.toString()); if (value) params.set(key, value); else params.delete(key); if (key !== "page") params.set("page", "1"); router.push(`${pathname}?${params.toString()}`); }
  const columns: DataColumn<CustomerLocation>[] = [
    { id: "name", header: "Location", accessor: (c) => c.name, sortValue: (c) => c.name },
    { id: "code", header: "Code", accessor: (c) => c.code },
    { id: "status", header: "Status", accessor: (c) => <StatusBadge status={c.status} /> },
    { id: "buyers", header: "Buyers", accessor: (c) => String(c.buyerIds.length) }
  ];
  return <div className="space-y-4"><Card><div className="grid gap-3 md:grid-cols-3"><Input placeholder="Search location" value={query.q} onChange={(e) => setParam("q", e.target.value)} /><Select value={query.sort} onChange={(e) => setParam("sort", e.target.value)}><option value="name-asc">Name A-Z</option><option value="status-asc">Status</option></Select></div></Card><QueryState isLoading={customers.isLoading} error={customers.error} data={customers.data} empty={customers.data?.items.length === 0} onRetry={() => void customers.refetch()}>{(data) => <><DataTable columns={columns} rows={data.items} rowHref={(row) => `/customers/${row.id}`} /><Pagination page={data.page} pageCount={data.pageCount} onPage={(page) => setParam("page", String(page))} /></>}</QueryState></div>;
}
