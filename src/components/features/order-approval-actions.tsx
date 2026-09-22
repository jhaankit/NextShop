"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDecideOrder } from "@/hooks/use-portal-queries";
import { canApproveOrder } from "@/lib/business-rules";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Order, OrderApprovalAction } from "@/types/domain";

export function OrderApprovalActions({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<OrderApprovalAction>("approve");
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState<string>();
  const decision = useDecideOrder(order.id);
  const disabled = !canApproveOrder(order.status);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(undefined);
    const trimmed = reason.trim();
    if (action === "reject" && trimmed.length < 5) {
      setValidationError("Enter a rejection reason.");
      return;
    }
    await decision.mutateAsync(action === "approve" ? { action } : { action, reason: trimmed });
    setOpen(false);
    setReason("");
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={disabled || decision.isPending} onClick={() => { setAction("approve"); setOpen(true); }}>
          Approve
        </Button>
        <Button type="button" size="sm" variant="danger" disabled={disabled || decision.isPending} onClick={() => { setAction("reject"); setOpen(true); }}>
          Reject
        </Button>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">{action === "approve" ? "Approve order" : "Reject order"}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-slate-600">
            {action === "approve" ? `${order.orderNumber} will move to fulfillment readiness.` : `${order.orderNumber} will be rejected and removed from the approval queue.`}
          </Dialog.Description>
          <form className="mt-4 space-y-4" onSubmit={submit} noValidate>
            {action === "reject" ? (
              <Field label="Rejection reason" htmlFor={`reject-${order.id}`} error={validationError}>
                <Textarea id={`reject-${order.id}`} value={reason} onChange={(event) => setReason(event.target.value)} aria-invalid={Boolean(validationError)} />
              </Field>
            ) : null}
            {decision.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">{decision.error.message}</p> : null}
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild><Button type="button" variant="secondary">Cancel</Button></Dialog.Close>
              <Button type="submit" variant={action === "approve" ? "primary" : "danger"} disabled={decision.isPending}>
                {decision.isPending ? "Saving..." : action === "approve" ? "Approve order" : "Reject order"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function OrderApprovalPanel({ order }: { order: Order }) {
  if (!order.approval.required && order.approval.decisions.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval</CardTitle>
        <StatusBadge status={order.status} />
      </CardHeader>
      <p className="text-sm text-slate-600">Orders above {formatMoney(order.approval.threshold, order.currency)} require approval before fulfillment.</p>
      {order.approval.decisions.length ? (
        <ol className="mt-4 space-y-3">
          {order.approval.decisions.map((decision) => (
            <li key={decision.id} className="rounded-lg border border-slate-200 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{decision.action === "approve" ? "Approved" : "Rejected"} by {decision.actorName}</span>
                <span className="text-slate-500">{formatDateTime(decision.decidedAt)}</span>
              </div>
              {decision.reason ? <p className="mt-2 text-slate-700">{decision.reason}</p> : null}
            </li>
          ))}
        </ol>
      ) : <p className="mt-4 text-sm text-slate-600">Awaiting approver decision.</p>}
    </Card>
  );
}
