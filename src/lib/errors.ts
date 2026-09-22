import type { ApiErrorShape } from "@/types/domain";

export class PortalApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string[]>;

  constructor(error: ApiErrorShape) {
    super(error.message);
    this.name = "PortalApiError";
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
  }
}

export function errorShape(status: number, code: string, message: string, details?: Record<string, string[]>): ApiErrorShape {
  return { status, code, message, details };
}

export function safeErrorMessage(status: number) {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The requested resource could not be found.";
  if (status === 409) return "The request conflicts with the latest account data. Refresh and try again.";
  if (status === 422) return "Please review the highlighted fields and try again.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status >= 500) return "The service is temporarily unavailable. Please try again.";
  return "The request could not be completed.";
}
