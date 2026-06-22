/**
 * Mira domain model.
 *
 * These types are the contract between the UI, the (currently mocked) AI stylist
 * engine, and the retailer/commerce layer. When real APIs are introduced, the
 * adapters in `lib/ai/*` and `lib/retail/*` should keep returning these shapes so
 * the UI never has to change.
 */

// ---------------------------------------------------------------------------
// Catalog primitives
// ---------------------------------------------------------------------------

export type Category =
  | "top"
  | "bottom"
  | "dress"
  | "outerwear"
  | "shoes"
  | "accessory"
  | "bag";

export type StyleTag =
  | "streetwear"
  | "college"
  | "date-night"
  | "gym"
  | "vacation"
  | "business-casual"
  | "formal"
  | "wedding"
  | "interview"
  | "everyday";

/** The outfit "modes" surfaced in the generator. Mirrors StyleTag for clarity. */
export type OutfitMode = StyleTag;

export type Season = "spring" | "summer" | "fall" | "winter" | "all";

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface Retailer {
  id: string;
  name: string;
  /** Base affiliate program tag appended to outbound links. */
  affiliateTag: string;
  /** Whether this retailer supports programmatic cart handoff. */
  supportsCartHandoff: boolean;
  baseUrl: string;
}

export interface Brand {
  id: string;
  name: string;
  /** Rough price tier, used for budget-aware matching. */
  tier: "value" | "mid" | "premium" | "luxury";
}

export interface ProductVariant {
  size: string;
  /** Live inventory count (mocked). 0 == out of stock. */
  inventory: number;
}

export interface Product {
  id: string;
  name: string;
  brandId: string;
  retailerId: string;
  category: Category;
  /** Tags describing which occasions/looks this piece works for. */
  styleTags: StyleTag[];
  seasons: Season[];
  color: ColorSwatch;
  /** Secondary palette used to render the visual placeholder + match colors. */
  palette: string[];
  price: number;
  /** Optional pre-sale price for showing markdowns. */
  msrp?: number;
  /** Available sizes with mocked inventory. */
  variants: ProductVariant[];
  /** Path on the retailer for the product (joined with retailer.baseUrl). */
  productPath: string;
  rating: number;
  reviewCount: number;
  description: string;
}

// ---------------------------------------------------------------------------
// User & style profile
// ---------------------------------------------------------------------------

export type BodyType =
  | "athletic"
  | "slim"
  | "average"
  | "curvy"
  | "plus"
  | "tall"
  | "petite";

export type FitPreference = "slim" | "tailored" | "regular" | "relaxed" | "oversized";

export interface SizeProfile {
  top?: string; // e.g. "M"
  bottomWaist?: string; // e.g. "32"
  dress?: string;
  shoe?: string; // e.g. "10"
  outerwear?: string;
}

/** Optional tape-measure values (cm) that sharpen size recommendations. */
export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  inseam?: number;
  shoulder?: number;
}

export interface StyleProfile {
  name: string;
  heightCm?: number;
  weightKg?: number;
  bodyType?: BodyType;
  measurements?: BodyMeasurements;
  sizes: SizeProfile;
  /** Per-outfit budget ceiling in USD. */
  budget: number;
  favoriteBrandIds: string[];
  /** Color names the user gravitates toward. */
  colorPreferences: string[];
  /** Color names the user wants to avoid. */
  colorAvoids: string[];
  fitPreference: FitPreference;
  /** Free-form style taste keywords ("minimal", "vintage", "bold"...). */
  styleKeywords: string[];
  /** Optional uploaded full-body photo (data URL) for try-on. */
  bodyPhoto?: string;
  onboarded: boolean;
}

// ---------------------------------------------------------------------------
// Account / identity
// ---------------------------------------------------------------------------

export interface Account {
  id: string;
  name: string;
  email: string;
  createdAt: number;
  /** True for "continue without an account" sessions. */
  guest: boolean;
}

// ---------------------------------------------------------------------------
// Closet (user-owned items)
// ---------------------------------------------------------------------------

export interface ClosetItem {
  id: string;
  label: string;
  category: Category;
  color: ColorSwatch;
  /** Optional uploaded photo (data URL). */
  photo?: string;
  /** If matched to a catalog product, the id (enables smart pairing). */
  matchedProductId?: string;
}

// ---------------------------------------------------------------------------
// Outfits
// ---------------------------------------------------------------------------

export interface OutfitPiece {
  productId: string;
  /** Stylist-recommended size, derived from the size profile. */
  recommendedSize: string;
  /** Why the stylist picked this piece. */
  rationale: string;
  /** True when the piece comes from the user's own closet, not the catalog. */
  fromCloset?: boolean;
  closetItemId?: string;
}

export interface Outfit {
  id: string;
  title: string;
  mode: OutfitMode;
  /** The original natural-language request, if generated from a prompt. */
  prompt?: string;
  pieces: OutfitPiece[];
  /** Total cost of catalog pieces only (closet items are free). */
  total: number;
  /** Stylist's one-line summary of the look. */
  summary: string;
  /** Expert styling notes — the "why" behind the look as a whole. */
  styleNotes?: string[];
  /** Named style intents detected in the request (e.g. "old-money"). */
  intents?: string[];
  /** Palette used for the visual lookboard. */
  palette: string[];
  createdAt: number;
  saved?: boolean;
}

// ---------------------------------------------------------------------------
// Commerce
// ---------------------------------------------------------------------------

export interface Collection {
  id: string;
  name: string;
  outfitIds: string[];
  createdAt: number;
}

export interface CartLine {
  productId: string;
  size: string;
  qty: number;
  /** Optional originating outfit, for "buy the whole look". */
  outfitId?: string;
}

export interface Cart {
  lines: CartLine[];
}

export type OrderStatus = "pending-confirmation" | "confirmed" | "handed-off";

export interface Order {
  id: string;
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: number;
}
