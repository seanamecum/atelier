import type { NextRequest } from "next/server";
import { ok } from "@/lib/services/envelope";
import { CATALOG } from "@/lib/data/catalog";
import type { Category, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/products
 *   ?category=top&q=linen&minPrice=20&maxPrice=200&inStock=1&limit=24&offset=0
 *
 * The product catalog endpoint. Today it reads the in-memory catalog; in
 * production this is backed by Postgres (a synced retailer-feed cache) — the
 * response contract stays identical so clients never change.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category") as Category | null;
  const q = sp.get("q")?.toLowerCase();
  const minPrice = numParam(sp.get("minPrice"));
  const maxPrice = numParam(sp.get("maxPrice"));
  const inStockOnly = sp.get("inStock") === "1";
  const limit = Math.min(numParam(sp.get("limit")) ?? 48, 100);
  const offset = numParam(sp.get("offset")) ?? 0;

  let items: Product[] = CATALOG;
  if (category) items = items.filter((p) => p.category === category);
  if (q) items = items.filter((p) => (p.name + " " + p.description).toLowerCase().includes(q));
  if (minPrice != null) items = items.filter((p) => p.price >= minPrice);
  if (maxPrice != null) items = items.filter((p) => p.price <= maxPrice);
  if (inStockOnly) items = items.filter((p) => p.variants.some((v) => v.inventory > 0));

  const total = items.length;
  const page = items.slice(offset, offset + limit);
  return ok({ products: page, total, limit, offset });
}

function numParam(v: string | null): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
