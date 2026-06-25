import { describe, it, expect } from "vitest";
import { affiliateLink, checkInventory, planCartHandoff } from "@/lib/retail/affiliate";
import { CATALOG, getProduct } from "@/lib/data/catalog";
import { getRetailer } from "@/lib/data/retailers";
import type { CartLine } from "@/lib/types";

describe("affiliateLink", () => {
  it("builds a tagged outbound URL with the retailer's affiliate tag + utm", () => {
    const product = getProduct("p-tee-organic-white")!;
    const url = new URL(affiliateLink(product));
    const retailer = getRetailer(product.retailerId)!;
    expect(url.origin + url.pathname).toBe(retailer.baseUrl + product.productPath);
    expect(url.searchParams.get("aff")).toBe(retailer.affiliateTag);
    expect(url.searchParams.get("utm_source")).toBe("mira");
  });

  it("uses the rebranded mira-* affiliate tags, never the old atelier-*", () => {
    for (const r of CATALOG.map((p) => getRetailer(p.retailerId)!)) {
      expect(r.affiliateTag.startsWith("atelier")).toBe(false);
    }
  });
});

describe("checkInventory", () => {
  it("reports in-stock and out-of-stock variants correctly", () => {
    const product = CATALOG.find((p) => p.variants.some((v) => v.inventory > 0))!;
    const inStockSize = product.variants.find((v) => v.inventory > 0)!.size;
    expect(checkInventory(product.id, inStockSize).inStock).toBe(true);

    const oos = CATALOG.find((p) => p.variants.some((v) => v.inventory === 0));
    if (oos) {
      const oosSize = oos.variants.find((v) => v.inventory === 0)!.size;
      const res = checkInventory(oos.id, oosSize);
      expect(res.inStock).toBe(false);
      expect(res.remaining).toBe(0);
    }
  });

  it("treats unknown products/sizes as out of stock", () => {
    expect(checkInventory("nope", "M").inStock).toBe(false);
  });
});

describe("planCartHandoff", () => {
  it("groups lines by retailer and encodes the SKUs into a handoff URL", () => {
    // Two products from two different retailers.
    const a = CATALOG[0];
    const b = CATALOG.find((p) => p.retailerId !== a.retailerId)!;
    const lines: CartLine[] = [
      { productId: a.id, size: a.variants[0].size, qty: 1 },
      { productId: b.id, size: b.variants[0].size, qty: 2 },
    ];
    const plans = planCartHandoff(lines);
    expect(plans.length).toBe(2);
    const retailerIds = plans.map((p) => p.retailerId).sort();
    expect(retailerIds).toEqual([a.retailerId, b.retailerId].sort());
    for (const plan of plans) {
      expect(plan.handoffUrl).toContain("items=");
      expect(plan.lines.length).toBeGreaterThan(0);
      expect(plan.retailerName).toBeTruthy();
    }
  });

  it("ignores lines that reference unknown products", () => {
    expect(planCartHandoff([{ productId: "ghost", size: "M", qty: 1 }])).toEqual([]);
  });
});
