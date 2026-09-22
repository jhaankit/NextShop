import { NextRequest } from "next/server";
import { activeLocationId, apiError, apiJson, requireApiSession } from "@/app/api/_lib";
import { mockRepository } from "@/mocks/repository";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = requireApiSession(request, ["products.read"]);
  if (session instanceof Response) return session;
  const { id } = await context.params;
  const product = mockRepository.products.byId(id, activeLocationId(request));
  if (!product) return apiError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  return apiJson(product);
}
