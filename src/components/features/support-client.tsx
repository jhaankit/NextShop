"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/form-field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { QueryState } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useSupportCase, useSupportCases } from "@/hooks/use-portal-queries";
import { formatDateTime } from "@/lib/format";
import { supportCaseSchema, type SupportCaseFormValues } from "@/schemas/forms";

export function SupportClient() {
  const form = useForm<SupportCaseFormValues>({ resolver: zodResolver(supportCaseSchema), defaultValues: { subject: "", category: "order", message: "", priority: "normal" } });
  const mutation = useSupportCase();
  const cases = useSupportCases();
  const [caseId, setCaseId] = useState<string>();
  async function submit(values: SupportCaseFormValues) {
    const result = await mutation.mutateAsync(supportCaseSchema.parse(values));
    setCaseId(result.id);
    form.reset();
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_360px]"><Card><CardHeader><CardTitle>Open a support case</CardTitle></CardHeader><form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate><Field label="Subject" htmlFor="subject" error={form.formState.errors.subject?.message}><Input id="subject" {...form.register("subject")} aria-invalid={Boolean(form.formState.errors.subject)} /></Field><Field label="Category" htmlFor="category"><Select id="category" {...form.register("category")}><option value="order">Order</option><option value="invoice">Invoice</option><option value="catalog">Catalog</option><option value="account">Account</option><option value="technical">Technical</option></Select></Field><Field label="Priority" htmlFor="priority"><Select id="priority" {...form.register("priority")}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></Select></Field><Field label="Message" htmlFor="message" error={form.formState.errors.message?.message}><Textarea id="message" {...form.register("message")} aria-invalid={Boolean(form.formState.errors.message)} /></Field>{mutation.error ? <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">{mutation.error.message}</p> : null}{caseId ? <p role="status" className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">Case {caseId} was created.</p> : null}<Button disabled={mutation.isPending}>{mutation.isPending ? "Submitting..." : "Submit case"}</Button></form></Card><div className="space-y-6"><Card><CardHeader><CardTitle>Case history</CardTitle></CardHeader><QueryState isLoading={cases.isLoading} error={cases.error} data={cases.data} empty={cases.data?.length === 0} onRetry={() => void cases.refetch()}>{(items) => <div className="space-y-3">{items.map((item) => <article key={item.id} className="rounded-lg border border-slate-200 p-3"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{item.subject}</p><StatusBadge status={item.status} /></div><p className="text-sm text-slate-600">{item.id} · {item.priority} · {formatDateTime(item.createdAt)}</p></article>)}</div>}</QueryState></Card><Card><CardHeader><CardTitle>Support resources</CardTitle></CardHeader><ul className="space-y-2 text-sm text-slate-700"><li>Order cut-off: 3 PM local warehouse time.</li><li>Finance support responds within one business day.</li><li>Critical fulfillment issues are routed to account operations.</li></ul></Card></div></div>;
}
