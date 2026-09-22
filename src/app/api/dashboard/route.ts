import { NextRequest } from "next/server";
import { activeLocationId, apiJson, requireApiSession } from "@/app/api/_lib";
import { mockRepository } from "@/mocks/repository";

export function GET(request: NextRequest) {
  const session = requireApiSession(request, ["products.read"]);
  if (session instanceof Response) return session;
  return apiJson(mockRepository.dashboard.summary(activeLocationId(request)));
}
