"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAtelier } from "@/lib/store/AtelierStore";
import { OutfitLookboard } from "@/components/outfit/OutfitLookboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/States";
import { modeLabel, money, cn } from "@/lib/utils/format";

export default function SavedPage() {
  const { savedOutfits, outfits, closet, collections, createCollection, toggleOutfitInCollection, deleteCollection, hydrated } = useAtelier();
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [assignFor, setAssignFor] = useState<string | null>(null); // outfitId being assigned
  const [newName, setNewName] = useState("");

  const saved = useMemo(() => (hydrated ? savedOutfits() : []), [hydrated, savedOutfits]);
  if (!hydrated) return null;

  const visible = activeCollection
    ? (collections.find((c) => c.id === activeCollection)?.outfitIds.map((id) => outfits[id]).filter(Boolean) ?? [])
    : saved;

  return (
    <div>
      <PageHeader
        eyebrow="Saved looks"
        title="Your lookbook"
        subtitle="Curate looks into collections — capsules, seasons, inspiration boards."
        action={<Link href="/stylist" className="btn-accent">+ New outfit</Link>}
      />

      {saved.length === 0 ? (
        <EmptyState icon="🔖" title="Nothing saved yet" body="When you generate a look you like, tap “Save” to keep it here." cta={{ label: "Style an outfit", href: "/stylist" }} />
      ) : (
        <>
          {/* Collections bar */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCollection(null)}
              className={cn("rounded-full px-3.5 py-1.5 text-sm transition", !activeCollection ? "bg-ink-900 text-paper-50" : "border border-line bg-paper-50 text-ink-600 hover:border-ink-300")}
            >
              All · {saved.length}
            </button>
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCollection(c.id)}
                className={cn("group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition", activeCollection === c.id ? "bg-clay-400 text-paper-50" : "border border-line bg-paper-50 text-ink-600 hover:border-ink-300")}
              >
                {c.name} · {c.outfitIds.length}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); if (confirm(`Delete collection “${c.name}”?`)) { deleteCollection(c.id); if (activeCollection === c.id) setActiveCollection(null); } }}
                  className="opacity-0 transition group-hover:opacity-60 hover:!opacity-100"
                  aria-label={`Delete ${c.name}`}
                >
                  ✕
                </span>
              </button>
            ))}
            {/* create new */}
            <form
              onSubmit={(e) => { e.preventDefault(); if (newName.trim()) { setActiveCollection(createCollection(newName)); setNewName(""); } }}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-line bg-paper-50 px-2 py-1"
            >
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="+ New collection" className="w-28 bg-transparent px-1.5 text-sm outline-none placeholder:text-ink-300" />
              {newName.trim() && <button type="submit" className="rounded-full bg-ink-900 px-2 py-0.5 text-xs text-paper-50">Add</button>}
            </form>
          </div>

          {visible.length === 0 ? (
            <EmptyState icon="🗂️" title="This collection is empty" body="Add saved looks to it from the “…” menu on any outfit." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {visible.map((o) => (
                <div key={o.id} className="group relative">
                  <Link href={`/outfit/${o.id}`} className="block transition hover:-translate-y-0.5">
                    <OutfitLookboard outfit={o} closet={closet} />
                  </Link>
                  <div className="mt-2 flex items-center justify-between px-1">
                    <p className="text-sm text-ink-400">{modeLabel(o.mode)} · {money(o.total)}</p>
                    <button
                      onClick={() => setAssignFor(assignFor === o.id ? null : o.id)}
                      className="rounded-full border border-line px-2 py-0.5 text-xs text-ink-500 hover:border-ink-300"
                    >
                      {assignFor === o.id ? "Done" : "Add to collection ▾"}
                    </button>
                  </div>

                  {assignFor === o.id && (
                    <div className="mt-2 animate-fade-in rounded-xl border border-line bg-paper-50 p-3 shadow-card">
                      {collections.length === 0 && <p className="mb-2 text-xs text-ink-400">No collections yet — create one above.</p>}
                      <div className="flex flex-wrap gap-1.5">
                        {collections.map((c) => {
                          const inIt = c.outfitIds.includes(o.id);
                          return (
                            <button
                              key={c.id}
                              onClick={() => toggleOutfitInCollection(c.id, o.id)}
                              className={cn("chip !px-3 !py-1 text-xs", inIt && "chip-active")}
                            >
                              {inIt ? "✓ " : ""}{c.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
