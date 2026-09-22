import { NextRequest } from "next/server";
import { apiJson, parseJson, requireApiSession, validationError } from "@/app/api/_lib";
import { supportCaseSchema } from "@/schemas/forms";
import { observability } from "@/lib/observability";
import { mockRepository } from "@/mocks/repository";

export function GET(request: NextRequest) {
  const session = requireApiSession(request);
  if (session instanceof Response) return session;
  return apiJson(mockRepository.support.list());
}

export async function POST(request: NextRequest) {
  const session = requireApiSession(request);
  if (session instanceof Response) return session;
  const parsed = parseJson(supportCaseSchema, await request.json());
  if (parsed instanceof Error) return validationError(parsed);
  const supportCase = mockRepository.support.create(parsed, session.user.id);
  observability.recordMetric({ name: "support_case.created", tags: { category: supportCase.category, priority: supportCase.priority } });
  return apiJson(supportCase, { status: 201 });
}
