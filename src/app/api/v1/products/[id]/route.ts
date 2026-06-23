import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/services/envelope";
import { getProduct } from "@/lib/data/catalog";
import { getBrand } from "@/lib/data/brands";
import { getRetailer } from "@/lib/data/retailers";
import { affiliateLink } from "@/lib/retail/affiliate";

export const dynamic = "force-dynamic";

/** GET /api/v1/products/:id — product detail with resolved brand/retailer/affiliate link. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = getProduct(params.id);
  if (!product) return fail("not_found", `No product with id ${params.id}`, 404);
  return ok({
    product,
    brand: getBrand(product.brandId) ?? null,
    retailer: getRetailer(product.retailerId) ?? null,
    affiliateUrl: affiliateLink(product),
  });
}
