import { NextRequest } from "next/server";
import { apiError, apiJson, requireApiSession } from "@/app/api/_lib";
import { mockRepository } from "@/mocks/repository";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = requireApiSession(request, ["invoices.read"]);
  if (session instanceof Response) return session;
  const { id } = await context.params;
  const invoice = mockRepository.invoices.byId(id);
  if (!invoice) return apiError(404, "INVOICE_NOT_FOUND", "Invoice not found.");
  return apiJson(invoice);
}
