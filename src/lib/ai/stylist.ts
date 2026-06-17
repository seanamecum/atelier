import type {
  Category,
  ClosetItem,
  Outfit,
  OutfitMode,
  OutfitPiece,
  Product,
  Season,
  StyleProfile,
} from "@/lib/types";
import { CATALOG } from "@/lib/data/catalog";
import { getBrand } from "@/lib/data/brands";
import { detectIntents, type StyleIntent } from "@/lib/ai/intents";
import { uid, modeLabel } from "@/lib/utils/format";

/**
 * Mock AI stylist engine.
 *
 * This deterministically assembles an outfit from the catalog given a natural
 * language request and the user's style profile. It is intentionally a pure,
 * synchronous function so it is trivial to test and reason about.
 *
 * To go live, replace `generateOutfit` with a call to an LLM (e.g. Claude) that
 * returns the same `Outfit` shape — the UI and commerce layers won't change.
 * `parseRequest` is a great few-shot target; the slot recipes below become the
 * tool/structured-output schema.
 */

// ---------------------------------------------------------------------------
// Request parsing
// ---------------------------------------------------------------------------

export interface ParsedRequest {
  mode: OutfitMode;
  budget?: number;
  season?: Season;
  /** Color names hinted in the prompt. */
  colorHints: string[];
  /** Free keywords pulled from the prompt. */
  keywords: string[];
  wantsDress: boolean;
  /** Higher-order style intents detected (old-money, banker, taller…). */
  intents: StyleIntent[];
}

const MODE_SYNONYMS: Record<OutfitMode, string[]> = {
  streetwear: ["streetwear", "street", "hype", "casual cool"],
  college: ["college", "campus", "class", "student", "lecture"],
  "date-night": ["date", "date night", "dinner", "romantic", "drinks"],
  gym: ["gym", "workout", "training", "lift", "run", "athletic", "exercise"],
  vacation: ["vacation", "holiday", "beach", "resort", "travel", "trip", "getaway"],
  "business-casual": ["business casual", "smart casual", "office", "work", "meeting"],
  formal: ["formal", "black tie", "gala", "cocktail", "evening"],
  wedding: ["wedding", "guest", "ceremony", "reception"],
  interview: ["interview", "job interview", "first impression"],
  everyday: ["everyday", "casual", "daily", "errand", "weekend", "relaxed"],
};

const COLOR_WORDS = [
  "black", "white", "navy", "blue", "grey", "gray", "charcoal", "olive", "green",
  "khaki", "camel", "tan", "brown", "beige", "cream", "ivory", "stone", "sand",
  "red", "garnet", "burgundy", "pink", "sage", "forest", "indigo", "denim",
];

const SEASON_WORDS: Record<string, Season> = {
  summer: "summer", spring: "spring", fall: "fall", autumn: "fall", winter: "winter",
  hot: "summer", warm: "summer", cold: "winter", cool: "fall",
};

export function parseRequest(prompt: string, fallbackMode: OutfitMode = "everyday"): ParsedRequest {
  const text = prompt.toLowerCase();

  // Mode: first synonym that appears wins; longer phrases checked first.
  let mode: OutfitMode = fallbackMode;
  let bestLen = 0;
  (Object.keys(MODE_SYNONYMS) as OutfitMode[]).forEach((m) => {
    for (const syn of MODE_SYNONYMS[m]) {
      if (text.includes(syn) && syn.length > bestLen) {
        mode = m;
        bestLen = syn.length;
      }
    }
  });

  // Budget: "$200", "under 150", "around $300".
  let budget: number | undefined;
  const moneyMatch = text.match(/\$?\s?(\d{2,4})/);
  if (moneyMatch && /(\$|under|below|max|budget|around|less than|spend)/.test(text)) {
    budget = parseInt(moneyMatch[1], 10);
  }

  // Season
  let season: Season | undefined;
  for (const [word, s] of Object.entries(SEASON_WORDS)) {
    if (text.includes(word)) { season = s; break; }
  }

  const colorHints = COLOR_WORDS.filter((c) => text.includes(c));
  const wantsDress = /\bdress\b|\bgown\b/.test(text);

  const keywords = text
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  // Higher-order intents — may bias the mode if the user didn't name one.
  const intent = detectIntents(prompt);
  if (intent.modeBias && bestLen === 0) mode = intent.modeBias;

  return { mode, budget, season, colorHints, keywords, wantsDress, intents: intent.matched };
}

