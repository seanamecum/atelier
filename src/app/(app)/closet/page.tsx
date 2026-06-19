"use client";

import { useState } from "react";
import type { Category, ClosetItem, Outfit, OutfitMode } from "@/lib/types";
import { useAtelier } from "@/lib/store/AtelierStore";
import { suggestMissingPieces } from "@/lib/ai/stylist";
import { extractDominantColor } from "@/lib/closet/vision";
import { PageHeader } from "@/components/ui/PageHeader";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { ModeSelector } from "@/components/outfit/ModeSelector";
import { OutfitResult } from "@/components/outfit/OutfitResult";
import { GarmentImage } from "@/components/visual/GarmentImage";
import { EmptyState } from "@/components/ui/States";
import { PackingAssistant } from "@/components/closet/PackingAssistant";
import { SeasonalPlan } from "@/components/closet/SeasonalPlan";
import { COLOR_OPTIONS } from "@/lib/data/preferences";
import { cn } from "@/lib/utils/format";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "dress", label: "Dress" },
  { value: "outerwear", label: "Outerwear" },
  { value: "shoes", label: "Shoes" },
  { value: "accessory", label: "Accessory" },
  { value: "bag", label: "Bag" },
];

type Tab = "wardrobe" | "packing" | "seasonal";

export default function ClosetPage() {
  const { closet, addClosetItem, removeClosetItem, profile, storeOutfit, hydrated } = useAtelier();
  const [tab, setTab] = useState<Tab>("wardrobe");

  // add-item form state
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<Category>("top");
  const [colorIdx, setColorIdx] = useState(0);
  const [photo, setPhoto] = useState<string | undefined>();
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);

  // build-around state
  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState<OutfitMode>("everyday");
  const [result, setResult] = useState<Outfit | null>(null);
  const [busy, setBusy] = useState(false);

  if (!hydrated) return null;

  const onPhoto = async (url: string | undefined) => {
    setPhoto(url);
    setDetected(null);
    if (!url) return;
    setDetecting(true);
    try {
      const c = await extractDominantColor(url);
      if (c) {
        const idx = COLOR_OPTIONS.findIndex((o) => o.value === c.name);
        if (idx >= 0) setColorIdx(idx);
        setDetected(c.name);
      }
    } finally {
      setDetecting(false);
    }
  };

  const add = () => {
    if (!label.trim()) return;
    const c = COLOR_OPTIONS[colorIdx];
    addClosetItem({ label: label.trim(), category, color: { name: c.value, hex: c.hex }, photo });
    setLabel("");
    setPhoto(undefined);
    setDetected(null);
  };

  const buildAround = () => {
    const items: ClosetItem[] = closet.filter((c) => selected.includes(c.id));
    if (items.length === 0) return;
    setBusy(true);
    setResult(null);
    setTimeout(() => {
      const { outfit } = suggestMissingPieces(profile, items, mode);
      storeOutfit(outfit);
      setResult(outfit);
      setBusy(false);
    }, 1200);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Your closet"
        title="Shop around what you own"
        subtitle="Add pieces you already have. Mira auto-detects colors, builds outfits around them, and plans for trips and seasons."
      />

      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        {([["wardrobe", "🧥 Wardrobe"], ["packing", "🧳 Packing"], ["seasonal", "🗓️ Seasonal"]] as const).map(([id, lbl]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn("rounded-full px-4 py-2 text-sm font-medium transition", tab === id ? "bg-ink-900 text-paper-50" : "border border-line bg-paper-50 text-ink-600 hover:border-ink-300")}
          >
            {lbl}
          </button>
        ))}
      </div>

      {tab === "packing" && (closet.length === 0 ? <NeedItems /> : <PackingAssistant />)}
      {tab === "seasonal" && (closet.length === 0 ? <NeedItems /> : <SeasonalPlan />)}

      {tab === "wardrobe" && (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Add form */}
          <div className="card h-fit p-5">
            <h2 className="mb-3 font-display text-xl text-ink-900">Add an item</h2>
            <div className="space-y-3">
              <PhotoUpload value={photo} onChange={onPhoto} label="Add a photo" hint="We'll auto-detect the color" aspect="aspect-[4/3]" />
              <input className="field" placeholder="e.g. Vintage Levi's jeans" value={label} onChange={(e) => setLabel(e.target.value)} />
              <div>
                <span className="eyebrow mb-1.5 block">Category</span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button key={c.value} onClick={() => setCategory(c.value)} className={cn("chip !px-3 !py-1 text-xs", category === c.value && "chip-active")}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="eyebrow mb-1.5 flex items-center gap-2">
                  Color
                  {detecting && <span className="text-[10px] font-normal normal-case tracking-normal text-clay-500">detecting…</span>}
                  {detected && !detecting && (
                    <span className="rounded-full bg-sage-100 px-1.5 py-0.5 text-[9px] font-medium normal-case tracking-normal text-sage-700">AI: {detected}</span>
                  )}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_OPTIONS.map((c, i) => (
                    <button
                      key={c.value}
                      onClick={() => { setColorIdx(i); setDetected(null); }}
                      className={cn("h-7 w-7 rounded-full ring-1 ring-line transition", colorIdx === i && "ring-2 ring-ink-900 ring-offset-2 ring-offset-paper-50")}
                      style={{ backgroundColor: c.hex }}
                      title={c.value}
                      aria-label={c.value}
                    />
                  ))}
                </div>
              </div>
              <button className="btn-primary w-full" onClick={add} disabled={!label.trim()}>Add to closet</button>
            </div>
          </div>

          {/* Closet grid + build */}
          <div className="space-y-5">
            {closet.length === 0 ? (
              <EmptyState icon="🧥" title="Your closet is empty" body="Add a few pieces you own to start building outfits around them." />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl text-ink-900">{closet.length} items</h2>
                  <button className="btn-quiet text-xs" onClick={() => setSelected(selected.length === closet.length ? [] : closet.map((c) => c.id))}>
                    {selected.length === closet.length ? "Clear" : "Select all"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {closet.map((item) => {
                    const active = selected.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={cn("card group relative cursor-pointer overflow-hidden transition", active && "ring-2 ring-clay-400")}
                        onClick={() => setSelected((s) => (active ? s.filter((x) => x !== item.id) : [...s, item.id]))}
                      >
                        {item.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.photo} alt={item.label} className="aspect-square w-full object-cover" />
                        ) : (
                          <GarmentImage category={item.category} color={item.color.hex} palette={[item.color.hex]} rounded="rounded-none" className="aspect-square" />
                        )}
                        <div className="p-2.5">
                          <p className="truncate text-sm font-medium text-ink-900">{item.label}</p>
                          <p className="flex items-center gap-1 text-xs capitalize text-ink-400">
                            <span className="h-2.5 w-2.5 rounded-full ring-1 ring-line" style={{ backgroundColor: item.color.hex }} />
                            {item.category}
                          </p>
                        </div>
                        <span className={cn("absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full text-xs transition", active ? "bg-clay-400 text-paper-50" : "bg-paper-50/90 text-ink-400")}>
                          {active ? "✓" : "+"}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeClosetItem(item.id); }}
                          className="absolute bottom-2 right-2 hidden rounded-full bg-paper-50/90 px-2 py-0.5 text-[10px] text-clay-500 group-hover:block"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Build around */}
                <div className="card p-5">
                  <h3 className="font-display text-xl text-ink-900">Complete the look</h3>
                  <p className="mb-3 text-sm text-ink-400">
                    {selected.length > 0
                      ? `Building around ${selected.length} selected item${selected.length > 1 ? "s" : ""}.`
                      : "Select one or more items above, choose a mode, and Mira finds the rest."}
                  </p>
                  <ModeSelector value={mode} onChange={setMode} className="mb-4" />
                  <button className="btn-accent" disabled={selected.length === 0 || busy} onClick={buildAround}>
                    {busy ? "Building…" : "✦ Build outfit around these"}
                  </button>
                </div>
              </>
            )}

            {result && (
              <div className="animate-rise pt-2">
                <OutfitResult outfit={result} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NeedItems() {
  return (
    <EmptyState
      icon="🧥"
      title="Add a few items first"
      body="Packing lists and seasonal plans build around what you own. Add some closet pieces to get started."
    />
  );
}
