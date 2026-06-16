"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Outfit } from "@/lib/types";
import { getProduct } from "@/lib/data/catalog";
import { useAtelier } from "@/lib/store/AtelierStore";
import { OutfitLookboard } from "@/components/outfit/OutfitLookboard";
import { ProductCard } from "@/components/outfit/ProductCard";
import { money } from "@/lib/utils/format";

export function OutfitResult({ outfit }: { outfit: Outfit }) {
  const router = useRouter();
  const { closet, toggleSaveOutfit, isSaved, addOutfitToCart, storeOutfit } = useAtelier();
  const [flash, setFlash] = useState<string | null>(null);

  const saved = isSaved(outfit.id);

  const catalogPieces = outfit.pieces.filter((p) => !p.fromCloset && getProduct(p.productId));
  const closetPieces = outfit.pieces.filter((p) => p.fromCloset);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* Left: product cards */}
      <div className="order-2 lg:order-1">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink-900">The pieces</h2>
          <span className="text-sm text-ink-400">{catalogPieces.length} to shop</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {catalogPieces.map((piece) => {
            const product = getProduct(piece.productId)!;
            return (
              <ProductCard
                key={piece.productId}
                product={product}
                recommendedSize={piece.recommendedSize}
                rationale={piece.rationale}
              />
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

      {/* Right: lookboard + actions (sticky) */}
      <div className="order-1 lg:order-2">
        <div className="lg:sticky lg:top-20 space-y-4">
          <OutfitLookboard outfit={outfit} closet={closet} />

          <div className="card p-4">
            <p className="text-sm leading-relaxed text-ink-600">{outfit.summary}</p>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <span className="eyebrow">Full look total</span>
              <span className="font-display text-2xl text-ink-900">{money(outfit.total)}</span>
            </div>

            <div className="mt-4 grid gap-2">
              <button
                className="btn-accent w-full"
                onClick={() => {
                  const n = addOutfitToCart(outfit);
                  setFlash(`Added ${n} pieces to your bag`);
                  setTimeout(() => setFlash(null), 1800);
                }}
              >
                Add full look to bag · {money(outfit.total)}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="btn-ghost"
                  onClick={() => {
                    storeOutfit(outfit);
                    router.push(`/try-on?outfit=${outfit.id}`);
                  }}
                >
                  🪞 Try it on
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    storeOutfit(outfit);
                    toggleSaveOutfit(outfit);
                  }}
                >
                  {saved ? "🔖 Saved" : "Save look"}
                </button>
              </div>
              <Link href="/cart" className="btn-quiet w-full justify-center">
                Go to bag →
              </Link>
            </div>

            {flash && (
              <p className="mt-2 animate-fade-in rounded-lg bg-sage-100 px-3 py-2 text-center text-sm text-sage-700">
                {flash}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
