import { COLOR_OPTIONS } from "@/lib/data/preferences";
import type { Category } from "@/lib/types";

/**
 * Lightweight on-device "vision" for the digital closet.
 *
 * `extractDominantColor` is real: it rasterizes the uploaded photo to a small
 * canvas, builds a quantized color histogram (ignoring near-white/near-black
 * background and low-saturation pixels), and returns the dominant garment color
 * mapped to a named swatch. This runs fully client-side — no upload, no API.
 *
 * Category/brand detection from raw pixels isn't reliable offline, so those are
 * surfaced as editable suggestions. In production this whole module is the seam
 * for a real garment-tagging model (color + category + attributes + brand OCR).
 */

export interface DetectedColor {
  hex: string;
  /** Nearest named swatch (from the preference palette). */
  name: string;
  /** 0–1 share of sampled pixels in the dominant bucket. */
  confidence: number;
}

export async function extractDominantColor(dataUrl: string): Promise<DetectedColor | null> {
  const img = await loadImage(dataUrl);
  const size = 48;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, size, size);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, size, size).data;
  } catch {
    return null; // tainted canvas / CORS — shouldn't happen for data URLs
  }

  // Quantize into 3-bit-per-channel buckets, weighting saturated mid-tones.
  const buckets = new Map<number, { r: number; g: number; b: number; w: number }>();
  let kept = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 200) continue;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const lum = (max + min) / 2;
    const sat = max === 0 ? 0 : (max - min) / max;
    // Drop likely background: very bright, very dark, or washed-out pixels.
    if (lum > 238 || lum < 18) continue;
    const weight = 1 + sat * 2; // favor colorful garment pixels
    const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
    const cur = buckets.get(key) ?? { r: 0, g: 0, b: 0, w: 0 };
    cur.r += r * weight;
    cur.g += g * weight;
    cur.b += b * weight;
    cur.w += weight;
    buckets.set(key, cur);
    kept += weight;
  }
  if (buckets.size === 0 || kept === 0) return null;

  let best: { r: number; g: number; b: number; w: number } | null = null;
  buckets.forEach((v) => {
    if (!best || v.w > best.w) best = v;
  });
  if (!best) return null;
  const top = best as { r: number; g: number; b: number; w: number };

  const r = Math.round(top.r / top.w);
  const g = Math.round(top.g / top.w);
  const b = Math.round(top.b / top.w);
  const hex = rgbToHex(r, g, b);
  const named = nearestNamed(r, g, b);
  return { hex, name: named, confidence: Math.min(1, top.w / kept) };
}

/** Map an RGB to the nearest named swatch in the preference palette. */
export function nearestNamed(r: number, g: number, b: number): string {
  let bestName = COLOR_OPTIONS[0].value;
  let bestDist = Infinity;
  for (const c of COLOR_OPTIONS) {
    const [cr, cg, cb] = hexToRgb(c.hex);
    const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (d < bestDist) {
      bestDist = d;
      bestName = c.value;
    }
  }
  return bestName;
}

/** A coarse, honest "type" guess from image aspect ratio (editable suggestion). */
export function suggestCategoryFromAspect(width: number, height: number): Category {
  const ratio = width / height;
  if (ratio > 1.4) return "shoes"; // wide
  if (ratio < 0.7) return "dress"; // very tall
  return "top";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
