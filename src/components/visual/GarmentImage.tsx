import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils/format";

/**
 * Realistic garment renderer.
 *
 * Produces a layered, shaded SVG "product render" per category — fabric gradient
 * (light from top-left), seams/folds, a sheen highlight, a woven-texture overlay
 * and a soft studio backdrop + floor shadow. This reads as real clothing rather
 * than a flat block, and works fully offline.
 *
 * Props are backward compatible with the previous flat version, so every screen
 * upgrades automatically. To use real product photography later, add `imageUrl`
 * and render <img> when present.
 */

export function GarmentImage({
  category,
  color,
  palette = [],
  className,
  rounded = "rounded-2xl",
  showLabel = false,
  backdrop = true,
}: {
  category: Category;
  color: string;
  palette?: string[];
  className?: string;
  rounded?: string;
  showLabel?: boolean;
  backdrop?: boolean;
}) {
  const accent = palette[0] ?? color;
  const bgA = palette[1] ?? "#F1ECE3";
  const bgB = palette[2] ?? "#E3DDD2";
  const uid = `${category}-${color.replace("#", "")}`;

  const light = shade(color, 16);
  const lighter = shade(color, 30);
  const dark = shade(color, -16);
  const darker = shade(color, -30);
  const seam = shade(color, -40);

  return (
    <div className={cn("relative overflow-hidden", rounded, className)}>
      <svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        <defs>
          {/* studio backdrop */}
          <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={bgA} />
            <stop offset="100%" stopColor={bgB} />
          </linearGradient>
          {/* fabric body — light top-left to dark bottom-right */}
          <linearGradient id={`fab-${uid}`} x1="0.15" y1="0" x2="0.85" y2="1">
            <stop offset="0%" stopColor={light} />
            <stop offset="45%" stopColor={color} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          {/* sheen */}
          <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.34" />
            <stop offset="35%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          {/* woven texture */}
          <pattern id={`weave-${uid}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="4" fill="transparent" />
            <line x1="0" y1="0" x2="0" y2="4" stroke="#000" strokeOpacity="0.05" strokeWidth="0.6" />
            <line x1="2" y1="0" x2="2" y2="4" stroke="#fff" strokeOpacity="0.05" strokeWidth="0.6" />
          </pattern>
          <radialGradient id={`vig-${uid}`} cx="0.5" cy="0.32" r="0.75">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.06" />
          </radialGradient>
        </defs>

        {backdrop && (
          <>
            <rect width="100" height="120" fill={`url(#bg-${uid})`} />
            <rect width="100" height="120" fill={`url(#vig-${uid})`} />
            <circle cx="74" cy="24" r="26" fill={accent} opacity="0.14" />
            {/* floor shadow */}
            <ellipse cx="50" cy="110" rx="30" ry="5" fill="#000" opacity="0.1" />
          </>
        )}

        <Garment category={category} uid={uid} colors={{ color, light, lighter, dark, darker, seam }} accent={accent} />
      </svg>

      {showLabel && (
        <span className="eyebrow absolute bottom-2 left-3 text-ink-400/80">{LABEL[category]}</span>
      )}
    </div>
  );
}

interface Shades {
  color: string;
  light: string;
  lighter: string;
  dark: string;
  darker: string;
  seam: string;
}

