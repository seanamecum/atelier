"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAtelier } from "@/lib/store/AtelierStore";
import { OutfitResult } from "@/components/outfit/OutfitResult";
import { PageHeader } from "@/components/ui/PageHeader";
import { modeLabel } from "@/lib/utils/format";

export default function OutfitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { outfits, hydrated } = useAtelier();
  if (!hydrated) return null;

  const outfit = outfits[id];

  if (!outfit) {
    return (
      <div className="card grid place-items-center gap-2 p-12 text-center">
        <div className="text-4xl">🧐</div>
        <p className="font-display text-xl text-ink-900">Outfit not found</p>
        <p className="max-w-sm text-sm text-ink-400">
          This look may have been generated in another session. Try styling a new one.
        </p>
        <Link href="/stylist" className="btn-accent mt-1">Style an outfit</Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={`${modeLabel(outfit.mode)} look`}
        title={outfit.title}
        subtitle={outfit.prompt ? `“${outfit.prompt}”` : outfit.summary}
        action={<Link href="/saved" className="btn-quiet">← Back to saved</Link>}
      />
      <OutfitResult outfit={outfit} />
    </div>
  );
}
