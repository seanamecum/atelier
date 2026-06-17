"use client";

import { useMemo, useState } from "react";
import type { Outfit, StyleProfile } from "@/lib/types";
import { buildLook, fitReport, SKIN_TONES, HAIR_TONES, type LookSlot } from "@/lib/ai/look";
import { FashionFigure, type Pose } from "@/components/tryon/FashionFigure";
import { cn } from "@/lib/utils/format";

const POSES: { id: Pose; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "back", label: "Back" },
];

export function TryOnStudio({
  outfit,
  profile,
  compareOutfit,
  photo,
}: {
  outfit: Outfit;
  profile: StyleProfile;
  compareOutfit?: Outfit;
  photo?: string;
}) {
  const [pose, setPose] = useState<Pose>("front");
  const [zoom, setZoom] = useState(1);
  const [before, setBefore] = useState(false);
  const [skin, setSkin] = useState(profile.bodyPhoto ? SKIN_TONES[1] : SKIN_TONES[1]);
  const [hair, setHair] = useState(HAIR_TONES[0]);
  const [swap, setSwap] = useState<Record<string, string>>({});

  const baseLook = useMemo(() => buildLook(outfit), [outfit]);
  // apply colour swaps
  const look = useMemo(() => {
    const l = { ...baseLook };
    for (const [slot, color] of Object.entries(swap)) {
      const s = slot as LookSlot;
      if (l[s]) l[s] = { ...l[s]!, color };
    }
    return l;
  }, [baseLook, swap]);

  const compareLook = useMemo(() => (compareOutfit ? buildLook(compareOutfit) : null), [compareOutfit]);
  const fit = useMemo(() => fitReport(profile), [profile]);

  const swappableSlots = (Object.keys(baseLook) as LookSlot[]).filter((s) => baseLook[s]);

  return (
    <div className="overflow-hidden rounded-3xl bg-studio-900 bg-studio-spot text-paper-50 shadow-studio-card">
      {/* Stage */}
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full glass-dark px-3 py-1.5 text-[11px] font-medium">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-champagne-300" />
          Mira Fitting Room
        </div>

        {/* pose switch */}
        <div className="absolute right-4 top-4 z-20 flex rounded-full glass-dark p-0.5 text-xs">
          {POSES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPose(p.id)}
              className={cn(
                "rounded-full px-3 py-1 transition",
                pose === p.id ? "bg-champagne-gradient text-studio-900" : "text-paper-300 hover:text-paper-50",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className={cn("relative grid gap-2 px-4 pb-2 pt-16", compareLook ? "grid-cols-2" : "grid-cols-1")}>
          <Stage label={compareLook ? "This look" : undefined} zoom={zoom} photo={photo}>
            <FashionFigure look={look} pose={pose} skinTone={skin} hairTone={hair} showClothes={!before} />
          </Stage>
          {compareLook && (
            <Stage label="Compare" zoom={zoom}>
              <FashionFigure look={compareLook} pose={pose} skinTone={skin} hairTone={hair} />
            </Stage>
          )}
        </div>

        {/* zoom + before/after */}
        <div className="flex items-center justify-between gap-3 px-4 pb-3">
          <div className="flex items-center gap-2 text-xs text-paper-300">
            <span>Zoom</span>
            <input
              type="range"
              min={1}
              max={1.8}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(+e.target.value)}
              className="w-28"
            />
          </div>
          <button
            onClick={() => setBefore((b) => !b)}
            className={cn("rounded-full px-3 py-1.5 text-xs transition glass-dark", before && "bg-paper-50/15")}
          >
            {before ? "Showing: Before" : "Before / After"}
          </button>
        </div>
      </div>

      {/* Fit panel */}
      <div className="grid gap-px bg-studio-700/60 sm:grid-cols-2">
        <div className="bg-studio-900 p-4">
          <div className="mb-1 flex items-center justify-between text-xs text-paper-300">
            <span>Fit confidence</span>
            <span className="font-medium text-champagne-200">{Math.round(fit.confidence * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-studio-700">
            <div className="h-full rounded-full bg-champagne-gradient" style={{ width: `${fit.confidence * 100}%` }} />
          </div>
          <div className="mb-1 mt-3 flex items-center justify-between text-xs text-paper-300">
            <span>Estimated sizing accuracy</span>
            <span className="font-medium text-sage-300">{fit.sizingAccuracy}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-studio-700">
            <div className="h-full rounded-full bg-sage-500" style={{ width: `${fit.sizingAccuracy}%` }} />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-paper-300">{fit.note}</p>
        </div>

        <div className="bg-studio-900 p-4">
          {/* model + color controls */}
          <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-paper-300">Model</p>
          <div className="mb-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {SKIN_TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setSkin(t)}
                  className={cn("h-6 w-6 rounded-full ring-2 transition", skin === t ? "ring-champagne-300" : "ring-transparent")}
                  style={{ backgroundColor: t }}
                  aria-label="skin tone"
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {HAIR_TONES.slice(0, 4).map((t) => (
                <button
                  key={t}
                  onClick={() => setHair(t)}
                  className={cn("h-6 w-6 rounded-full ring-2 transition", hair === t ? "ring-champagne-300" : "ring-transparent")}
                  style={{ backgroundColor: t }}
                  aria-label="hair tone"
                />
              ))}
            </div>
          </div>

          {swappableSlots.length > 0 && (
            <>
              <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-paper-300">Swap color</p>
              <div className="space-y-2">
                {swappableSlots.slice(0, 3).map((slot) => {
                  const paint = baseLook[slot]!;
                  const options = [paint.color, ...paint.palette, "#1A1714", "#F3F0EA", "#222B3D"].filter(
                    (v, i, a) => a.indexOf(v) === i,
                  ).slice(0, 6);
                  const current = swap[slot] ?? paint.color;
                  return (
                    <div key={slot} className="flex items-center gap-2">
                      <span className="w-16 truncate text-[11px] capitalize text-paper-300">{slot}</span>
                      <div className="flex gap-1.5">
                        {options.map((c) => (
                          <button
                            key={c}
                            onClick={() => setSwap((s) => ({ ...s, [slot]: c }))}
                            className={cn("h-5 w-5 rounded-full ring-2 transition", current === c ? "ring-champagne-300" : "ring-white/10")}
                            style={{ backgroundColor: c }}
                            aria-label={`swap ${slot}`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stage({
  children,
  label,
  zoom,
  photo,
}: {
  children: React.ReactNode;
  label?: string;
  zoom: number;
  photo?: string;
}) {
  return (
    <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-gradient-to-b from-studio-800 to-studio-950">
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="you" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      )}
      {/* spotlight */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_8%,rgba(201,161,90,0.22),transparent_60%)]" />
      <div className="absolute inset-0 transition-transform duration-300 ease-spring" style={{ transform: `scale(${zoom})` }}>
        {children}
      </div>
      {label && (
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full glass-dark px-2.5 py-0.5 text-[10px] text-paper-200">
          {label}
        </span>
      )}
    </div>
  );
}
