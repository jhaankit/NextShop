import { NextRequest } from "next/server";
import { apiJson, requireApiSession } from "@/app/api/_lib";

export function GET(request: NextRequest) {
  const session = requireApiSession(request);
  if (session instanceof Response) return session;
  return apiJson(session);
}
