import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils/format";

/**
 * Deterministic, dependency-free garment illustration.
 *
 * Renders a stylized SVG silhouette per category, filled with the product's
 * real color + palette. This stands in for retailer product photography so the
 * app has rich visuals while fully offline. Swap for <img src={imageUrl}/> when
 * real catalog imagery is wired up.
 */

const SILHOUETTES: Record<Category, string> = {
  // viewBox 0 0 100 120
  top: "M50 14 L38 10 28 18 18 30 26 40 36 34 36 104 64 104 64 34 74 40 82 30 72 18 62 10 Z",
  outerwear:
    "M50 14 L40 10 27 18 16 32 25 44 35 38 35 106 49 106 49 40 51 40 51 106 65 106 65 38 75 44 84 32 73 18 60 10 Z",
  bottom:
    "M34 12 L66 12 66 30 60 108 48 108 50 52 42 108 30 108 34 30 Z",
  dress:
    "M50 12 L40 10 32 18 38 30 30 104 70 104 62 30 68 18 60 10 Z",
  shoes:
    "M16 70 L40 66 52 70 78 78 86 88 84 96 18 96 14 84 Z",
  accessory:
    "M22 54 a28 14 0 1 0 56 0 a28 14 0 1 0 -56 0 M40 54 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0",
  bag: "M30 44 L70 44 78 102 22 102 Z M40 44 a10 10 0 0 1 20 0",
};

const GLYPH: Record<Category, string> = {
  top: "Top",
  outerwear: "Outerwear",
  bottom: "Bottom",
  dress: "Dress",
  shoes: "Footwear",
  accessory: "Accessory",
  bag: "Bag",
};

export function GarmentImage({
  category,
  color,
  palette = [],
  className,
  rounded = "rounded-2xl",
  showLabel = false,
}: {
  category: Category;
  color: string;
  palette?: string[];
  className?: string;
  rounded?: string;
  showLabel?: boolean;
}) {
  const bgA = palette[1] ?? "#EFEAE1";
  const bgB = palette[2] ?? "#E3DDD2";
  const accent = palette[0] ?? color;
  const path = SILHOUETTES[category];
  const gid = `g-${category}-${color.replace("#", "")}`;

  return (
    <div className={cn("relative overflow-hidden bg-paper-200", rounded, className)}>
      <svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={bgA} />
            <stop offset="100%" stopColor={bgB} />
          </linearGradient>
          <linearGradient id={`${gid}-f`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={shade(color, -18)} />
          </linearGradient>
        </defs>
        <rect width="100" height="120" fill={`url(#${gid})`} />
        {/* soft accent orb */}
        <circle cx="78" cy="22" r="26" fill={accent} opacity="0.16" />
        <path
          d={path}
          fill={`url(#${gid}-f)`}
          stroke={shade(color, -28)}
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      </svg>
      {showLabel && (
        <span className="eyebrow absolute bottom-2 left-3 text-ink-400/80">{GLYPH[category]}</span>
      )}
    </div>
  );
}

/** Lighten/darken a hex color by percent (-100..100). */
function shade(hex: string, percent: number): string {
  const n = hex.replace("#", "");
  if (n.length !== 6) return hex;
  const num = parseInt(n, 16);
  const amt = Math.round(2.55 * percent);
  const r = clamp((num >> 16) + amt);
  const g = clamp(((num >> 8) & 0x00ff) + amt);
  const b = clamp((num & 0x0000ff) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
function clamp(v: number): number {
  return Math.max(0, Math.min(255, v));
}
