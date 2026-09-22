"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth/client";
import { cartService } from "@/services/cart/client";
import { customersService } from "@/services/customers/client";
import { dashboardService } from "@/services/dashboard/client";
import { documentsService } from "@/services/documents/client";
import { invoicesService } from "@/services/invoices/client";
import { notificationsService } from "@/services/notifications/client";
import { ordersService } from "@/services/orders/client";
import { productsService, type ProductQuery } from "@/services/products/client";
import { storeLocatorService, type StoreLocatorQuery } from "@/services/store-locator/client";
import { supportService } from "@/services/support/client";
import type { CheckoutInput, OrderDecisionInput, StoreProfileInput, SupportCaseInput } from "@/schemas/forms";
import type { CartItem, DashboardSummary } from "@/types/domain";

export const keys = {
  dashboard: ["dashboard"] as const,
  products: (query: ProductQuery) => ["products", query] as const,
  product: (id: string) => ["product", id] as const,
  orders: (query: Record<string, string | number | undefined>) => ["orders", query] as const,
  approvals: (query: Record<string, string | number | undefined>) => ["approvals", query] as const,
  order: (id: string) => ["order", id] as const,
  cartPreview: (items: CartItem[]) => ["cart-preview", items] as const,
  invoices: (query: Record<string, string | number | undefined>) => ["invoices", query] as const,
  invoice: (id: string) => ["invoice", id] as const,
  documents: (query: Record<string, string | number | undefined>) => ["documents", query] as const,
  document: (id: string) => ["document", id] as const,
  customers: (query: Record<string, string | number | undefined>) => ["customers", query] as const,
  customer: (id: string) => ["customer", id] as const,
  storeLocator: (query: StoreLocatorQuery) => ["store-locator", query] as const,
  account: ["account"] as const,
  notifications: ["notifications"] as const,
  supportCases: ["support-cases"] as const
};

export const useDashboard = (initialData?: DashboardSummary) => useQuery({ queryKey: keys.dashboard, queryFn: dashboardService.getDashboard, initialData });
export const useProducts = (query: ProductQuery) => useQuery({ queryKey: keys.products(query), queryFn: () => productsService.getProducts(query) });
export const useProduct = (id: string) => useQuery({ queryKey: keys.product(id), queryFn: () => productsService.getProduct(id) });
export const useOrders = (query: Record<string, string | number | undefined>) => useQuery({ queryKey: keys.orders(query), queryFn: () => ordersService.getOrders(query) });
export const useApprovals = (query: Record<string, string | number | undefined>) => useQuery({ queryKey: keys.approvals(query), queryFn: () => ordersService.getApprovals(query) });
export const useOrder = (id: string) => useQuery({ queryKey: keys.order(id), queryFn: () => ordersService.getOrder(id) });
export const useCartPreview = (items: CartItem[]) => useQuery({ queryKey: keys.cartPreview(items), queryFn: () => cartService.preview({ items }), enabled: items.length > 0 });
export const useInvoices = (query: Record<string, string | number | undefined>) => useQuery({ queryKey: keys.invoices(query), queryFn: () => invoicesService.getInvoices(query) });
export const useInvoice = (id: string) => useQuery({ queryKey: keys.invoice(id), queryFn: () => invoicesService.getInvoice(id) });
export const useDocuments = (query: Record<string, string | number | undefined>) => useQuery({ queryKey: keys.documents(query), queryFn: () => documentsService.getDocuments(query) });
export const useDocument = (id: string) => useQuery({ queryKey: keys.document(id), queryFn: () => documentsService.getDocument(id) });
export const useCustomers = (query: Record<string, string | number | undefined>) => useQuery({ queryKey: keys.customers(query), queryFn: () => customersService.getCustomers(query) });
export const useCustomer = (id: string) => useQuery({ queryKey: keys.customer(id), queryFn: () => customersService.getCustomer(id) });
export const useStoreLocator = (query: StoreLocatorQuery) => useQuery({ queryKey: keys.storeLocator(query), queryFn: () => storeLocatorService.search(query) });
export const useAccount = () => useQuery({ queryKey: keys.account, queryFn: customersService.getAccount });
export const useNotifications = () => useQuery({ queryKey: keys.notifications, queryFn: notificationsService.getNotifications });
export const useSupportCases = () => useQuery({ queryKey: keys.supportCases, queryFn: supportService.getCases });

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckoutInput & { items: CartItem[]; idempotencyKey?: string }) => ordersService.createOrder(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      void queryClient.invalidateQueries({ queryKey: keys.dashboard });
    }
  });
}

export function useCancelOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ordersService.cancelOrder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["order", id] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["approvals"] });
      void queryClient.invalidateQueries({ queryKey: keys.dashboard });
    }
  });
}

export function useDecideOrder(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderDecisionInput) => ordersService.decideOrder(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["order", id] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["approvals"] });
      void queryClient.invalidateQueries({ queryKey: keys.dashboard });
      void queryClient.invalidateQueries({ queryKey: keys.notifications });
    }
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: notificationsService.markRead, onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.notifications }) });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: notificationsService.markAllRead, onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.notifications }) });
}

export function useSaveStoreProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StoreProfileInput) => customersService.saveStoreProfile(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.account });
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });
}

export function useSupportCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupportCaseInput) => supportService.createCase(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.supportCases });
      void queryClient.invalidateQueries({ queryKey: keys.notifications });
    }
  });
}

export function useLogout() {
  return useMutation({ mutationFn: authService.logout });
}
