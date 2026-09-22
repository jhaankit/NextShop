import { NextRequest } from "next/server";
import { apiError, requireApiSession } from "@/app/api/_lib";
import { mockRepository } from "@/mocks/repository";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = requireApiSession(request, ["invoices.read"]);
  if (session instanceof Response) return session;
  const { id } = await context.params;
  const document = mockRepository.documents.byId(id);
  if (!document) return apiError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
  const body = [
    "Retailer Portal Mock Document",
    `Document: ${document.documentNumber}`,
    `Type: ${document.type}`,
    `Status: ${document.status}`,
    `Issued: ${document.issuedAt}`,
    document.orderId ? `Order: ${document.orderId}` : undefined,
    document.amount !== undefined ? `Amount: ${document.currency ?? "USD"} ${document.amount.toFixed(2)}` : undefined
  ].filter(Boolean).join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${document.documentNumber.toLowerCase()}.txt"`
    }
  });
}
