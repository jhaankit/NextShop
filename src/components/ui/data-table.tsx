"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpDown, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { cn } from "@/lib/utils";

export interface DataColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => string | number | React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  hideable?: boolean;
}

export function DataTable<T extends { id: string }>({ columns, rows, rowHref, emptyMessage = "No records found", selectable = false }: { columns: DataColumn<T>[]; rows: T[]; rowHref?: (row: T) => string; emptyMessage?: string; selectable?: boolean }) {
  const [sort, setSort] = useState<{ id: string; direction: "asc" | "desc" } | undefined>();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const visibleColumns = columns.filter((column) => !hiddenColumns.has(column.id));
  const allPageRowsSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));
  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((candidate) => candidate.id === sort.id);
    if (!column) return rows;
    return [...rows].sort((a, b) => {
      const left = column.sortValue?.(a) ?? String(column.accessor(a));
      const right = column.sortValue?.(b) ?? String(column.accessor(b));
      if (left < right) return sort.direction === "asc" ? -1 : 1;
      if (left > right) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [columns, rows, sort]);

  function toggleRow(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllRows() {
    setSelected((current) => {
      const next = new Set(current);
      if (allPageRowsSelected) rows.forEach((row) => next.delete(row.id));
      else rows.forEach((row) => next.add(row.id));
      return next;
    });
  }

  function toggleColumn(id: string) {
    setHiddenColumns((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (rows.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 text-sm text-slate-600">
        <span aria-live="polite">{selected.size ? `${selected.size} selected` : `${rows.length} rows`}</span>
        <details className="relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-1 font-medium hover:bg-slate-100"><Columns3 className="h-4 w-4" aria-hidden />Columns</summary>
          <div className="absolute right-0 z-10 mt-2 grid min-w-44 gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
            {columns.filter((column) => column.hideable !== false).map((column) => <label key={column.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!hiddenColumns.has(column.id)} onChange={() => toggleColumn(column.id)} />{column.header}</label>)}
          </div>
        </details>
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>{selectable ? <th scope="col" className="w-10 px-4 py-3"><input type="checkbox" aria-label="Select all rows" checked={allPageRowsSelected} onChange={toggleAllRows} /></th> : null}{visibleColumns.map((column) => <th key={column.id} scope="col" aria-sort={sort?.id === column.id ? (sort.direction === "asc" ? "ascending" : "descending") : "none"} className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600", column.className)}><button className="inline-flex items-center gap-1" onClick={() => setSort((current) => current?.id === column.id && current.direction === "asc" ? { id: column.id, direction: "desc" } : { id: column.id, direction: "asc" })}>{column.header}<ArrowUpDown className="h-3 w-3" aria-hidden /></button></th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{sortedRows.map((row) => <tr key={row.id} className="hover:bg-slate-50">{selectable ? <td className="px-4 py-3"><input type="checkbox" aria-label={`Select row ${row.id}`} checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} /></td> : null}{visibleColumns.map((column) => <td key={column.id} className="px-4 py-3 text-sm text-slate-700">{rowHref && column.id === visibleColumns[0]?.id ? <Link className="font-medium text-teal-700 underline-offset-4 hover:underline" href={rowHref(row)}>{column.accessor(row)}</Link> : column.accessor(row)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 md:hidden">{sortedRows.map((row) => <article key={row.id} className="rounded-lg border border-slate-200 p-3">{selectable ? <label className="mb-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} />Select row</label> : null}{visibleColumns.map((column) => <div key={column.id} className="flex justify-between gap-4 py-1 text-sm"><span className="font-medium text-slate-500">{column.header}</span><span className="text-right text-slate-900">{rowHref && column.id === visibleColumns[0]?.id ? <Link className="text-teal-700 underline" href={rowHref(row)}>{column.accessor(row)}</Link> : column.accessor(row)}</span></div>)}</article>)}</div>
    </div>
  );
}

export function Pagination({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (page: number) => void }) {
  return <nav className="mt-4 flex items-center justify-between" aria-label="Pagination"><Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button><span className="text-sm text-slate-600">Page {page} of {pageCount}</span><Button variant="secondary" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>Next</Button></nav>;
}