// ---------------------------------------------------------------------------
// Outfit recipes (which slots a look needs)
// ---------------------------------------------------------------------------

interface SlotSpec {
  category: Category;
  required: boolean;
}

const RECIPES: Record<OutfitMode, SlotSpec[]> = {
  streetwear: [
    { category: "top", required: true },
    { category: "bottom", required: true },
    { category: "shoes", required: true },
    { category: "outerwear", required: false },
    { category: "accessory", required: false },
  ],
  college: [
    { category: "top", required: true },
    { category: "bottom", required: true },
    { category: "shoes", required: true },
    { category: "outerwear", required: false },
    { category: "bag", required: false },
  ],
  "date-night": [
    { category: "top", required: true },
    { category: "bottom", required: true },
    { category: "shoes", required: true },
    { category: "outerwear", required: false },
    { category: "accessory", required: false },
  ],
  gym: [
    { category: "top", required: true },
    { category: "bottom", required: true },
    { category: "shoes", required: true },
    { category: "bag", required: false },
  ],
  vacation: [
    { category: "top", required: true },
    { category: "bottom", required: true },
    { category: "shoes", required: true },
    { category: "accessory", required: false },
    { category: "bag", required: false },
  ],
  "business-casual": [
    { category: "top", required: true },
    { category: "bottom", required: true },
    { category: "shoes", required: true },
    { category: "outerwear", required: false },
    { category: "accessory", required: false },
  ],
  formal: [
    { category: "outerwear", required: true },
    { category: "top", required: true },
    { category: "bottom", required: true },
    { category: "shoes", required: true },
    { category: "accessory", required: false },
  ],
  wedding: [
    { category: "outerwear", required: true },
    { category: "top", required: true },
    { category: "bottom", required: true },
    { category: "shoes", required: true },
    { category: "accessory", required: false },
  ],
  interview: [
    { category: "outerwear", required: false },
    { category: "top", required: true },
    { category: "bottom", required: true },
    { category: "shoes", required: true },
    { category: "accessory", required: false },
  ],
  everyday: [
    { category: "top", required: true },
    { category: "bottom", required: true },
    { category: "shoes", required: true },
    { category: "outerwear", required: false },
  ],
};

/** Dress-led recipe used when the request explicitly asks for a dress. */
const DRESS_RECIPE: SlotSpec[] = [
  { category: "dress", required: true },
  { category: "shoes", required: true },
  { category: "outerwear", required: false },
  { category: "accessory", required: false },
  { category: "bag", required: false },
];

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function inStock(p: Product): boolean {
  return p.variants.some((v) => v.inventory > 0);
}

function matchesColorName(p: Product, names: string[]): boolean {
  if (names.length === 0) return false;
  const hay = (p.color.name + " " + p.id).toLowerCase();
  return names.some((n) => hay.includes(n.toLowerCase()));
}

