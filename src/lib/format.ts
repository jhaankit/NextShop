import { format, parseISO } from "date-fns";

export function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatDate(value: string) {
  return format(parseISO(value), "MMM d, yyyy");
}

export function formatDateTime(value: string) {
  return format(parseISO(value), "MMM d, yyyy h:mm a");
}

export function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
