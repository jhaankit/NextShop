import { NextRequest } from "next/server";
import { apiJson, parseJson, requireApiSession, validationError } from "@/app/api/_lib";
import { addressSchema } from "@/schemas/forms";
import { mockRepository } from "@/mocks/repository";

export async function POST(request: NextRequest) {
  const session = requireApiSession(request, ["account.manage"]);
  if (session instanceof Response) return session;
  const parsed = parseJson(addressSchema, await request.json());
  if (parsed instanceof Error) return validationError(parsed);
  const isUpdate = Boolean(parsed.id);
  const address = mockRepository.account.saveAddress(parsed);
  return apiJson(address, { status: isUpdate ? 200 : 201 });
}
