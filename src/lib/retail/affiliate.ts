import type { CartLine, Product } from "@/lib/types";
import { getProduct } from "@/lib/data/catalog";
import { getRetailer } from "@/lib/data/retailers";

/**
 * Retail / commerce seam.
 *
 * Everything outbound (affiliate links, cart handoff, inventory) is funneled
 * through here so that swapping in a real affiliate network (Skimlinks, CJ,
 * Rakuten) or retailer cart APIs is a single-file change.
 */

/** Build an affiliate-tagged outbound product URL. */
export function affiliateLink(product: Product): string {
  const retailer = getRetailer(product.retailerId);
  if (!retailer) return "#";
  const url = new URL(retailer.baseUrl + product.productPath);
  url.searchParams.set("aff", retailer.affiliateTag);
  url.searchParams.set("utm_source", "mira");
  url.searchParams.set("utm_medium", "stylist");
  return url.toString();
}

export interface InventoryCheck {
  inStock: boolean;
  remaining: number;
}

/** Live-inventory lookup for a product/size (mocked from catalog variants). */
export function checkInventory(productId: string, size: string): InventoryCheck {
  const product = getProduct(productId);
  const variant = product?.variants.find((v) => v.size === size);
  const remaining = variant?.inventory ?? 0;
  return { inStock: remaining > 0, remaining };
}

export interface RetailerHandoff {
  retailerId: string;
  retailerName: string;
  supportsCartHandoff: boolean;
  /** Deep link that pre-fills the retailer cart (mocked). */
  handoffUrl: string;
  lines: CartLine[];
}

/**
 * Group cart lines by retailer and produce a handoff plan. In production each
 * group becomes either an "add to cart" API call (handoff retailers) or a deep
 * link the user completes themselves. We never auto-purchase — checkout always
 * routes back through an explicit user confirmation.
 */
export function planCartHandoff(lines: CartLine[]): RetailerHandoff[] {
  const byRetailer = new Map<string, CartLine[]>();
  for (const line of lines) {
    const product = getProduct(line.productId);
    if (!product) continue;
    const list = byRetailer.get(product.retailerId) ?? [];
    list.push(line);
    byRetailer.set(product.retailerId, list);
  }

  const plans: RetailerHandoff[] = [];
  byRetailer.forEach((groupLines, retailerId) => {
    const retailer = getRetailer(retailerId);
    if (!retailer) return;
    const skus = groupLines
      .map((l) => `${l.productId}:${l.size}:${l.qty}`)
      .join(",");
    const url = new URL(retailer.baseUrl + "/cart/add");
    url.searchParams.set("items", skus);
    url.searchParams.set("aff", retailer.affiliateTag);
    plans.push({
      retailerId,
      retailerName: retailer.name,
      supportsCartHandoff: retailer.supportsCartHandoff,
      handoffUrl: url.toString(),
      lines: groupLines,
    });
  });
  return plans;
}
