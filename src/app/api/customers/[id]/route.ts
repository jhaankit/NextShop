import { NextRequest } from "next/server";
import { apiError, apiJson, requireApiSession } from "@/app/api/_lib";
import { mockRepository } from "@/mocks/repository";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = requireApiSession(request, ["customers.read"]);
  if (session instanceof Response) return session;
  const { id } = await context.params;
  const location = mockRepository.account.locationById(id);
  if (!location) return apiError(404, "CUSTOMER_NOT_FOUND", "Customer location not found.");
  return apiJson(location);
}
