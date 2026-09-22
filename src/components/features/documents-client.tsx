"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { DataTable, Pagination, type DataColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { QueryState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDocuments } from "@/hooks/use-portal-queries";
import { formatDate, formatMoney } from "@/lib/format";
import type { PortalDocument } from "@/types/domain";

export function DocumentsClient() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = { q: search.get("q") ?? "", type: search.get("type") ?? undefined, status: search.get("status") ?? undefined, sort: search.get("sort") ?? "date-desc", page: Number(search.get("page") ?? 1), pageSize: 10 };
  const documents = useDocuments(query);
  function setParam(key: string, value: string) { const params = new URLSearchParams(search.toString()); if (value) params.set(key, value); else params.delete(key); if (key !== "page") params.set("page", "1"); router.push(`${pathname}?${params.toString()}`); }
  const columns: DataColumn<PortalDocument>[] = [
    { id: "number", header: "Document", accessor: (document) => document.documentNumber, sortValue: (document) => document.documentNumber },
    { id: "type", header: "Type", accessor: (document) => document.type },
    { id: "date", header: "Issued", accessor: (document) => formatDate(document.issuedAt), sortValue: (document) => document.issuedAt },
    { id: "status", header: "Status", accessor: (document) => <StatusBadge status={document.status} /> },
    { id: "amount", header: "Amount", accessor: (document) => document.amount === undefined ? "-" : formatMoney(document.amount, document.currency), sortValue: (document) => document.amount ?? 0 },
    { id: "download", header: "Download", accessor: (document) => <Button asChild size="sm" variant="secondary"><a href={document.downloadUrl}>Download</a></Button> }
  ];
  return <div className="space-y-4"><Card><div className="grid gap-3 md:grid-cols-5"><Input placeholder="Search documents" value={query.q} onChange={(event) => setParam("q", event.target.value)} /><Select value={query.type ?? ""} onChange={(event) => setParam("type", event.target.value)} aria-label="Document type"><option value="">All document types</option><option value="ACKNOWLEDGEMENT">Acknowledgements</option><option value="ASN">Shipment notices</option><option value="INVOICE">Invoices</option><option value="CREDIT">Credits</option><option value="STATEMENT">Statements</option></Select><Select value={query.status ?? ""} onChange={(event) => setParam("status", event.target.value)} aria-label="Document status"><option value="">All statuses</option><option value="AVAILABLE">Available</option><option value="PENDING">Pending</option><option value="VOID">Void</option></Select><Select value={query.sort} onChange={(event) => setParam("sort", event.target.value)} aria-label="Sort documents"><option value="date-desc">Newest</option><option value="date-asc">Oldest</option><option value="type-asc">Type</option><option value="amount-desc">Amount high-low</option></Select><Button variant="ghost" onClick={() => router.push(pathname)}>Clear</Button></div></Card><QueryState isLoading={documents.isLoading} error={documents.error} data={documents.data} empty={documents.data?.items.length === 0} onRetry={() => void documents.refetch()}>{(data) => <><DataTable columns={columns} rows={data.items} rowHref={(row) => `/documents/${row.id}`} /><Pagination page={data.page} pageCount={data.pageCount} onPage={(page) => setParam("page", String(page))} /></>}</QueryState></div>;
}
