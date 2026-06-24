import { describe, it, expect } from "vitest";
import { computeAlerts } from "@/lib/data/alerts";
import { CATALOG } from "@/lib/data/catalog";

describe("computeAlerts", () => {
  it("surfaces only genuine markdowns as price drops, with correct percentages", () => {
    const { priceDrops } = computeAlerts([]);
    expect(priceDrops.length).toBeGreaterThan(0);
    for (const d of priceDrops) {
      expect(d.product.msrp).toBeGreaterThan(d.product.price);
      const expected = Math.round(((d.product.msrp! - d.product.price) / d.product.msrp!) * 100);
      expect(d.dropPct).toBe(expected);
      expect(d.saved).toBe(d.product.msrp! - d.product.price);
    }
  });

  it("prioritizes a watched on-sale item at the front and counts it in the badge", () => {
    const onSale = CATALOG.find((p) => p.msrp && p.msrp > p.price)!;
    const res = computeAlerts([onSale.id]);
    expect(res.priceDrops[0].product.id).toBe(onSale.id);
    expect(res.badgeCount).toBeGreaterThanOrEqual(1);
  });

  it("returns trending and new-arrival feeds", () => {
    const res = computeAlerts([]);
    expect(res.trending.length).toBeGreaterThan(0);
    expect(res.newArrivals.length).toBeGreaterThan(0);
  });

  it("has a zero badge when nothing is watched", () => {
    expect(computeAlerts([]).badgeCount).toBe(0);
  });
});
