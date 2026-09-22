"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/form-field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { QueryState } from "@/components/shared/query-state";
import { useAccount, useCartPreview, useCreateOrder } from "@/hooks/use-portal-queries";
import { checkoutSchema, type CheckoutInput } from "@/schemas/forms";
import { useCartStore } from "@/stores/cart-store";

export function CheckoutClient() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const account = useAccount();
  const createOrder = useCreateOrder();
  const preview = useCartPreview(items);
  const form = useForm<CheckoutInput>({ resolver: zodResolver(checkoutSchema), defaultValues: { purchaseOrderNumber: "", customerLocationId: "", shippingAddressId: "", billingAddressId: "", notes: "" } });
  if (items.length === 0) return <EmptyState title="Checkout is unavailable" message="Your cart is empty." />;
  if (account.isLoading) return <LoadingState label="Loading account" />;
  if (!account.data) return <EmptyState title="Account unavailable" message="Refresh and try again." />;
  async function submit(values: CheckoutInput) {
    const order = await createOrder.mutateAsync({ ...values, items, idempotencyKey: crypto.randomUUID() });
    clear();
    router.push(`/orders/${order.id}`);
  }
  return <form className="grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={form.handleSubmit(submit)} noValidate><Card><CardHeader><CardTitle>Checkout details</CardTitle></CardHeader><div className="grid gap-4 md:grid-cols-2"><Field label="Purchase order number" htmlFor="purchaseOrderNumber" error={form.formState.errors.purchaseOrderNumber?.message}><Input id="purchaseOrderNumber" {...form.register("purchaseOrderNumber")} aria-invalid={Boolean(form.formState.errors.purchaseOrderNumber)} /></Field><Field label="Requested delivery date" htmlFor="requestedDeliveryDate" error={form.formState.errors.requestedDeliveryDate?.message}><Input id="requestedDeliveryDate" type="date" {...form.register("requestedDeliveryDate")} /></Field><Field label="Customer location" htmlFor="customerLocationId" error={form.formState.errors.customerLocationId?.message}><Select id="customerLocationId" {...form.register("customerLocationId")} aria-invalid={Boolean(form.formState.errors.customerLocationId)}><option value="">Choose location</option>{account.data.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</Select></Field><Field label="Shipping address" htmlFor="shippingAddressId" error={form.formState.errors.shippingAddressId?.message}><Select id="shippingAddressId" {...form.register("shippingAddressId")} aria-invalid={Boolean(form.formState.errors.shippingAddressId)}><option value="">Choose address</option>{account.data.addresses.filter((address) => address.type !== "billing").map((address) => <option key={address.id} value={address.id}>{address.label}</option>)}</Select></Field><Field label="Billing address" htmlFor="billingAddressId" error={form.formState.errors.billingAddressId?.message}><Select id="billingAddressId" {...form.register("billingAddressId")} aria-invalid={Boolean(form.formState.errors.billingAddressId)}><option value="">Choose address</option>{account.data.addresses.filter((address) => address.type !== "shipping").map((address) => <option key={address.id} value={address.id}>{address.label}</option>)}</Select></Field><div className="md:col-span-2"><Field label="Notes" htmlFor="notes" error={form.formState.errors.notes?.message}><Textarea id="notes" {...form.register("notes")} /></Field></div></div>{createOrder.error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">{createOrder.error.message}</p> : null}</Card><Card className="h-fit"><CardHeader><CardTitle>Submit order</CardTitle></CardHeader><QueryState isLoading={preview.isLoading} error={preview.error} data={preview.data} onRetry={() => void preview.refetch()}>{(data) => <div className="space-y-3"><p className="text-sm text-slate-600">Inventory and pricing are checked before submission. Orders above approval thresholds remain submitted until released.</p>{data.issues.length ? <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800" role="alert">{data.issues.map((issue) => <p key={`${issue.productId}-${issue.code}`}>{issue.message}</p>)}</div> : <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800" role="status">Cart is priced and ready to submit.</p>}<dl className="space-y-1 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>${data.totals.subtotal.toFixed(2)}</dd></div><div className="flex justify-between font-semibold"><dt>Total</dt><dd>${data.totals.total.toFixed(2)}</dd></div></dl><Button className="w-full" disabled={createOrder.isPending || data.issues.length > 0}>{createOrder.isPending ? "Submitting..." : "Place order"}</Button></div>}</QueryState></Card></form>;
}
