import type { Outfit, StyleProfile } from "@/lib/types";
import { getProduct } from "@/lib/data/catalog";

/**
 * Resolves an outfit into the garment "slots" the Try-On figure renders, plus
 * sizing/fit signals. This is the bridge between the catalog outfit and the
 * rendered look. A real virtual-try-on model would consume the same slot map.
 */

export type LookSlot = "dress" | "top" | "outerwear" | "bottom" | "shoes" | "bag" | "accessory";

export interface SlotPaint {
  color: string;
  palette: string[];
  productId: string;
  name: string;
  size: string;
}

export type LookPaint = Partial<Record<LookSlot, SlotPaint>>;

export function buildLook(outfit: Outfit): LookPaint {
  const look: LookPaint = {};
  for (const piece of outfit.pieces) {
    const p = getProduct(piece.productId);
    if (!p) continue;
    const slot = p.category as LookSlot;
    if (look[slot]) continue;
    look[slot] = {
      color: p.color.hex,
      palette: p.palette,
      productId: p.id,
      name: p.name,
      size: piece.recommendedSize,
    };
  }
  return look;
}

export interface FitReport {
  /** 0–1 confidence the look fits well. */
  confidence: number;
  /** 0–100 estimated sizing accuracy. */
  sizingAccuracy: number;
  note: string;
  /** Concrete, actionable fit guidance. */
  adjustments: string[];
}

export function fitReport(profile: StyleProfile): FitReport {
  const m = profile.measurements ?? {};
  const signals = [
    profile.sizes.top,
    profile.sizes.bottomWaist,
    profile.sizes.shoe,
    profile.heightCm,
    profile.weightKg,
    profile.bodyType,
    profile.fitPreference,
  ];
  // Tape measurements are the strongest signal — each adds real confidence.
  const measureCount = [m.chest, m.waist, m.hips, m.inseam, m.shoulder].filter(Boolean).length;
  const filled = signals.filter(Boolean).length;
  const confidence = Math.min(0.52 + filled * 0.05 + measureCount * 0.045, 0.99);
  const sizingAccuracy = Math.round(Math.min(58 + filled * 4.4 + measureCount * 4, 99));
  const note = profile.bodyType
    ? `Calibrated to a ${profile.bodyType} build${profile.heightCm ? ` · ${profile.heightCm}cm` : ""}${profile.fitPreference ? ` · prefers ${profile.fitPreference} fit` : ""}.`
    : "Add height, weight & body type in your profile for sharper size calls.";

  // Concrete adjustments based on profile signals.
  const adjustments: string[] = [];
  if (measureCount === 0) adjustments.push("Add chest, waist & inseam measurements for the most accurate sizing.");
  if (!profile.sizes.top) adjustments.push("Add your top size for a confident shirt/jacket call.");
  if (!profile.sizes.bottomWaist) adjustments.push("Add your waist size to dial in trousers and jeans.");
  if (profile.fitPreference === "relaxed" || profile.fitPreference === "oversized")
    adjustments.push("You prefer a roomier fit — consider sizing up one in tailored pieces.");
  if (profile.fitPreference === "slim")
    adjustments.push("For a slim fit, take your true size; size down only if between sizes.");
  if (profile.bodyType === "tall" || profile.bodyType === "athletic")
    adjustments.push("Look for 'tall' or 'athletic' cuts where offered for sleeve & inseam length.");
  if (profile.bodyType === "petite")
    adjustments.push("Petite cuts will keep proportions clean — check for petite sizing.");
  if (adjustments.length === 0) adjustments.push("Your measurements look complete — recommended sizes should fit true.");

  return { confidence, sizingAccuracy, note, adjustments };
}

/** Skin-tone presets for the body model. */
export const SKIN_TONES = ["#F2D2BD", "#E8B98F", "#C98B5E", "#9A6440", "#6B432A"];
export const HAIR_TONES = ["#221A14", "#3D2A1A", "#6B4A2A", "#A9854F", "#1C1C1E"];
