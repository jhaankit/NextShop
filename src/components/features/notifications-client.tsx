"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryState } from "@/components/shared/query-state";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/use-portal-queries";
import { formatDateTime, humanize } from "@/lib/format";

export function NotificationsClient() {
  const query = useNotifications();
  const mark = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  return <QueryState isLoading={query.isLoading} error={query.error} data={query.data} empty={query.data?.length === 0} onRetry={() => void query.refetch()}>{(notes) => <Card><CardHeader><CardTitle>Notification center</CardTitle><Button variant="secondary" disabled={markAll.isPending} onClick={() => markAll.mutate()}>{markAll.isPending ? "Marking..." : "Mark all as read"}</Button></CardHeader>{mark.error || markAll.error ? <p role="alert" className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-800">{mark.error?.message ?? markAll.error?.message}</p> : null}<div className="divide-y divide-slate-100">{notes.map((note) => <article key={note.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{humanize(note.category)}</p><Link href={note.href} className="font-semibold text-teal-700 hover:underline">{note.title}</Link><p className="text-sm text-slate-600">{note.message}</p><p className="mt-1 text-xs text-slate-500">{formatDateTime(note.createdAt)}</p></div>{note.readAt ? <span className="text-sm text-slate-500">Read</span> : <Button size="sm" variant="secondary" disabled={mark.isPending} onClick={() => mark.mutate(note.id)}>{mark.isPending ? "Marking..." : "Mark read"}</Button>}</article>)}</div></Card>}</QueryState>;
}
