import type { Brand, OutfitMode } from "@/lib/types";

/**
 * Style-intent layer.
 *
 * Maps higher-order requests ("dress me like an investment banker", "make me
 * look taller", "old-money style") onto concrete styling adjustments: brand-tier
 * preferences, palette nudges, a mode bias, and the expert "why" notes shown in
 * the result. A real LLM stylist would emit this same structure as tool output.
 */

export interface StyleIntent {
  id: string;
  label: string;
  keywords: string[];
  /** Additive score by brand tier. */
  tierBoost?: Partial<Record<Brand["tier"], number>>;
  /** Color names to favor / penalize. */
  colorBoost?: string[];
  colorPenalty?: string[];
  /** Bias the outfit mode when the user didn't pick one explicitly. */
  modeBias?: OutfitMode;
  /** Expert styling notes surfaced to the user. */
  notes: string[];
}

export const STYLE_INTENTS: StyleIntent[] = [
  {
    id: "old-money",
    label: "Old money",
    keywords: ["old money", "old-money", "quiet luxury", "ivy", "preppy", "heritage", "ralph"],
    tierBoost: { luxury: 16, premium: 12, value: -10 },
    colorBoost: ["navy", "cream", "camel", "stone", "white", "brown", "sage"],
    colorPenalty: ["red", "pink"],
    modeBias: "business-casual",
    notes: [
      "Quiet-luxury palette — navy, cream and camel in tailored, logo-free pieces.",
      "Heritage fabrics over flash: the money stays quiet.",
    ],
  },
  {
    id: "investment-banker",
    label: "Investment banker",
    keywords: ["investment banker", "banker", "finance", "wall street", "corporate", "office power"],
    tierBoost: { premium: 14, luxury: 8 },
    colorBoost: ["navy", "grey", "charcoal", "white", "stone"],
    colorPenalty: ["olive", "garnet"],
    modeBias: "business-casual",
    notes: [
      "Boardroom sharp — a navy blazer, crisp shirt and tailored trousers.",
      "Leather loafers, a slim belt and a clean watch finish it.",
    ],
  },
  {
    id: "taller",
    label: "Look taller",
    keywords: ["taller", "look taller", "elongate", "longer legs", "height"],
    colorBoost: ["navy", "charcoal", "black", "grey"],
    notes: [
      "Monochrome from shoulder to shoe — one unbroken vertical line reads taller.",
      "High-rise bottoms and low-contrast shoes visually extend the leg.",
    ],
  },
  {
    id: "luxury",
    label: "Luxury",
    keywords: ["luxury", "luxe", "high end", "high-end", "designer", "expensive", "elevated"],
    tierBoost: { luxury: 18, premium: 10, value: -12 },
    colorBoost: ["black", "cream", "navy", "camel"],
    notes: ["Elevated with premium and designer pieces and a refined, restrained palette."],
  },
  {
    id: "minimal",
    label: "Minimal",
    keywords: ["minimal", "clean", "understated", "simple", "monochrome"],
    colorBoost: ["white", "black", "stone", "grey", "cream"],
    notes: ["Pared-back palette and clean lines — considered, never loud."],
  },
  {
    id: "crowd-pleaser",
    label: "Crowd-pleaser",
    keywords: ["girls would like", "crush", "cute", "attractive", "impress", "look good"],
    modeBias: "date-night",
    colorBoost: ["white", "navy", "sage", "cream"],
    notes: ["On-trend and approachable — a fitted top, clean denim and a fresh sneaker."],
  },
];

export interface IntentResult {
  matched: StyleIntent[];
  modeBias?: OutfitMode;
  notes: string[];
}

export function detectIntents(prompt: string): IntentResult {
  const text = prompt.toLowerCase();
  const matched = STYLE_INTENTS.filter((i) => i.keywords.some((k) => text.includes(k)));
  return {
    matched,
    modeBias: matched.find((m) => m.modeBias)?.modeBias,
    notes: matched.flatMap((m) => m.notes).slice(0, 4),
  };
}
