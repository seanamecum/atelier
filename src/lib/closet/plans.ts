import type { Category, ClosetItem, Outfit, Product, Season, StyleProfile, OutfitMode } from "@/lib/types";
import { CATALOG } from "@/lib/data/catalog";
import { generateOutfit } from "@/lib/ai/stylist";

/**
 * Closet planning intelligence: packing lists and seasonal capsule plans built
 * from the user's owned items + the catalog. Deterministic and pure so they're
 * easy to test and reason about.
 */

function inStock(p: Product) {
  return p.variants.some((v) => v.inventory > 0);
}

function ownedByCategory(closet: ClosetItem[], category: Category): ClosetItem[] {
  return closet.filter((c) => c.category === category);
}

function suggestForGap(category: Category, season: Season, profile: StyleProfile, gap: number): Product[] {
  if (gap <= 0) return [];
  return CATALOG.filter(
    (p) => p.category === category && inStock(p) && (p.seasons.includes(season) || p.seasons.includes("all")),
  )
    .map((p) => ({ p, s: p.rating + (profile.favoriteBrandIds.includes(p.brandId) ? 1 : 0) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, gap)
    .map((x) => x.p);
}

// ---------------------------------------------------------------------------
// Packing list
// ---------------------------------------------------------------------------

export interface PackingEssential {
  category: Category;
  label: string;
  needed: number;
  owned: ClosetItem[];
  suggestions: Product[];
}

export interface PackingPlan {
  label: string;
  days: number;
  season: Season;
  essentials: PackingEssential[];
  outfits: Outfit[];
  tips: string[];
}

const CATEGORY_LABEL: Record<Category, string> = {
  top: "Tops", bottom: "Bottoms", dress: "Dresses", outerwear: "Outerwear",
  shoes: "Shoes", accessory: "Accessories", bag: "Bags",
};

export interface PackingOptions {
  label?: string;
  days: number;
  season: Season;
  mode: OutfitMode;
}

export function buildPackingList(profile: StyleProfile, closet: ClosetItem[], opts: PackingOptions): PackingPlan {
  const { days, season, mode } = opts;
  const cold = season === "winter" || season === "fall";

  // How many of each to bring, scaled to trip length.
  const counts: Partial<Record<Category, number>> = {
    top: Math.min(7, Math.ceil(days / 1.5) + 1),
    bottom: Math.min(5, Math.ceil(days / 2.5) + 1),
    outerwear: cold ? 2 : 1,
    shoes: days > 3 ? 2 : 1,
    accessory: 2,
    bag: 1,
  };

  const essentials: PackingEssential[] = (Object.keys(counts) as Category[]).map((category) => {
    const owned = ownedByCategory(closet, category);
    const needed = counts[category]!;
    const gap = Math.max(0, needed - owned.length);
    return {
      category,
      label: CATEGORY_LABEL[category],
      needed,
      owned,
      suggestions: suggestForGap(category, season, profile, gap),
    };
  });

  // A few ready-to-wear looks for the trip.
  const prompts = [
    `${season} ${mode} outfit for travel`,
    `relaxed ${season} day outfit`,
    `${season} evening outfit`,
  ];
  const outfits = prompts.slice(0, days > 4 ? 3 : 2).map((p) => generateOutfit(profile, { prompt: p, mode }).outfit);

  const tips: string[] = [
    `Packing for ~${days} days of ${season}. Aim for pieces that mix and match.`,
    cold ? "Layer with the overshirt/jacket so two looks share one warm layer." : "Lightweight, breathable fabrics travel best in warm weather.",
    "Wear your bulkiest shoes and jacket on travel day to save bag space.",
  ];

  return { label: opts.label ?? "Your trip", days, season, essentials, outfits, tips };
}

// ---------------------------------------------------------------------------
// Seasonal wardrobe capsule
// ---------------------------------------------------------------------------

export interface CapsuleSlot {
  category: Category;
  label: string;
  have: number;
  target: number;
  suggestions: Product[];
}

export interface SeasonalPlan {
  season: Season;
  completeness: number; // 0–100
  slots: CapsuleSlot[];
  note: string;
}

const CAPSULE_TARGET: Partial<Record<Category, number>> = {
  top: 5, bottom: 3, outerwear: 2, shoes: 2, accessory: 2,
};

export function seasonalWardrobe(profile: StyleProfile, closet: ClosetItem[], season: Season): SeasonalPlan {
  const slots: CapsuleSlot[] = (Object.keys(CAPSULE_TARGET) as Category[]).map((category) => {
    const have = ownedByCategory(closet, category).length;
    const target = CAPSULE_TARGET[category]!;
    return {
      category,
      label: CATEGORY_LABEL[category],
      have,
      target,
      suggestions: suggestForGap(category, season, profile, Math.max(0, target - have)),
    };
  });

  const totalHave = slots.reduce((t, s) => t + Math.min(s.have, s.target), 0);
  const totalTarget = slots.reduce((t, s) => t + s.target, 0);
  const completeness = Math.round((totalHave / totalTarget) * 100);

  const gaps = slots.filter((s) => s.have < s.target).map((s) => s.label.toLowerCase());
  const note =
    gaps.length === 0
      ? `Your ${season} capsule is complete — you can build a full week of looks from what you own.`
      : `To round out your ${season} capsule, focus on ${gaps.slice(0, 3).join(", ")}.`;

  return { season, completeness, slots, note };
}