function scoreProduct(
  p: Product,
  mode: OutfitMode,
  req: ParsedRequest,
  profile: StyleProfile,
): number {
  let score = 0;

  // Occasion fit is the dominant signal.
  if (p.styleTags.includes(mode)) score += 50;
  else score -= 8;

  // Color preferences from the profile.
  if (matchesColorName(p, profile.colorPreferences)) score += 16;
  if (matchesColorName(p, profile.colorAvoids)) score -= 40;

  // Colors hinted in the prompt itself outrank stored preferences.
  if (matchesColorName(p, req.colorHints)) score += 24;

  // Favorite brands.
  if (profile.favoriteBrandIds.includes(p.brandId)) score += 14;

  // Season alignment.
  if (req.season && (p.seasons.includes(req.season) || p.seasons.includes("all"))) score += 8;

  // Prompt keyword hits in name/description.
  const text = (p.name + " " + p.description).toLowerCase();
  for (const k of req.keywords) if (text.includes(k)) score += 3;

  // Style taste keywords from the profile.
  for (const k of profile.styleKeywords) {
    if (text.includes(k.toLowerCase())) score += 4;
  }

  // Higher-order style intents (old-money, banker, taller, luxury…).
  if (req.intents.length) {
    const tier = getBrand(p.brandId)?.tier;
    for (const intent of req.intents) {
      if (tier && intent.tierBoost?.[tier]) score += intent.tierBoost[tier]!;
      if (intent.colorBoost && matchesColorName(p, intent.colorBoost)) score += 18;
      if (intent.colorPenalty && matchesColorName(p, intent.colorPenalty)) score -= 22;
    }
  }

  // Quality nudge.
  score += (p.rating - 4) * 6;

  // Small markdown reward.
  if (p.msrp && p.msrp > p.price) score += 4;

  return score;
}

// ---------------------------------------------------------------------------
// Size recommendation
// ---------------------------------------------------------------------------

function isAlphaSized(p: Product): boolean {
  return /^(XS|S|M|L|XL|XXL)$/.test(p.variants[0]?.size ?? "");
}

function recommendedSizeFor(p: Product, profile: StyleProfile): string {
  const s = profile.sizes;
  let preferred: string | undefined;
  switch (p.category) {
    case "top":
    case "dress":
      preferred = p.category === "dress" ? s.dress ?? s.top : s.top;
      break;
    case "outerwear":
      preferred = s.outerwear ?? s.top;
      break;
    case "bottom":
      preferred = isAlphaSized(p) ? s.top : s.bottomWaist;
      break;
    case "shoes":
      preferred = s.shoe;
      break;
    default:
      preferred = undefined;
  }

  const stocked = p.variants.filter((v) => v.inventory > 0);
  if (stocked.length === 0) return p.variants[0]?.size ?? "OS";

  // Exact preferred size in stock.
  if (preferred) {
    const exact = stocked.find((v) => v.size === preferred);
    if (exact) return exact.size;
  }
  // Single-size items (OS).
  if (stocked.length === 1) return stocked[0].size;
  // Otherwise nearest in-stock to the middle of the run.
  return stocked[Math.floor(stocked.length / 2)].size;
}

// ---------------------------------------------------------------------------
// Rationale copy
// ---------------------------------------------------------------------------

function rationaleFor(p: Product, mode: OutfitMode, req: ParsedRequest, profile: StyleProfile): string {
  const bits: string[] = [];
  if (p.styleTags.includes(mode)) bits.push(`tuned for ${modeLabel(mode).toLowerCase()}`);
  if (matchesColorName(p, req.colorHints)) bits.push(`in the ${p.color.name.toLowerCase()} you asked for`);
  else if (matchesColorName(p, profile.colorPreferences)) bits.push(`in your ${p.color.name.toLowerCase()} palette`);
  if (profile.favoriteBrandIds.includes(p.brandId)) bits.push("from a brand you love");
  if (p.msrp && p.msrp > p.price) bits.push("and currently on sale");
  if (bits.length === 0) bits.push("a versatile anchor for the look");
  const lead = bits.shift()!;
  return `${lead.charAt(0).toUpperCase() + lead.slice(1)}${bits.length ? ", " + bits.join(", ") : ""}.`;
}

// ---------------------------------------------------------------------------
// Outfit assembly
// ---------------------------------------------------------------------------

export interface GenerateOptions {
  prompt?: string;
  /** Explicit mode override (e.g. from the mode picker). */
  mode?: OutfitMode;
  /** Closet items to build the outfit around. */
  buildAround?: ClosetItem[];
}

export interface GenerateResult {
  outfit: Outfit;
  parsed: ParsedRequest;
  /** True when even the cheapest valid combination exceeds the budget. */
  overBudget: boolean;
}

