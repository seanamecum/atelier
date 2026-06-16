"use client";

import Link from "next/link";
import { useAtelier } from "@/lib/store/AtelierStore";
import { OutfitLookboard } from "@/components/outfit/OutfitLookboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { modeLabel } from "@/lib/utils/format";

export default function SavedPage() {
  const { savedOutfits, closet, hydrated } = useAtelier();
  if (!hydrated) return null;
  const outfits = savedOutfits();

  return (
    <div>
      <PageHeader
        eyebrow="Saved looks"
        title="Your lookbook"
        subtitle="Outfits you've saved. Tap any look to view, try on, or buy the full set."
        action={<Link href="/stylist" className="btn-accent">+ New outfit</Link>}
      />

      {outfits.length === 0 ? (
        <div className="card grid place-items-center gap-2 p-12 text-center">
          <div className="text-4xl">🔖</div>
          <p className="font-display text-xl text-ink-900">Nothing saved yet</p>
          <p className="max-w-sm text-sm text-ink-400">
            When you generate a look you like, tap “Save look” to keep it here.
          </p>
          <Link href="/stylist" className="btn-accent mt-1">Style an outfit</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {outfits.map((o) => (
            <Link key={o.id} href={`/outfit/${o.id}`} className="block transition hover:-translate-y-0.5">
              <OutfitLookboard outfit={o} closet={closet} />
              <p className="mt-2 px-1 text-sm text-ink-400">
                {modeLabel(o.mode)}{o.prompt ? ` · “${o.prompt}”` : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
