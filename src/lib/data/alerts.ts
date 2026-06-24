import type { Product } from "@/lib/types";
import { CATALOG, getProduct } from "@/lib/data/catalog";
import { trendingNow, newArrivals } from "@/lib/data/feed";

/**
 * Alerts engine — the retention surface.
 *
 * Price drops are derived from current markdowns (msrp > price). Watched items
 * are prioritized. Low-stock watches and trend/new-arrival feeds round it out.
 * In production this is driven by the `PricePoint` history table (see
 * prisma/schema.prisma) + a background job diffing retailer feeds.
 */

export interface PriceDrop {
  product: Product;
  dropPct: number;
  saved: number; // dollars off
}

export interface AlertsResult {
  priceDrops: PriceDrop[];
  watchedLowStock: Product[];
  backInBudget: Product[];
  trending: Product[];
  newArrivals: Product[];
  /** Count surfaced as the bell badge. */
  badgeCount: number;
}

function dropFor(p: Product): PriceDrop | null {
  if (!p.msrp || p.msrp <= p.price) return null;
  return { product: p, dropPct: Math.round(((p.msrp - p.price) / p.msrp) * 100), saved: p.msrp - p.price };
}

function lowStock(p: Product): boolean {
  const total = p.variants.reduce((t, v) => t + v.inventory, 0);
  return total > 0 && total <= 6;
}

export function computeAlerts(watchlist: string[], budget = 400): AlertsResult {
  const watched = watchlist.map(getProduct).filter(Boolean) as Product[];
  const watchedIds = new Set(watchlist);

  // Price drops: watched-on-sale first, then the rest of the catalog's markdowns.
  const watchedDrops = watched.map(dropFor).filter(Boolean) as PriceDrop[];
  const otherDrops = CATALOG.filter((p) => !watchedIds.has(p.id))
    .map(dropFor)
    .filter(Boolean) as PriceDrop[];
  const priceDrops = [...watchedDrops, ...otherDrops.sort((a, b) => b.dropPct - a.dropPct)];

  const watchedLowStock = watched.filter(lowStock);
  // Watched items that now sit under a third of the per-outfit budget = easy add.
  const backInBudget = watched.filter((p) => p.price <= budget / 3);

  return {
    priceDrops,
    watchedLowStock,
    backInBudget,
    trending: trendingNow(),
    newArrivals: newArrivals(),
    badgeCount: watchedDrops.length + watchedLowStock.length,
  };
}
