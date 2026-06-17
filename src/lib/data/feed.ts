import type { Outfit, Product, Season, StyleProfile } from "@/lib/types";
import { CATALOG } from "@/lib/data/catalog";
import { generateOutfit } from "@/lib/ai/stylist";

/** Personalized + editorial product feeds for the home screen. */

function inStock(p: Product) {
  return p.variants.some((v) => v.inventory > 0);
}

function affinity(p: Product, profile: StyleProfile): number {
  let s = p.rating * 4;
  if (profile.favoriteBrandIds.includes(p.brandId)) s += 30;
  const colorHit = profile.colorPreferences.some((c) =>
    (p.color.name + p.id).toLowerCase().includes(c.toLowerCase()),
  );
  if (colorHit) s += 16;
  if (profile.colorAvoids.some((c) => (p.color.name + p.id).toLowerCase().includes(c.toLowerCase()))) s -= 30;
  if (p.msrp && p.msrp > p.price) s += 6;
  if (p.price <= profile.budget / 3) s += 6;
  return s;
}

export function recommendedForYou(profile: StyleProfile, n = 6): Product[] {
  return CATALOG.filter(inStock)
    .map((p) => ({ p, s: affinity(p, profile) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.p);
}

export function trendingNow(n = 8): Product[] {
  return [...CATALOG]
    .filter(inStock)
    .sort((a, b) => b.rating * Math.log10(b.reviewCount + 10) - a.rating * Math.log10(a.reviewCount + 10))
    .slice(0, n);
}

export function newArrivals(n = 8): Product[] {
  // Stable pseudo-"new" ordering by id hash so it doesn't reshuffle each render.
  return [...CATALOG]
    .filter(inStock)
    .sort((a, b) => hash(b.id) - hash(a.id))
    .slice(0, n);
}

export function onSale(n = 6): Product[] {
  return CATALOG.filter((p) => inStock(p) && p.msrp && p.msrp > p.price).slice(0, n);
}

export function seasonalPicks(season: Season, n = 6): Product[] {
  return CATALOG.filter((p) => inStock(p) && (p.seasons.includes(season) || p.seasons.includes("all"))).slice(0, n);
}

const DAILY_THEMES: { prompt: string }[] = [
  { prompt: "An easy everyday outfit, neutral and clean" },
  { prompt: "A sharp business casual look for the week ahead" },
  { prompt: "A relaxed weekend streetwear fit" },
  { prompt: "A date-night outfit, elevated and modern" },
  { prompt: "An old-money inspired look, navy and cream" },
  { prompt: "A vacation outfit for warm weather" },
  { prompt: "A polished interview-ready outfit" },
];

/** Deterministic "Outfit of the Day" — same look all day, fresh tomorrow. */
export function outfitOfTheDay(profile: StyleProfile): Outfit {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const theme = DAILY_THEMES[dayIndex % DAILY_THEMES.length];
  const { outfit } = generateOutfit(profile, { prompt: theme.prompt });
  return { ...outfit, id: `ootd-${dayIndex}` };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
