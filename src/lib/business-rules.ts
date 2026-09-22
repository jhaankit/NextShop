import type { Address, CartItem, Order, OrderLineItem, Product } from "@/types/domain";

export const orderApprovalThreshold = 10_000;

export interface CartValidationIssue {
  productId: string;
  code: "UNAVAILABLE" | "MIN_QUANTITY" | "INSUFFICIENT_STOCK" | "PRICE_CHANGED";
  message: string;
}

export function unitPrice(product: Product) {
  return product.contractPrice ?? product.price;
}

export function validateCart(items: CartItem[], products: Product[]): CartValidationIssue[] {
  return items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product || product.availability === "OUT_OF_STOCK") {
      return [{ productId: item.productId, code: "UNAVAILABLE" as const, message: "Item is no longer available." }];
    }
    const issues: CartValidationIssue[] = [];
    if (item.quantity < product.minOrderQuantity) {
      issues.push({ productId: item.productId, code: "MIN_QUANTITY", message: `Minimum order quantity is ${product.minOrderQuantity}.` });
    }
    if (item.quantity > product.inventory) {
      issues.push({ productId: item.productId, code: "INSUFFICIENT_STOCK", message: `Only ${product.inventory} ${product.unit} available.` });
    }
    return issues;
  });
}

export function buildLineItems(items: CartItem[], products: Product[]): OrderLineItem[] {
  return items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) throw new Error("Cart references an unknown product");
    const price = unitPrice(product);
    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      quantity: item.quantity,
      unitPrice: price,
      subtotal: roundMoney(price * item.quantity),
      fulfillmentStatus: item.quantity > product.inventory ? "BACKORDERED" : "ALLOCATED",
      allocatedQuantity: Math.min(item.quantity, product.inventory),
      backorderedQuantity: Math.max(item.quantity - product.inventory, 0)
    };
  });
}

export function calculateTotals(lineItems: OrderLineItem[], taxExempt: boolean) {
  const subtotal = roundMoney(lineItems.reduce((sum, item) => sum + item.subtotal, 0));
  const discount = subtotal > 5000 ? roundMoney(subtotal * 0.05) : 0;
  const taxable = Math.max(subtotal - discount, 0);
  const tax = taxExempt ? 0 : roundMoney(taxable * 0.0825);
  const shipping = subtotal > 1500 ? 0 : 85;
  return { subtotal, discount, tax, shipping, total: roundMoney(taxable + tax + shipping) };
}

export function canCancelOrder(status: Order["status"]) {
  return status === "SUBMITTED" || status === "APPROVED";
}

export function requiresOrderApproval(total: number) {
  return total > orderApprovalThreshold;
}

export function canApproveOrder(status: Order["status"]) {
  return status === "SUBMITTED";
}

export function canRejectOrder(status: Order["status"]) {
  return status === "SUBMITTED";
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function chooseAddress(addresses: Address[], id: string) {
  const address = addresses.find((candidate) => candidate.id === id);
  if (!address) throw new Error("Address not found");
  return address;
}
