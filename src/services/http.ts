import { PortalApiError, safeErrorMessage } from "@/lib/errors";
import type { ApiErrorShape } from "@/types/domain";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
const csrfCookieName = "retailer_csrf";

function readCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .map((item) => item.split("="))
    .find(([key]) => key === name)?.[1];
}

function headersWithSecurity(init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (!["GET", "HEAD", undefined].includes(init?.method)) {
    const csrf = readCookie(csrfCookieName);
    if (csrf) headers.set("X-CSRF-Token", decodeURIComponent(csrf));
  }
  return headers;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: headersWithSecurity(init)
  });

  if (!response.ok) {
    let error: ApiErrorShape = { status: response.status, code: "HTTP_ERROR", message: "The request failed." };
    try {
      error = (await response.json()) as ApiErrorShape;
    } catch {}
    if (response.status === 401 && typeof window !== "undefined") window.dispatchEvent(new Event("portal:session-expired"));
    throw new PortalApiError({ ...error, message: safeErrorMessage(response.status) === "The request could not be completed." ? error.message : safeErrorMessage(response.status) });
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function toQueryString<T extends object>(params: T) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" || typeof value === "number") {
      if (value !== "") query.set(key, String(value));
    }
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}
