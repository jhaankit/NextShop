import { apiFetch } from "@/services/http";
import type { SupportCaseInput } from "@/schemas/forms";
import type { SupportCase } from "@/types/domain";

export const supportService = {
  getCases: () => apiFetch<SupportCase[]>("/api/support/cases"),
  createCase: (payload: SupportCaseInput) => apiFetch<SupportCase>("/api/support/cases", { method: "POST", body: JSON.stringify(payload) })
};
