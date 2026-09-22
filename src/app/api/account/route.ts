import { NextRequest } from "next/server";
import { apiJson, requireApiSession } from "@/app/api/_lib";
import { mockRepository } from "@/mocks/repository";

export function GET(request: NextRequest) {
  const session = requireApiSession(request, ["customers.read"]);
  if (session instanceof Response) return session;
  return apiJson(mockRepository.account.get());
}
