import { NextRequest } from "next/server";
import { apiJson, parseJson, requireApiSession, validationError } from "@/app/api/_lib";
import { userSchema } from "@/schemas/forms";
import { mockRepository } from "@/mocks/repository";

export async function POST(request: NextRequest) {
  const session = requireApiSession(request, ["users.manage"]);
  if (session instanceof Response) return session;
  const parsed = parseJson(userSchema, await request.json());
  if (parsed instanceof Error) return validationError(parsed);
  const isUpdate = Boolean(parsed.id);
  const user = mockRepository.account.saveUser(parsed, session.user.id);
  return apiJson(user, { status: isUpdate ? 200 : 201 });
}
