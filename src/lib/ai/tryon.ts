import type { Category, Outfit, StyleProfile } from "@/lib/types";
import { getProduct } from "@/lib/data/catalog";

/**
 * Mock virtual try-on engine.
 *
 * A real implementation would call an image-generation / virtual-garment model
 * (pose estimation + cloth warping) with the user's photo and the product images.
 * Here we produce a deterministic "try-on plan": which garment maps to which body
 * region, with its color, so the <TryOnCanvas> can render a layered preview over
 * the user's uploaded photo (or a generated silhouette when no photo exists).
 */

export type BodyRegion = "head" | "torso" | "midsection" | "legs" | "feet" | "hand";

export interface TryOnLayer {
  productId: string;
  productName: string;
  region: BodyRegion;
  color: string;
  /** z-order — higher renders on top. */
  z: number;
  recommendedSize: string;
}

export interface TryOnPlan {
  layers: TryOnLayer[];
  /** 0–1 confidence the recommended sizes will fit, given profile completeness. */
  fitConfidence: number;
  fitNote: string;
  /** Whether the user supplied a real body photo. */
  hasPhoto: boolean;
}

const REGION_FOR: Record<Category, BodyRegion> = {
  outerwear: "torso",
  top: "torso",
  dress: "torso",
  bottom: "legs",
  shoes: "feet",
  accessory: "head",
  bag: "hand",
};

const Z_FOR: Record<Category, number> = {
  bottom: 1,
  dress: 1,
  top: 2,
  outerwear: 3,
  shoes: 2,
  accessory: 4,
  bag: 4,
};

export function buildTryOnPlan(outfit: Outfit, profile: StyleProfile): TryOnPlan {
  const layers: TryOnLayer[] = [];
  for (const piece of outfit.pieces) {
    const product = getProduct(piece.productId);
    if (!product) continue;
    layers.push({
      productId: product.id,
      productName: product.name,
      region: REGION_FOR[product.category] ?? "torso",
      color: product.color.hex,
      z: Z_FOR[product.category] ?? 2,
      recommendedSize: piece.recommendedSize,
    });
  }
  layers.sort((a, b) => a.z - b.z);

  // Fit confidence grows with how much of the size/body profile is filled in.
  const sizeFields = [
    profile.sizes.top,
    profile.sizes.bottomWaist,
    profile.sizes.shoe,
    profile.heightCm,
    profile.weightKg,
    profile.bodyType,
  ];
  const filled = sizeFields.filter(Boolean).length;
  const fitConfidence = Math.min(0.6 + filled * 0.07, 0.98);

  const fitNote = profile.bodyType
    ? `Sizing tuned to a ${profile.bodyType} build${profile.heightCm ? ` at ${profile.heightCm}cm` : ""}.`
    : "Add your height, weight and body type for sharper size calls.";

  return {
    layers,
    fitConfidence,
    fitNote,
    hasPhoto: Boolean(profile.bodyPhoto),
  };
}