export function generateOutfit(profile: StyleProfile, opts: GenerateOptions = {}): GenerateResult {
  const prompt = opts.prompt?.trim() ?? "";
  const parsed = parseRequest(prompt, opts.mode ?? "everyday");
  if (opts.mode) parsed.mode = opts.mode;

  const budget = parsed.budget ?? profile.budget ?? 600;
  const recipe = parsed.wantsDress ? DRESS_RECIPE : RECIPES[parsed.mode];

  // Slots already satisfied by closet items the user wants to build around.
  const buildAround = opts.buildAround ?? [];
  const closetBySlot = new Map<Category, ClosetItem>();
  for (const item of buildAround) {
    if (!closetBySlot.has(item.category)) closetBySlot.set(item.category, item);
  }

  // Rank catalog candidates per slot.
  type Candidate = { product: Product; score: number };
  const slotCandidates = new Map<Category, Candidate[]>();
  for (const slot of recipe) {
    if (closetBySlot.has(slot.category)) continue; // filled from closet
    const ranked = CATALOG.filter((p) => p.category === slot.category && inStock(p))
      .map((p) => ({ product: p, score: scoreProduct(p, parsed.mode, parsed, profile) }))
      .sort((a, b) => b.score - a.score);
    slotCandidates.set(slot.category, ranked);
  }

  // --- choose required slots, budget-aware -------------------------------
  const requiredSlots = recipe.filter((s) => s.required && !closetBySlot.has(s.category));
  const chosen = new Map<Category, Product>();
  for (const slot of requiredSlots) {
    const top = slotCandidates.get(slot.category)?.[0];
    if (top) chosen.set(slot.category, top.product);
  }

  const sumChosen = () => Array.from(chosen.values()).reduce((t, p) => t + p.price, 0);

  // Downgrade greedily until under budget (or no cheaper swaps remain).
  let guard = 0;
  while (sumChosen() > budget && guard++ < 40) {
    let bestSwap: { cat: Category; product: Product; saving: number; scoreLoss: number } | null = null;
    for (const slot of requiredSlots) {
      const current = chosen.get(slot.category);
      const cands = slotCandidates.get(slot.category);
      if (!current || !cands) continue;
      const cheaper = cands.filter((c) => c.product.price < current.price);
      if (cheaper.length === 0) continue;
      // Prefer the alternative that saves money with the least score loss.
      const currentScore = cands.find((c) => c.product.id === current.id)?.score ?? 0;
      const best = cheaper.sort((a, b) => b.product.price - a.product.price)[0]; // closest cheaper
      const saving = current.price - best.product.price;
      const scoreLoss = currentScore - best.score;
      if (!bestSwap || saving / (scoreLoss + 1) > bestSwap.saving / (bestSwap.scoreLoss + 1)) {
        bestSwap = { cat: slot.category, product: best.product, saving, scoreLoss };
      }
    }
    if (!bestSwap) break;
    chosen.set(bestSwap.cat, bestSwap.product);
  }

  const overBudget = sumChosen() > budget;

  // --- add optional slots while budget remains ---------------------------
  const optionalSlots = recipe.filter((s) => !s.required && !closetBySlot.has(s.category));
  for (const slot of optionalSlots) {
    const cands = slotCandidates.get(slot.category);
    const top = cands?.[0];
    if (!top) continue;
    if (sumChosen() + top.product.price <= budget) {
      chosen.set(slot.category, top.product);
    }
  }

  // --- build pieces in recipe order --------------------------------------
  const pieces: OutfitPiece[] = [];
  for (const slot of recipe) {
    const closetItem = closetBySlot.get(slot.category);
    if (closetItem) {
      pieces.push({
        productId: closetItem.matchedProductId ?? "",
        recommendedSize: profile.sizes.top ?? "—",
        rationale: `Built around your ${closetItem.label.toLowerCase()} from your closet.`,
        fromCloset: true,
        closetItemId: closetItem.id,
      });
      continue;
    }
    const product = chosen.get(slot.category);
    if (!product) continue;
    pieces.push({
      productId: product.id,
      recommendedSize: recommendedSizeFor(product, profile),
      rationale: rationaleFor(product, parsed.mode, parsed, profile),
    });
  }

  const total = pieces.reduce((t, piece) => {
    if (piece.fromCloset) return t;
    const p = CATALOG.find((c) => c.id === piece.productId);
    return t + (p?.price ?? 0);
  }, 0);

  // Palette from the chosen pieces.
  const palette: string[] = [];
  for (const piece of pieces) {
    const p = CATALOG.find((c) => c.id === piece.productId);
    if (p) for (const hex of [p.color.hex, ...p.palette]) {
      if (palette.length < 6 && !palette.includes(hex)) palette.push(hex);
    }
  }

  const title = buildTitle(parsed, prompt);
  const summary = buildSummary(parsed, pieces.length, total, overBudget, buildAround.length > 0);

  // Expert "why" notes — intent-driven, with sensible defaults.
  const styleNotes = parsed.intents.flatMap((i) => i.notes).slice(0, 3);
  if (styleNotes.length === 0) {
    if (parsed.colorHints.length) styleNotes.push(`Built around a ${parsed.colorHints[0]} palette you asked for.`);
    styleNotes.push(`Pieces are balanced for ${modeLabel(parsed.mode).toLowerCase()} and sized to your profile.`);
  }

  const outfit: Outfit = {
    id: uid("outfit"),
    title,
    mode: parsed.mode,
    prompt: prompt || undefined,
    pieces,
    total,
    summary,
    styleNotes,
    intents: parsed.intents.map((i) => i.label),
    palette,
    createdAt: Date.now(),
  };

  return { outfit, parsed, overBudget };
}

