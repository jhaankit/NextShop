import { NextRequest } from "next/server";
import { apiError, apiJson, parseJson, validationError } from "@/app/api/_lib";
import { passwordResetSchema } from "@/schemas/forms";
import { getUserByEmail } from "@/mocks/data";

const resetAttempts = new Map<string, { count: number; windowStartedAt: number }>();

export async function POST(request: NextRequest) {
  const parsed = parseJson(passwordResetSchema, await request.json());
  if (parsed instanceof Error) return validationError(parsed);
  const key = parsed.email.toLowerCase();
  const now = Date.now();
  const attempt = resetAttempts.get(key);
  if (attempt && now - attempt.windowStartedAt < 60_000 && attempt.count >= 3) return apiError(429, "RESET_RATE_LIMITED", "Too many reset requests. Please wait a moment and try again.");
  resetAttempts.set(key, attempt && now - attempt.windowStartedAt < 60_000 ? { ...attempt, count: attempt.count + 1 } : { count: 1, windowStartedAt: now });
  if (parsed.relationship === "national-account") {
    return apiJson({ status: "REFERRED", message: "National account password help is routed to customer service in this demo." });
  }
  const user = getUserByEmail(parsed.email);
  if (user?.status === "INVITED") return apiError(409, "REGISTRATION_INCOMPLETE", "Account registration is not complete. A new invitation would be sent in a production system.");
  return apiJson({ status: "SENT", message: "If the account exists, password reset instructions have been sent." });
}
