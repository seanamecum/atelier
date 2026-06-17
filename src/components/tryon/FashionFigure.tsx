import type { LookPaint, LookSlot } from "@/lib/ai/look";
import { cn } from "@/lib/utils/format";

/**
 * Renders a styled human figure wearing a resolved look. Garments are drawn as
 * shaded, seamed clothing over a skin-toned body model — a stand-in for a real
 * virtual-try-on render, but far closer to "clothes on a body" than flat blocks.
 *
 * `pose` rotates the view (front / side / back are approximated with transforms
 * and pose-specific hair, enough to feel like "rotate the model").
 */

export type Pose = "front" | "side" | "back";

function shade(hex: string, percent: number): string {
  const n = (hex || "#888888").replace("#", "");
  if (n.length !== 6) return hex;
  const num = parseInt(n, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function FashionFigure({
  look,
  pose = "front",
  skinTone = "#E8B98F",
  hairTone = "#221A14",
  showClothes = true,
  className,
}: {
  look: LookPaint;
  pose?: Pose;
  skinTone?: string;
  hairTone?: string;
  showClothes?: boolean;
  className?: string;
}) {
  const slots = Object.entries(look) as [LookSlot, NonNullable<LookPaint[LookSlot]>][];
  const hasDress = Boolean(look.dress);

  const skinDk = shade(skinTone, -16);
  const skinLt = shade(skinTone, 12);

  // pose transform on the figure group
  const groupTransform =
    pose === "side"
      ? "translate(20 0) scale(0.66 1)"
      : pose === "back"
        ? "translate(200 0) scale(-1 1)"
        : "";

  return (
    <svg viewBox="0 0 200 360" preserveAspectRatio="xMidYMid meet" className={cn("h-full w-full", className)}>
      <defs>
        <radialGradient id="ff-floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ff-skin" x1="0.2" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor={skinLt} />
          <stop offset="60%" stopColor={skinTone} />
          <stop offset="100%" stopColor={skinDk} />
        </linearGradient>
        {slots.map(([slot, paint]) => (
          <linearGradient key={slot} id={`ff-${slot}`} x1="0.15" y1="0" x2="0.85" y2="1">
            <stop offset="0%" stopColor={shade(paint.color, 18)} />
            <stop offset="50%" stopColor={paint.color} />
            <stop offset="100%" stopColor={shade(paint.color, -18)} />
          </linearGradient>
        ))}
        <linearGradient id="ff-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* floor shadow */}
      <ellipse cx="100" cy="346" rx="56" ry="12" fill="url(#ff-floor)" />

      <g transform={groupTransform}>
        {/* ---------- skin body ---------- */}
        {/* legs */}
        <path d="M84 196 L99 196 L98 252 L95 330 C94 337 86 337 85 330 L82 252 Z" fill="url(#ff-skin)" />
        <path d="M101 196 L116 196 L118 252 L115 330 C114 337 106 337 105 330 L102 252 Z" fill="url(#ff-skin)" />
        {/* feet */}
        <path d="M85 330 L95 330 L98 343 L82 344 Z" fill={skinDk} />
        <path d="M105 330 L115 330 L118 344 L102 343 Z" fill={skinDk} />
        {/* arms */}
        <path d="M71 96 C62 100 58 112 57 128 L52 196 C51 204 60 205 62 197 L71 132 C72 116 74 104 79 98 Z" fill="url(#ff-skin)" />
        <path d="M129 96 C138 100 142 112 143 128 L148 196 C149 204 140 205 138 197 L129 132 C128 116 126 104 121 98 Z" fill="url(#ff-skin)" />
        {/* hands */}
        <ellipse cx="56" cy="200" rx="6" ry="8" fill={skinTone} />
        <ellipse cx="144" cy="200" rx="6" ry="8" fill={skinTone} />
        {/* torso */}
        <path d="M72 92 C84 82 116 82 128 92 L124 150 C122 168 120 184 118 198 L82 198 C80 184 78 168 76 150 Z" fill="url(#ff-skin)" />
        {/* neck + head */}
        <path d="M92 74 L108 74 L108 88 L92 88 Z" fill={skinDk} />
        <ellipse cx="100" cy="52" rx="21" ry="25" fill="url(#ff-skin)" />

        {/* ---------- clothing ---------- */}
        {showClothes && (
          <>
            {hasDress ? (
              <Dress paint={look.dress!} />
            ) : (
              <>
                {look.bottom && <Bottom paint={look.bottom} />}
                {look.top && <Top paint={look.top} />}
              </>
            )}
            {look.outerwear && <Outerwear paint={look.outerwear} hasInner={Boolean(look.top || look.dress)} />}
            {look.shoes && <Shoes paint={look.shoes} />}
            {look.bag && <Bag paint={look.bag} />}
            {look.accessory && <Accessory paint={look.accessory} pose={pose} />}
          </>
        )}

        {/* ---------- hair (on top of head/neck) ---------- */}
        {pose === "back" ? (
          <path d="M78 44 C78 24 122 24 122 44 L124 84 C124 90 118 92 114 86 L110 60 L90 60 L86 86 C82 92 76 90 76 84 Z" fill={hairTone} />
        ) : (
          <path d="M79 50 C79 26 121 26 121 50 C124 48 124 40 121 36 C118 20 82 20 79 36 C76 40 76 48 79 50 Z" fill={hairTone} />
        )}
        {/* face hint (front/side only) */}
        {pose !== "back" && (
          <>
            <ellipse cx="92" cy="54" rx="1.6" ry="2" fill={shade(skinDk, -30)} opacity="0.6" />
            <ellipse cx="108" cy="54" rx="1.6" ry="2" fill={shade(skinDk, -30)} opacity="0.6" />
            <path d="M95 64 C98 67 102 67 105 64" stroke={shade(skinDk, -20)} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </>
        )}
      </g>
    </svg>
  );
}

const seam = (c: string) => ({ stroke: shade(c, -36), strokeWidth: 0.9, fill: "none" as const, strokeLinecap: "round" as const });

function Top({ paint }: { paint: NonNullable<LookPaint["top"]> }) {
  const c = paint.color;
  return (
    <g>
      {/* torso shirt */}
      <path d="M70 90 C84 80 116 80 130 90 L126 152 C124 168 123 180 122 192 L78 192 C77 180 76 168 74 152 Z" fill="url(#ff-top)" />
      {/* short sleeves */}
      <path d="M70 90 C62 94 58 106 57 122 L62 138 L74 134 L73 104 Z" fill="url(#ff-top)" />
      <path d="M130 90 C138 94 142 106 143 122 L138 138 L126 134 L127 104 Z" fill="url(#ff-top)" />
      <path d="M90 86 C95 92 105 92 110 86" {...seam(c)} strokeWidth={2} />
      <path d="M44 150 C46 168 46 182 44 192" transform="translate(56 0)" {...seam(c)} strokeOpacity={0.4} />
      <path d="M70 90 C84 80 116 80 130 90 L100 92 Z" fill="url(#ff-sheen)" opacity="0.6" />
    </g>
  );
}

function Bottom({ paint }: { paint: NonNullable<LookPaint["bottom"]> }) {
  const c = paint.color;
  return (
    <g>
      <path d="M78 186 L122 186 L124 252 L118 330 C117 336 110 336 109 330 L103 256 L100 252 L97 256 L91 330 C90 336 83 336 82 330 L76 252 Z" fill="url(#ff-bottom)" />
      <path d="M78 190 L122 190" {...seam(c)} strokeWidth={2} />
      <path d="M100 196 L100 250" {...seam(c)} strokeOpacity={0.5} />
      <path d="M88 196 L86 326" {...seam(c)} strokeOpacity={0.35} />
      <path d="M112 196 L114 326" {...seam(c)} strokeOpacity={0.35} />
    </g>
  );
}

function Dress({ paint }: { paint: NonNullable<LookPaint["dress"]> }) {
  const c = paint.color;
  return (
    <g>
      <path d="M70 90 C84 80 116 80 130 90 L126 150 C142 210 138 280 132 320 L68 320 C62 280 58 210 74 150 Z" fill="url(#ff-dress)" />
      <path d="M88 86 C95 93 105 93 112 86" {...seam(c)} strokeWidth={2} />
      <path d="M74 150 C90 156 110 156 126 150" {...seam(c)} strokeOpacity={0.5} />
      <path d="M88 156 L80 318" {...seam(c)} strokeOpacity={0.4} />
      <path d="M100 156 L100 320" {...seam(c)} strokeOpacity={0.35} />
      <path d="M112 156 L120 318" {...seam(c)} strokeOpacity={0.4} />
      <path d="M70 90 C84 80 116 80 130 90 L100 150 L86 150 Z" fill="url(#ff-sheen)" opacity="0.5" />
    </g>
  );
}

function Outerwear({ paint, hasInner }: { paint: NonNullable<LookPaint["outerwear"]>; hasInner: boolean }) {
  const c = paint.color;
  // Open jacket — two front panels leaving a center reveal of the inner layer.
  return (
    <g>
      {/* sleeves full length */}
      <path d="M70 88 C60 92 55 106 54 124 L49 196 C48 204 58 205 60 197 L70 130 C71 112 73 100 79 94 Z" fill="url(#ff-outerwear)" />
      <path d="M130 88 C140 92 145 106 146 124 L151 196 C152 204 142 205 140 197 L130 130 C129 112 127 100 121 94 Z" fill="url(#ff-outerwear)" />
      {/* left & right panels */}
      <path d="M70 88 C80 82 92 82 96 86 L94 196 L80 196 C76 170 72 128 70 88 Z" fill="url(#ff-outerwear)" />
      <path d="M130 88 C120 82 108 82 104 86 L106 196 L120 196 C124 170 128 128 130 88 Z" fill="url(#ff-outerwear)" />
      {/* lapels */}
      <path d="M96 86 L88 110 L94 150" {...seam(c)} strokeWidth={1.4} />
      <path d="M104 86 L112 110 L106 150" {...seam(c)} strokeWidth={1.4} />
      {!hasInner && <rect x="96" y="86" width="8" height="110" fill="url(#ff-outerwear)" />}
      <path d="M70 88 C80 82 92 82 96 86 L84 92 L78 150 Z" fill="url(#ff-sheen)" opacity="0.5" />
    </g>
  );
}

function Shoes({ paint }: { paint: NonNullable<LookPaint["shoes"]> }) {
  const c = paint.color;
  return (
    <g>
      <path d="M82 332 L96 331 L100 344 C100 347 97 348 94 348 L80 348 C78 348 77 345 79 342 Z" fill="url(#ff-shoes)" />
      <path d="M104 331 L118 332 L121 342 C123 345 122 348 120 348 L106 348 C103 348 100 347 100 344 Z" fill="url(#ff-shoes)" />
      <path d="M80 345 L99 345" {...seam(c)} stroke="#fff" strokeOpacity={0.4} />
      <path d="M101 345 L120 345" {...seam(c)} stroke="#fff" strokeOpacity={0.4} />
    </g>
  );
}

function Bag({ paint }: { paint: NonNullable<LookPaint["bag"]> }) {
  const c = paint.color;
  return (
    <g>
      <path d="M138 150 C150 150 150 196 144 200" stroke={shade(c, -30)} strokeWidth="2" fill="none" />
      <rect x="142" y="196" width="22" height="26" rx="3" fill="url(#ff-bag)" />
      <rect x="150" y="196" width="6" height="3" rx="1" fill={shade(c, 30)} />
    </g>
  );
}

function Accessory({ paint, pose }: { paint: NonNullable<LookPaint["accessory"]>; pose: Pose }) {
  const c = paint.color;
  if (pose === "back") return null;
  // sunglasses
  return (
    <g>
      <rect x="86" y="50" width="11" height="7" rx="2" fill={c} opacity="0.92" />
      <rect x="103" y="50" width="11" height="7" rx="2" fill={c} opacity="0.92" />
      <path d="M97 53 L103 53" stroke={c} strokeWidth="1.4" />
    </g>
  );
}
