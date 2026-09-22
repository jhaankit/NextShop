import { NextRequest } from "next/server";
import { z } from "zod";
import { activeLocationId, apiJson, parseJson, requireApiSession, validationError } from "@/app/api/_lib";
import { mockRepository } from "@/mocks/repository";

const previewSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })),
  locationId: z.string().optional()
});

export async function POST(request: NextRequest) {
  const session = requireApiSession(request, ["orders.create"]);
  if (session instanceof Response) return session;
  const parsed = parseJson(previewSchema, await request.json());
  if (parsed instanceof Error) return validationError(parsed);
  return apiJson(mockRepository.orders.preview({ items: parsed.items, locationId: parsed.locationId ?? activeLocationId(request) }));
}
