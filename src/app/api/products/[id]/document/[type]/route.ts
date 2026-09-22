import { NextRequest } from "next/server";
import { apiError, requireApiSession } from "@/app/api/_lib";
import { mockRepository } from "@/mocks/repository";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string; type: string }> }) {
  const session = requireApiSession(request, ["products.read"]);
  if (session instanceof Response) return session;
  const { id, type } = await context.params;
  const product = mockRepository.products.byId(id);
  if (!product) return apiError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  const document = product.documents.find((item) => item.type === type);
  if (!document) return apiError(404, "PRODUCT_DOCUMENT_NOT_FOUND", "Product document not found.");
  return new Response(`Mock ${document.label}\nSKU: ${product.sku}\nProduct: ${product.name}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${product.sku.toLowerCase()}-${document.type}.txt"`
    }
  });
}
