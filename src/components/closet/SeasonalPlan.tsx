"use client";

import { useMemo, useState } from "react";
import type { Season } from "@/lib/types";
import { useAtelier } from "@/lib/store/AtelierStore";
import { seasonalWardrobe } from "@/lib/closet/plans";
import { ProductRail } from "@/components/feed/ProductRail";
import { cn } from "@/lib/utils/format";

const SEASONS: Season[] = ["spring", "summer", "fall", "winter"];

export function SeasonalPlan() {
  const { profile, closet } = useAtelier();
  const [season, setSeason] = useState<Season>(currentSeason());
  const plan = useMemo(() => seasonalWardrobe(profile, closet, season), [profile, closet, season]);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-paper-200 text-base">🗓️</span>
        <h3 className="font-display text-xl text-ink-900">Seasonal wardrobe</h3>
      </div>
      <p className="mb-4 mt-1 text-sm text-ink-400">A capsule that covers a full week of {season} looks — see what you have and what to add.</p>

      <div className="mb-4 flex gap-1.5">
        {SEASONS.map((s) => (
          <button key={s} onClick={() => setSeason(s)} className={cn("chip !px-3 !py-1 text-xs capitalize", season === s && "chip-active")}>{s}</button>
        ))}
      </div>

      {/* completeness */}
      <div className="mb-4 flex items-center gap-4 rounded-2xl bg-studio-900 bg-studio-spot p-4 text-paper-50">
        <Ring value={plan.completeness} />
        <div>
          <p className="eyebrow !text-champagne-200">Capsule completeness</p>
          <p className="mt-0.5 text-sm text-paper-200">{plan.note}</p>
        </div>
      </div>

      <div className="space-y-4">
        {plan.slots.map((slot) => (
          <div key={slot.category}>
            <div className="mb-1.5 flex items-center justify-between">
              <h4 className="font-medium text-ink-900">{slot.label}</h4>
              <span className={cn("text-xs", slot.have >= slot.target ? "text-sage-700" : "text-clay-500")}>
                {slot.have}/{slot.target} {slot.have >= slot.target ? "· complete ✓" : "· add " + (slot.target - slot.have)}
              </span>
            </div>
            {slot.suggestions.length > 0 ? (
              <ProductRail products={slot.suggestions} />
            ) : (
              <p className="rounded-lg bg-sage-100/60 px-3 py-2 text-xs text-sage-700">You're covered here for {season}.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Ring({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0 -rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
      <circle cx="32" cy="32" r={r} fill="none" stroke="#DCBA78" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (value / 100) * c} />
      <text x="32" y="32" transform="rotate(90 32 32)" textAnchor="middle" dominantBaseline="central" className="fill-paper-50 font-display" fontSize="16">{value}</text>
    </svg>
  );
}

function currentSeason(): Season {
  const m = new Date().getMonth();
  if (m <= 1 || m === 11) return "winter";
  if (m <= 4) return "spring";
  if (m <= 7) return "summer";
  return "fall";
}
