"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Outfit, OutfitPiece, Product } from "@/lib/types";
import { getProduct } from "@/lib/data/catalog";
import { useAtelier } from "@/lib/store/AtelierStore";
import { pieceAlternatives } from "@/lib/ai/stylist";
import { OutfitLookboard } from "@/components/outfit/OutfitLookboard";
import { ProductCard } from "@/components/outfit/ProductCard";
import { money } from "@/lib/utils/format";

export function OutfitResult({ outfit }: { outfit: Outfit }) {
  const router = useRouter();
  const { closet, toggleSaveOutfit, isSaved, addOutfitToCart, storeOutfit } = useAtelier();
  const [flash, setFlash] = useState<string | null>(null);
  // productId(original) -> swapped Product
  const [swaps, setSwaps] = useState<Record<string, Product>>({});

  const saved = isSaved(outfit.id);

  // Effective outfit with any swaps applied (keeps the look interactive).
  const effective = useMemo<Outfit>(() => {
    const pieces: OutfitPiece[] = outfit.pieces.map((piece) => {
      const alt = swaps[piece.productId];
      if (!alt) return piece;
      return {
        ...piece,
        productId: alt.id,
        recommendedSize: alt.variants.find((v) => v.inventory > 0)?.size ?? piece.recommendedSize,
        rationale: `Swapped in — ${alt.name}.`,
      };
    });
    const total = pieces.reduce((t, p) => (p.fromCloset ? t : t + (getProduct(p.productId)?.price ?? 0)), 0);
    return { ...outfit, pieces, total };
  }, [outfit, swaps]);

  const catalogPieces = effective.pieces.filter((p) => !p.fromCloset && getProduct(p.productId));
  const closetPieces = effective.pieces.filter((p) => p.fromCloset);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* Left: product cards with swap affordances */}
      <div className="order-2 lg:order-1">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="feed-title">The pieces</h2>
          <span className="text-sm text-ink-400">{catalogPieces.length} to shop</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {outfit.pieces
            .filter((p) => !p.fromCloset && getProduct(p.productId))
            .map((piece, i) => {
              const original = getProduct(piece.productId)!;
              const shown = swaps[piece.productId] ?? original;
              const alts = pieceAlternatives(original, outfit.mode);
              return (
                <div key={piece.productId} className={`reveal reveal-${Math.min(i + 1, 6)}`}>
                  <ProductCard
                    product={shown}
                    recommendedSize={swaps[piece.productId] ? shown.variants.find((v) => v.inventory > 0)?.size : piece.recommendedSize}
                    rationale={swaps[piece.productId] ? undefined : piece.rationale}
                  />
                  {(alts.cheaper || alts.upgrade) && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {swaps[piece.productId] && (
                        <button
                          className="rounded-full border border-line bg-paper-50 px-2 py-0.5 text-[10px] text-ink-500 hover:border-ink-300"
                          onClick={() => setSwaps((s) => { const n = { ...s }; delete n[piece.productId]; return n; })}
                        >
                          ↺ Original {money(original.price)}
                        </button>
                      )}
                      {alts.cheaper && shown.id !== alts.cheaper.id && (
                        <button
                          className="rounded-full border border-sage-300 bg-sage-100/60 px-2 py-0.5 text-[10px] font-medium text-sage-700 hover:bg-sage-100"
                          onClick={() => setSwaps((s) => ({ ...s, [piece.productId]: alts.cheaper! }))}
                        >
                          ↓ Budget {money(alts.cheaper.price)}
                        </button>
                      )}
                      {alts.upgrade && shown.id !== alts.upgrade.id && (
                        <button
                          className="rounded-full border border-champagne-200 bg-champagne-100/50 px-2 py-0.5 text-[10px] font-medium text-clay-600 hover:bg-champagne-100"
                          onClick={() => setSwaps((s) => ({ ...s, [piece.productId]: alts.upgrade! }))}
                        >
                          ↑ Upgrade {money(alts.upgrade.price)}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {closetPieces.length > 0 && (
          <div className="mt-4 rounded-xl border border-sage-300 bg-sage-100/50 p-3 text-sm text-sage-700">
            Built around {closetPieces.length} item{closetPieces.length > 1 ? "s" : ""} from your closet —
            no need to buy those again.
          </div>
        )}
      </div>

      {/* Right: lookboard + notes + actions */}
      <div className="order-1 lg:order-2">
        <div className="lg:sticky lg:top-20 space-y-4">
          <OutfitLookboard outfit={effective} closet={closet} />

          {/* Stylist's notes */}
          {outfit.styleNotes && outfit.styleNotes.length > 0 && (
            <div className="card p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-champagne-gradient text-[11px] text-studio-900">✦</span>
                <p className="eyebrow !tracking-[0.18em]">Stylist's notes</p>
              </div>
              <ul className="space-y-1.5">
                {outfit.styleNotes.map((n, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-snug text-ink-600">
                    <span className="text-clay-400">—</span>
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card p-4">
            <p className="text-sm leading-relaxed text-ink-600">{effective.summary}</p>

            {/* price breakdown */}
            <div className="mt-3 space-y-1.5 border-t border-line pt-3">
              {catalogPieces.map((piece) => {
                const p = getProduct(piece.productId)!;
                return (
                  <div key={piece.productId} className="flex items-center justify-between text-sm">
                    <span className="truncate text-ink-500">{p.name}</span>
                    <span className="tabular-nums text-ink-700">{money(p.price)}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="eyebrow">Full look total</span>
              <span className="font-display text-2xl text-ink-900">{money(effective.total)}</span>
            </div>

            <div className="mt-4 grid gap-2">
              <button
                className="btn-accent w-full"
                onClick={() => {
                  const n = addOutfitToCart(effective);
                  setFlash(`Added ${n} pieces to your bag`);
                  setTimeout(() => setFlash(null), 1800);
                }}
              >
                Add full look to bag · {money(effective.total)}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="btn-ghost"
                  onClick={() => { storeOutfit(effective); router.push(`/try-on?outfit=${effective.id}`); }}
                >
                  🪞 Try it on
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => { storeOutfit(effective); toggleSaveOutfit(effective); }}
                >
                  {saved ? "🔖 Saved" : "Save look"}
                </button>
              </div>
              <Link href="/cart" className="btn-quiet w-full justify-center">Go to bag →</Link>
            </div>

            {flash && (
              <p className="mt-2 animate-fade-in rounded-lg bg-sage-100 px-3 py-2 text-center text-sm text-sage-700">{flash}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
