"use client";

import { useState } from "react";
import type { OutfitMode, Season } from "@/lib/types";
import { useAtelier } from "@/lib/store/AtelierStore";
import { buildPackingList, type PackingPlan } from "@/lib/closet/plans";
import { ProductRail, SectionHeader } from "@/components/feed/ProductRail";
import { OutfitLookboard } from "@/components/outfit/OutfitLookboard";
import { GarmentImage } from "@/components/visual/GarmentImage";
import { cn } from "@/lib/utils/format";

const SEASONS: Season[] = ["spring", "summer", "fall", "winter"];
const MODES: OutfitMode[] = ["vacation", "everyday", "business-casual", "date-night"];

export function PackingAssistant() {
  const { profile, closet, storeOutfit } = useAtelier();
  const [label, setLabel] = useState("");
  const [days, setDays] = useState(5);
  const [season, setSeason] = useState<Season>("summer");
  const [mode, setMode] = useState<OutfitMode>("vacation");
  const [plan, setPlan] = useState<PackingPlan | null>(null);

  const generate = () => {
    const p = buildPackingList(profile, closet, { label: label || "Your trip", days, season, mode });
    p.outfits.forEach(storeOutfit);
    setPlan(p);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-paper-200 text-base">🧳</span>
        <h3 className="font-display text-xl text-ink-900">Packing assistant</h3>
      </div>
      <p className="mb-4 mt-1 text-sm text-ink-400">A mix-and-match capsule for your trip, from what you own plus the pieces you're missing.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow mb-1 block">Destination</span>
          <input className="field" placeholder="Lisbon, beach week…" value={label} onChange={(e) => setLabel(e.target.value)} />
        </label>
        <label className="block">
          <span className="eyebrow mb-1 block">Days: {days}</span>
          <input type="range" min={2} max={14} value={days} onChange={(e) => setDays(+e.target.value)} className="mt-3 w-full" />
        </label>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <span className="eyebrow mb-1.5 block">Season</span>
          <div className="flex gap-1.5">
            {SEASONS.map((s) => (
              <button key={s} onClick={() => setSeason(s)} className={cn("chip !px-3 !py-1 text-xs capitalize", season === s && "chip-active")}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <span className="eyebrow mb-1.5 block">Vibe</span>
          <div className="flex flex-wrap gap-1.5">
            {MODES.map((m) => (
              <button key={m} onClick={() => setMode(m)} className={cn("chip !px-3 !py-1 text-xs capitalize", mode === m && "chip-active")}>{m.replace("-", " ")}</button>
            ))}
          </div>
        </div>
      </div>

      <button className="btn-accent mt-4" onClick={generate}>✦ Build my packing list</button>

      {plan && (
        <div className="mt-5 animate-rise space-y-5 border-t border-line pt-5">
          <ul className="grid gap-1.5 rounded-xl bg-paper-200/50 p-3 text-sm text-ink-600">
            {plan.tips.map((t, i) => (
              <li key={i} className="flex gap-2"><span className="text-clay-400">—</span>{t}</li>
            ))}
          </ul>

          {plan.essentials.filter((e) => e.needed > 0).map((e) => (
            <div key={e.category}>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-medium text-ink-900">{e.label} · {e.needed}</h4>
                <span className="text-xs text-ink-400">{e.owned.length} owned · {e.suggestions.length} to add</span>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {e.owned.map((o) => (
                  <div key={o.id} className="w-24 shrink-0">
                    <div className="relative overflow-hidden rounded-xl border border-sage-300">
                      {o.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={o.photo} alt={o.label} className="aspect-square w-full object-cover" />
                      ) : (
                        <GarmentImage category={o.category} color={o.color.hex} palette={[o.color.hex]} rounded="rounded-none" className="aspect-square" />
                      )}
                      <span className="absolute left-1 top-1 rounded-full bg-sage-500 px-1.5 py-0.5 text-[8px] font-semibold uppercase text-paper-50">Yours</span>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-ink-500">{o.label}</p>
                  </div>
                ))}
              </div>
              {e.suggestions.length > 0 && <div className="mt-2"><ProductRail products={e.suggestions} /></div>}
            </div>
          ))}

          {plan.outfits.length > 0 && (
            <div>
              <SectionHeader title="Looks for the trip" caption="Ready to pack & wear" />
              <div className="grid gap-3 sm:grid-cols-2">
                {plan.outfits.map((o) => <OutfitLookboard key={o.id} outfit={o} closet={closet} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
