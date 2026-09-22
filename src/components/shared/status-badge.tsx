import { Badge } from "@/components/ui/badge";
import { humanize } from "@/lib/format";
import type { Availability, InvoiceStatus, OrderStatus } from "@/types/domain";

export function StatusBadge({ status }: { status: Availability | InvoiceStatus | OrderStatus | string }) {
  const tone = status.includes("OUT") || status === "CANCELLED" || status === "REJECTED" || status === "OVERDUE" || status === "VOID" ? "danger" : status.includes("LOW") || status === "SUBMITTED" || status === "OPEN" || status === "PARTIALLY_PAID" ? "warning" : status === "IN_STOCK" || status === "DELIVERED" || status === "PAID" ? "success" : "info";
  return <Badge tone={tone}>{humanize(status)}</Badge>;
}
