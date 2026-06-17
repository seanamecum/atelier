"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useAtelier } from "@/lib/store/AtelierStore";
import { getProduct } from "@/lib/data/catalog";
import { TryOnStudio } from "@/components/tryon/TryOnStudio";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { PageHeader } from "@/components/ui/PageHeader";
import { GarmentImage } from "@/components/visual/GarmentImage";
import { money, modeLabel, cn } from "@/lib/utils/format";

export default function TryOnPage() {
  return (
    <Suspense fallback={null}>
      <TryOnInner />
    </Suspense>
  );
}

function TryOnInner() {
  const params = useSearchParams();
  const { profile, outfits, lastOutfitId, savedOutfits, setBodyPhoto, addOutfitToCart, toggleSaveOutfit, isSaved, hydrated } =
    useAtelier();

  const available = useMemo(() => {
    const list = [...savedOutfits()];
    const all = Object.values(outfits).sort((a, b) => b.createdAt - a.createdAt);
    for (const o of all) if (!list.find((x) => x.id === o.id)) list.push(o);
    return list;
  }, [outfits, savedOutfits]);

  const requested = params.get("outfit");
  const [selectedId, setSelectedId] = useState<string | null>(requested);
  const [compareId, setCompareId] = useState<string | null>(null);
  const activeId = selectedId ?? requested ?? lastOutfitId ?? available[0]?.id ?? null;
  const outfit = activeId ? outfits[activeId] : undefined;
  const compareOutfit = compareId ? outfits[compareId] : undefined;
  const [flash, setFlash] = useState<string | null>(null);

  if (!hydrated) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Virtual fitting room"
        title="See it on you"
        subtitle="Mira renders the look on a body model tuned to your measurements. Rotate, zoom, compare, and swap colors in real time."
      />

      {!outfit ? (
        <div className="card grid place-items-center gap-3 p-12 text-center">
          <div className="text-4xl">🪞</div>
          <p className="font-display text-xl text-ink-900">No outfit selected yet</p>
          <p className="max-w-sm text-sm text-ink-400">Generate or save a look first, then come back to try it on.</p>
          <Link href="/stylist" className="btn-accent mt-1">Style an outfit</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Studio */}
          <div className="space-y-4">
            <TryOnStudio outfit={outfit} profile={profile} compareOutfit={compareOutfit} photo={profile.bodyPhoto} />

            {/* outfit + compare selectors */}
            {available.length > 1 && (
              <div className="card p-4">
                <p className="eyebrow mb-2">Try another look</p>
                <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 edge-fade">
                  {available.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSelectedId(o.id)}
                      className={cn(
                        "shrink-0 rounded-xl border px-3 py-2 text-left text-xs transition",
                        o.id === activeId ? "border-ink-900 bg-ink-900 text-paper-50" : "border-line bg-paper-50 text-ink-600 hover:border-ink-300",
                      )}
                    >
                      <span className="block font-medium">{o.title}</span>
                      <span className="opacity-70">{money(o.total)}</span>
                    </button>
                  ))}
                </div>
                <p className="eyebrow mb-2 mt-4">Compare side by side</p>
                <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 edge-fade">
                  <button
                    onClick={() => setCompareId(null)}
                    className={cn("shrink-0 rounded-xl border px-3 py-2 text-xs transition", !compareId ? "border-clay-400 bg-clay-50 text-clay-600" : "border-line text-ink-500 hover:border-ink-300")}
                  >
                    Off
                  </button>
                  {available
                    .filter((o) => o.id !== activeId)
                    .map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setCompareId(o.id)}
                        className={cn(
                          "shrink-0 rounded-xl border px-3 py-2 text-left text-xs transition",
                          o.id === compareId ? "border-clay-400 bg-clay-50 text-clay-600" : "border-line text-ink-500 hover:border-ink-300",
                        )}
                      >
                        <span className="block font-medium">{o.title}</span>
                        <span className="opacity-70">{money(o.total)}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">{modeLabel(outfit.mode)}</p>
                  <h2 className="font-display text-2xl text-ink-900">{outfit.title}</h2>
                </div>
                <Link href={`/outfit/${outfit.id}`} className="btn-quiet !px-2 text-xs">View look →</Link>
              </div>

              {!profile.bodyPhoto ? (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-ink-500">
                    Upload a full-body photo for a personalized fitting (used as the studio backdrop in this prototype).
                  </p>
                  <PhotoUpload value={profile.bodyPhoto} onChange={setBodyPhoto} aspect="aspect-[3/2]" />
                </div>
              ) : (
                <button className="btn-ghost mt-4 w-full !py-2 text-xs" onClick={() => setBodyPhoto(undefined)}>
                  Remove photo
                </button>
              )}
            </div>

            {/* per-piece sizing */}
            <div className="card divide-y divide-line">
              {outfit.pieces.map((piece, i) => {
                const p = getProduct(piece.productId);
                if (!p && !piece.fromCloset) return null;
                return (
                  <div key={i} className="flex items-center gap-3 p-3">
                    {p ? (
                      <GarmentImage category={p.category} color={p.color.hex} palette={p.palette} className="h-14 w-14" rounded="rounded-lg" />
                    ) : (
                      <div className="grid h-14 w-14 place-items-center rounded-lg bg-sage-100 text-sage-700">👕</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{p?.name ?? "Your closet item"}</p>
                      <p className="line-clamp-1 text-xs text-ink-400">{piece.rationale}</p>
                    </div>
                    <span className="rounded-full bg-paper-200 px-2.5 py-1 text-xs font-medium text-ink-700">
                      {piece.fromCloset ? "Owned" : `Size ${piece.recommendedSize}`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                className="btn-ghost"
                onClick={() => {
                  toggleSaveOutfit(outfit);
                  setFlash(isSaved(outfit.id) ? "Removed from saved" : "Saved this look");
                  setTimeout(() => setFlash(null), 1600);
                }}
              >
                {isSaved(outfit.id) ? "🔖 Saved" : "Save look"}
              </button>
              <button
                className="btn-accent"
                onClick={() => {
                  const n = addOutfitToCart(outfit);
                  setFlash(`Added ${n} pieces · ${money(outfit.total)}`);
                  setTimeout(() => setFlash(null), 1800);
                }}
              >
                Add to bag
              </button>
            </div>
            {flash && (
              <p className="animate-fade-in rounded-lg bg-sage-100 px-3 py-2 text-center text-sm text-sage-700">{flash}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
