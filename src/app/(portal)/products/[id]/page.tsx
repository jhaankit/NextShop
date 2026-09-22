import { ProductDetailClient } from "@/components/features/product-detail-client";
import { requireSession } from "@/services/auth/server";
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) { await requireSession(["products.read"]); const { id } = await params; return <ProductDetailClient id={id} />; }
