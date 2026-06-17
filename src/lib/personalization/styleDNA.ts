import type { Cart, Outfit, StyleProfile } from "@/lib/types";
import { getProduct } from "@/lib/data/catalog";
import { getBrand } from "@/lib/data/brands";

/**
 * Style DNA — a personalization profile derived from everything Mira knows:
 * stated preferences, saved looks, and bag activity. Drives the home feed, the
 * style score, and recommendation ranking. A production version would also fold
 * in purchase history and social-inspiration signals.
 */

export interface StyleTrait {
  label: string;
  /** 0–100 strength. */
  value: number;
}

export interface StyleDNA {
  /** 0–100 overall "style score" — completeness + signal richness. */
  score: number;
  tier: "Emerging" | "Defined" | "Refined" | "Iconic";
  traits: StyleTrait[];
  palette: string[];
  topBrands: string[];
  /** Short, human description of the user's taste. */
  descriptor: string;
}

const KEYWORD_TRAITS: Record<string, string> = {
  minimal: "Minimalist",
  classic: "Classic",
  vintage: "Vintage",
  bold: "Bold",
  preppy: "Preppy",
  edgy: "Edgy",
  tailored: "Tailored",
  sporty: "Sporty",
  elevated: "Elevated",
  earthy: "Earthy",
  monochrome: "Monochrome",
  relaxed: "Relaxed",
};

export function computeStyleDNA(profile: StyleProfile, saved: Outfit[], cart: Cart): StyleDNA {
  // ---- score: how much signal Mira has ----
  let score = 0;
  if (profile.name) score += 6;
  if (profile.bodyType) score += 10;
  if (profile.heightCm && profile.weightKg) score += 8;
  score += Math.min(Object.values(profile.sizes).filter(Boolean).length, 5) * 4;
  score += Math.min(profile.favoriteBrandIds.length, 5) * 3;
  score += Math.min(profile.colorPreferences.length, 5) * 2;
  score += Math.min(profile.styleKeywords.length, 6) * 3;
  if (profile.bodyPhoto) score += 8;
  score += Math.min(saved.length, 6) * 4;
  score += Math.min(cart.lines.length, 4) * 2;
  score = Math.min(Math.round(score), 100);

  const tier: StyleDNA["tier"] = score >= 85 ? "Iconic" : score >= 65 ? "Refined" : score >= 40 ? "Defined" : "Emerging";

  // ---- traits ----
  const traitMap = new Map<string, number>();
  for (const k of profile.styleKeywords) {
    const label = KEYWORD_TRAITS[k] ?? cap(k);
    traitMap.set(label, (traitMap.get(label) ?? 40) + 28);
  }
  // infer from saved outfit modes
  for (const o of saved) {
    const label = MODE_TRAIT[o.mode];
    if (label) traitMap.set(label, (traitMap.get(label) ?? 35) + 14);
  }
  if (traitMap.size === 0) traitMap.set("Versatile", 55);
  const traits = [...traitMap.entries()]
    .map(([label, value]) => ({ label, value: Math.min(value, 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // ---- palette: preferences + saved outfit colors ----
  const palette: string[] = [];
  for (const o of saved) for (const hex of o.palette) if (palette.length < 6 && !palette.includes(hex)) palette.push(hex);
  if (palette.length < 6) {
    for (const c of profile.colorPreferences) {
      const hex = COLOR_HEX[c];
      if (hex && !palette.includes(hex) && palette.length < 6) palette.push(hex);
    }
  }
  if (palette.length === 0) palette.push("#1A1714", "#E3DDD2", "#222B3D", "#C9BFA8");

  // ---- top brands: favorites + brands appearing in saved/cart ----
  const brandCount = new Map<string, number>();
  for (const id of profile.favoriteBrandIds) brandCount.set(id, (brandCount.get(id) ?? 0) + 2);
  const allLines = [...cart.lines, ...saved.flatMap((o) => o.pieces)];
  for (const line of allLines) {
    const p = getProduct((line as { productId: string }).productId);
    if (p) brandCount.set(p.brandId, (brandCount.get(p.brandId) ?? 0) + 1);
  }
  const topBrands = [...brandCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => getBrand(id)?.name ?? id);

  const descriptor = buildDescriptor(traits, profile);

  return { score, tier, traits, palette, topBrands, descriptor };
}

const MODE_TRAIT: Record<string, string> = {
  streetwear: "Streetwear",
  "business-casual": "Polished",
  "date-night": "Elevated",
  formal: "Refined",
  gym: "Sporty",
  vacation: "Relaxed",
  everyday: "Easy",
  college: "Casual",
  wedding: "Dressy",
  interview: "Sharp",
};

const COLOR_HEX: Record<string, string> = {
  black: "#1A1714", white: "#F3F0EA", navy: "#222B3D", grey: "#8D8F93",
  olive: "#5B5A3E", camel: "#A9824F", stone: "#C9BFA8", brown: "#5A3B22",
  garnet: "#6E2230", sage: "#7C8568", blue: "#5D7793", cream: "#EDE6D8",
};

function buildDescriptor(traits: StyleTrait[], profile: StyleProfile): string {
  const t = traits.slice(0, 2).map((x) => x.label.toLowerCase());
  const fit = profile.fitPreference ? `${profile.fitPreference} fits` : "considered fits";
  if (t.length === 0) return `Your taste is still taking shape — keep styling to sharpen it.`;
  return `You gravitate to ${t.join(" and ")} pieces in ${fit}.`;
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
