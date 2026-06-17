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
}

export function fitReport(profile: StyleProfile): FitReport {
  const signals = [
    profile.sizes.top,
    profile.sizes.bottomWaist,
    profile.sizes.shoe,
    profile.heightCm,
    profile.weightKg,
    profile.bodyType,
    profile.fitPreference,
  ];
  const filled = signals.filter(Boolean).length;
  const confidence = Math.min(0.58 + filled * 0.06, 0.98);
  const sizingAccuracy = Math.round(Math.min(62 + filled * 5.4, 99));
  const note = profile.bodyType
    ? `Calibrated to a ${profile.bodyType} build${profile.heightCm ? ` · ${profile.heightCm}cm` : ""}${profile.fitPreference ? ` · prefers ${profile.fitPreference} fit` : ""}.`
    : "Add height, weight & body type in your profile for sharper size calls.";
  return { confidence, sizingAccuracy, note };
}

/** Skin-tone presets for the body model. */
export const SKIN_TONES = ["#F2D2BD", "#E8B98F", "#C98B5E", "#9A6440", "#6B432A"];
export const HAIR_TONES = ["#221A14", "#3D2A1A", "#6B4A2A", "#A9854F", "#1C1C1E"];
