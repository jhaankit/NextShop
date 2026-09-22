import { apiFetch } from "@/services/http";
import type { LoginInput, PasswordResetInput } from "@/schemas/forms";
import type { Session } from "@/types/domain";

export const authService = {
  login: (payload: LoginInput) => apiFetch<Session>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  requestPasswordReset: (payload: PasswordResetInput) => apiFetch<{ status: string; message: string }>("/api/auth/password-reset", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  session: () => apiFetch<Session>("/api/auth/session")
};