function Garment({
  category,
  uid,
  colors,
  accent,
}: {
  category: Category;
  uid: string;
  colors: Shades;
  accent: string;
}) {
  const fab = `url(#fab-${uid})`;
  const weave = `url(#weave-${uid})`;
  const sheen = `url(#sheen-${uid})`;
  const seamStroke = { stroke: colors.seam, strokeWidth: 0.7, fill: "none", strokeLinecap: "round" as const };

  switch (category) {
    case "top":
      return (
        <g>
          <Body d="M50 21 C45 17 40 16 34 17 L18 27 C16 29 16 31 18 33 L25 43 C27 45 30 44 31 41 L33 37 L33 95 C33 98 35 99 38 99 L62 99 C65 99 67 98 67 95 L67 37 L69 41 C70 44 73 45 75 43 L82 33 C84 31 84 29 82 27 L66 17 C60 16 55 17 50 21 Z" fab={fab} weave={weave} />
          {/* collar */}
          <path d="M41 19 C45 25 55 25 59 19" {...seamStroke} strokeWidth={2.6} stroke={colors.darker} />
          <path d="M42 20 C46 24 54 24 58 20" {...seamStroke} stroke={colors.light} strokeWidth={1} />
          {/* sleeve seams */}
          <path d="M33 24 C30 30 28 36 31 41" {...seamStroke} />
          <path d="M67 24 C70 30 72 36 69 41" {...seamStroke} />
          {/* fold shadows */}
          <path d="M44 60 C46 74 46 86 44 96" {...seamStroke} strokeOpacity={0.5} />
          <path d="M58 58 C57 72 57 86 59 96" {...seamStroke} strokeOpacity={0.45} />
          <Sheen d="M50 21 C45 17 40 16 34 17 L18 27 L33 37 L33 95 L46 95 L46 24 Z" sheen={sheen} />
        </g>
      );

    case "outerwear":
      return (
        <g>
          <Body d="M50 20 C45 16 39 16 33 18 L17 28 C15 30 15 32 17 34 L24 45 C26 47 29 46 30 43 L32 39 L32 98 C32 100 33 101 35 101 L65 101 C67 101 68 100 68 98 L68 39 L70 43 C71 46 74 47 76 45 L83 34 C85 32 85 30 83 28 L67 18 C61 16 55 16 50 20 Z" fab={fab} weave={weave} />
          {/* lapels */}
          <path d="M50 20 L42 30 L48 58" {...seamStroke} strokeWidth={1.4} stroke={colors.darker} />
          <path d="M50 20 L58 30 L52 58" {...seamStroke} strokeWidth={1.4} stroke={colors.darker} />
          {/* center placket + buttons */}
          <path d="M50 30 L50 98" {...seamStroke} strokeOpacity={0.6} />
          {[44, 56, 68, 80].map((y) => (
            <circle key={y} cx="50" cy={y} r="1.2" fill={accent} opacity="0.9" />
          ))}
          {/* pockets */}
          <path d="M37 74 L46 74" {...seamStroke} />
          <path d="M54 74 L63 74" {...seamStroke} />
          <path d="M32 24 C29 31 28 37 30 43" {...seamStroke} />
          <path d="M68 24 C71 31 72 37 70 43" {...seamStroke} />
          <Sheen d="M50 20 C45 16 39 16 33 18 L17 28 L32 39 L32 98 L46 98 L48 28 Z" sheen={sheen} />
        </g>
      );

    case "dress":
      return (
        <g>
          <Body d="M50 20 C46 17 41 16 37 18 L40 27 C36 33 33 40 30 52 L24 92 C22 98 26 101 32 101 L68 101 C74 101 78 98 76 92 L70 52 C67 40 64 33 60 27 L63 18 C59 16 54 17 50 20 Z" fab={fab} weave={weave} />
          {/* neckline */}
          <path d="M40 19 C45 26 55 26 60 19" {...seamStroke} strokeWidth={2.2} stroke={colors.darker} />
          {/* waist seam */}
          <path d="M34 48 C42 52 58 52 66 48" {...seamStroke} strokeOpacity={0.6} />
          {/* skirt folds */}
          <path d="M40 54 L33 98" {...seamStroke} strokeOpacity={0.5} />
          <path d="M50 54 L50 99" {...seamStroke} strokeOpacity={0.45} />
          <path d="M60 54 L67 98" {...seamStroke} strokeOpacity={0.5} />
          <Sheen d="M50 20 C46 17 41 16 37 18 L40 27 C36 33 33 40 30 52 L24 92 L46 92 L46 24 Z" sheen={sheen} />
        </g>
      );

    case "bottom":
      return (
        <g>
          <Body d="M34 18 L66 18 C67 18 68 19 68 20 L66 44 L62 100 C62 101 61 102 60 102 L52 102 C51 102 50 101 50 100 L49 60 L48 60 L47 100 C47 101 46 102 45 102 L37 102 C36 102 35 101 35 100 L31 44 L32 20 C32 19 33 18 34 18 Z" fab={fab} weave={weave} />
          {/* waistband */}
          <path d="M33 22 L67 22" {...seamStroke} strokeWidth={2.2} stroke={colors.darker} />
          <rect x="48.4" y="22" width="3" height="3" rx="0.5" fill={accent} opacity="0.8" />
          {/* fly + center crease */}
          <path d="M50 25 L49 58" {...seamStroke} strokeOpacity={0.6} />
          <path d="M41 30 L40 98" {...seamStroke} strokeOpacity={0.45} />
          <path d="M59 30 L60 98" {...seamStroke} strokeOpacity={0.45} />
          {/* pockets */}
          <path d="M34 28 C38 31 40 33 41 37" {...seamStroke} />
          <path d="M66 28 C62 31 60 33 59 37" {...seamStroke} />
          <Sheen d="M34 18 L50 18 L49 60 L47 100 L37 100 L31 44 Z" sheen={sheen} />
        </g>
      );

    case "shoes":
      return (
        <g>
          {/* sole */}
          <path d="M15 86 L80 84 C86 84 88 90 84 93 L20 95 C14 95 12 88 15 86 Z" fill={colors.darker} />
          <path d="M15 88 L84 86" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.8" fill="none" />
          {/* upper */}
          <path d="M20 86 C20 74 26 64 40 62 L58 64 C70 66 76 74 80 84 L20 86 Z" fill={fab} />
          <path d="M20 86 C20 74 26 64 40 62 L58 64 C70 66 76 74 80 84 L20 86 Z" fill={weave} />
          {/* toe cap + heel seams */}
          <path d="M66 70 C72 73 76 78 79 83" {...seamStroke} />
          <path d="M40 62 C38 70 38 78 40 85" {...seamStroke} strokeOpacity={0.6} />
          {/* laces */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${44 + i * 7} 66 L${50 + i * 7} 70`} stroke={shade(accent, 30)} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          ))}
          <Sheen d="M20 86 C20 74 26 64 40 62 L48 63 L42 85 L20 86 Z" sheen={sheen} />
        </g>
      );

    case "bag":
      return (
        <g>
          {/* handle */}
          <path d="M38 46 C38 33 62 33 62 46" stroke={colors.darker} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <Body d="M30 46 L70 46 C72 46 73 47 73 49 L77 96 C77 99 75 100 72 100 L28 100 C25 100 23 99 23 96 L27 49 C27 47 28 46 30 46 Z" fab={fab} weave={weave} />
          {/* clasp + seam */}
          <rect x="46" y="46" width="8" height="5" rx="1" fill={accent} opacity="0.9" />
          <path d="M50 51 L50 99" {...seamStroke} strokeOpacity={0.4} />
          <path d="M27 56 L73 56" {...seamStroke} strokeOpacity={0.4} />
          <Sheen d="M30 46 L50 46 L50 100 L28 100 L25 60 Z" sheen={sheen} />
        </g>
      );

    case "accessory":
    default:
      return (
        <g>
          {/* generic folded accessory / scarf knot */}
          <path d="M30 50 C40 40 60 40 70 50 C74 54 74 62 70 66 C60 76 40 76 30 66 C26 62 26 54 30 50 Z" fill={fab} />
          <path d="M30 50 C40 40 60 40 70 50 C74 54 74 62 70 66 C60 76 40 76 30 66 C26 62 26 54 30 50 Z" fill={weave} />
          <path d="M40 48 C46 60 54 60 60 48" {...seamStroke} strokeOpacity={0.6} />
          <path d="M38 58 C46 64 54 64 62 58" {...seamStroke} strokeOpacity={0.45} />
          <circle cx="50" cy="58" r="4" fill={accent} opacity="0.85" />
          <Sheen d="M30 50 C40 40 60 40 70 50 L50 50 L40 66 C34 62 28 56 30 50 Z" sheen={sheen} />
        </g>
      );
  }
}

function Body({ d, fab, weave }: { d: string; fab: string; weave: string }) {
  return (
    <>
      <path d={d} fill={fab} stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" strokeLinejoin="round" />
      <path d={d} fill={weave} />
    </>
  );
}

function Sheen({ d, sheen }: { d: string; sheen: string }) {
  return <path d={d} fill={sheen} opacity="0.7" />;
}

const LABEL: Record<Category, string> = {
  top: "Top",
  outerwear: "Outerwear",
  bottom: "Bottom",
  dress: "Dress",
  shoes: "Footwear",
  accessory: "Accessory",
  bag: "Bag",
};

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
