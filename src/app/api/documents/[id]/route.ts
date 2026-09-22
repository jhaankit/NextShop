import { NextRequest } from "next/server";
import { apiError, apiJson, requireApiSession } from "@/app/api/_lib";
import { mockRepository } from "@/mocks/repository";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = requireApiSession(request, ["invoices.read"]);
  if (session instanceof Response) return session;
  const { id } = await context.params;
  const document = mockRepository.documents.byId(id);
  if (!document) return apiError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
  return apiJson(document);
}
