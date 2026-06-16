import type { BodyRegion, TryOnPlan } from "@/lib/ai/tryon";
import { cn } from "@/lib/utils/format";

/** Pixel-free region boxes (percent of frame) the mock maps garments onto. */
const REGION_BOX: Record<BodyRegion, { top: number; left: number; width: number; height: number }> = {
  head: { top: 5, left: 38, width: 24, height: 13 },
  torso: { top: 20, left: 27, width: 46, height: 27 },
  midsection: { top: 44, left: 32, width: 36, height: 8 },
  legs: { top: 49, left: 31, width: 38, height: 34 },
  feet: { top: 84, left: 30, width: 40, height: 11 },
  hand: { top: 52, left: 6, width: 16, height: 16 },
};

export function TryOnCanvas({
  plan,
  photo,
  className,
}: {
  plan: TryOnPlan;
  photo?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-line bg-paper-200",
        className,
      )}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="you" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <Silhouette />
      )}

      {/* garment layers */}
      {plan.layers.map((layer, i) => {
        const box = REGION_BOX[layer.region];
        return (
          <div
            key={layer.productId + i}
            className="absolute rounded-xl border border-white/40 backdrop-blur-[1px] transition"
            style={{
              top: `${box.top}%`,
              left: `${box.left}%`,
              width: `${box.width}%`,
              height: `${box.height}%`,
              backgroundColor: layer.color,
              opacity: photo ? 0.78 : 0.92,
              zIndex: layer.z,
              boxShadow: "0 6px 18px rgba(26,23,20,0.18)",
            }}
            title={`${layer.productName} · ${layer.recommendedSize}`}
          />
        );
      })}

      {/* size pins */}
      {plan.layers.map((layer, i) => {
        const box = REGION_BOX[layer.region];
        return (
          <span
            key={"pin" + i}
            className="absolute z-50 -translate-y-1/2 rounded-full bg-ink-900/90 px-2 py-0.5 text-[10px] font-medium text-paper-50 shadow"
            style={{ top: `${box.top + box.height / 2}%`, left: `${box.left + box.width + 1}%` }}
          >
            {layer.recommendedSize}
          </span>
        );
      })}

      {/* try-on badge */}
      <div className="absolute left-3 top-3 z-50 flex items-center gap-1.5 rounded-full bg-paper-50/90 px-2.5 py-1 text-[11px] font-medium text-ink-700 shadow-card backdrop-blur">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clay-400" />
        Virtual try-on
      </div>
    </div>
  );
}

function Silhouette() {
  return (
    <svg viewBox="0 0 100 133" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
      <rect width="100" height="133" className="fill-paper-200" />
      <g className="fill-paper-400">
        <circle cx="50" cy="16" r="9" />
        <path d="M37 28 q13 -6 26 0 l5 36 -9 3 -2 28 -14 0 -2 -28 -9 -3 Z" />
        <rect x="40" y="92" width="8" height="34" rx="3" />
        <rect x="52" y="92" width="8" height="34" rx="3" />
      </g>
    </svg>
  );
}
