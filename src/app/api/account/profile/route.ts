import { NextRequest } from "next/server";
import { apiError, apiJson, parseJson, requireApiSession, validationError } from "@/app/api/_lib";
import { storeProfileSchema } from "@/schemas/forms";
import { observability } from "@/lib/observability";
import { mockRepository } from "@/mocks/repository";

export async function PATCH(request: NextRequest) {
  const session = requireApiSession(request, ["account.manage"]);
  if (session instanceof Response) return session;
  const parsed = parseJson(storeProfileSchema, await request.json());
  if (parsed instanceof Error) return validationError(parsed);
  const profile = mockRepository.account.saveProfile(parsed, session.user.id);
  if (!profile) return apiError(404, "LOCATION_NOT_FOUND", "Location not found.");
  observability.recordMetric({ name: "location_profile.updated", tags: { locationId: parsed.locationId } });
  return apiJson(profile);
}
