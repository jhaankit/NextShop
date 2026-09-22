import { apiFetch } from "@/services/http";
import type { DashboardSummary } from "@/types/domain";

export const dashboardService = {
  getDashboard: () => apiFetch<DashboardSummary>("/api/dashboard")
};