function buildTitle(parsed: ParsedRequest, prompt: string): string {
  if (parsed.intents[0]) return `${parsed.intents[0].label} · ${modeLabel(parsed.mode)}`;
  const adjectives = ["Clean", "Considered", "Easy", "Sharp", "Modern", "Quiet"];
  const seed = (prompt.length + parsed.mode.length) % adjectives.length;
  return `${adjectives[seed]} ${modeLabel(parsed.mode)}`;
}

function buildSummary(
  parsed: ParsedRequest,
  count: number,
  total: number,
  overBudget: boolean,
  fromCloset: boolean,
): string {
  const parts: string[] = [];
  parts.push(`A ${count}-piece ${modeLabel(parsed.mode).toLowerCase()} look`);
  if (fromCloset) parts.push("built around your closet");
  if (parsed.colorHints.length) parts.push(`leaning ${parsed.colorHints[0]}`);
  if (parsed.season) parts.push(`for ${parsed.season}`);
  let sentence = parts.join(", ") + ".";
  if (overBudget) sentence += " Note: this is the most budget-friendly combination available — it runs slightly over your target.";
  return sentence;
}

// ---------------------------------------------------------------------------
// Closet helpers
// ---------------------------------------------------------------------------

/**
 * Suggest catalog pieces that fill the gaps around a set of closet items for a
 * given mode. Used by the closet screen's "complete the look" feature.
 */
export function suggestMissingPieces(
  profile: StyleProfile,
  items: ClosetItem[],
  mode: OutfitMode = "everyday",
): GenerateResult {
  return generateOutfit(profile, { mode, buildAround: items });
}

// ---------------------------------------------------------------------------
// Per-piece alternatives (budget down / upgrade up)
// ---------------------------------------------------------------------------

export interface PieceAlternatives {
  cheaper?: Product;
  upgrade?: Product;
}

/**
 * Find a budget-friendly and a premium alternative for a piece, within the same
 * category and sharing the look's mode. Powers the "swap" affordances in results.
 */
export function pieceAlternatives(product: Product, mode: OutfitMode): PieceAlternatives {
  const peers = CATALOG.filter(
    (p) => p.category === product.category && p.id !== product.id && p.styleTags.includes(mode) && p.variants.some((v) => v.inventory > 0),
  );
  const cheaper = peers
    .filter((p) => p.price < product.price)
    .sort((a, b) => b.price - a.price)[0];
  const upgrade = peers
    .filter((p) => p.price > product.price)
    .sort((a, b) => a.price - b.price)[0];
  return { cheaper, upgrade };
}
