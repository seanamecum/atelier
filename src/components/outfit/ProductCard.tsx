"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { getBrand } from "@/lib/data/brands";
import { getRetailer } from "@/lib/data/retailers";
import { GarmentImage } from "@/components/visual/GarmentImage";
import { Price } from "@/components/ui/Price";
import { Stars } from "@/components/ui/Stars";
import { useAtelier } from "@/lib/store/AtelierStore";
import { checkInventory } from "@/lib/retail/affiliate";
import { cn } from "@/lib/utils/format";
import { useState } from "react";

export function ProductCard({
  product,
  recommendedSize,
  rationale,
  compact = false,
}: {
  product: Product;
  recommendedSize?: string;
  rationale?: string;
  compact?: boolean;
}) {
  const brand = getBrand(product.brandId);
  const retailer = getRetailer(product.retailerId);
  const { addToCart } = useAtelier();
  const [added, setAdded] = useState(false);

  const size = recommendedSize ?? product.variants.find((v) => v.inventory > 0)?.size ?? "OS";
  const stock = checkInventory(product.id, size);

  return (
    <div className="card group flex flex-col overflow-hidden">
      <Link href={`/product/${product.id}`} className="relative block">
        <GarmentImage
          category={product.category}
          color={product.color.hex}
          palette={product.palette}
          rounded="rounded-none"
          className={cn(compact ? "aspect-square" : "aspect-[4/5]")}
        />
        {product.msrp && product.msrp > product.price && (
          <span className="absolute left-3 top-3 rounded-full bg-clay-400 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-paper-50">
            Sale
          </span>
        )}
        {recommendedSize && (
          <span className="absolute right-3 top-3 rounded-full bg-ink-900/90 px-2.5 py-1 text-[11px] font-medium text-paper-50">
            Size {recommendedSize}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="eyebrow truncate">{brand?.name ?? "Brand"}</p>
            <Link
              href={`/product/${product.id}`}
              className="line-clamp-2 text-sm font-medium leading-snug text-ink-900 hover:text-clay-500"
            >
              {product.name}
            </Link>
          </div>
          <span
            className="mt-1 h-4 w-4 shrink-0 rounded-full ring-1 ring-line"
            style={{ backgroundColor: product.color.hex }}
            title={product.color.name}
          />
        </div>

        {!compact && <Stars rating={product.rating} count={product.reviewCount} />}

        {rationale && (
          <p className="rounded-lg bg-paper-200/60 px-2.5 py-1.5 text-xs italic leading-snug text-ink-500">
            “{rationale}”
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Price value={product.price} msrp={product.msrp} />
          <button
            disabled={!stock.inStock}
            onClick={() => {
              addToCart({ productId: product.id, size, qty: 1 });
              setAdded(true);
              setTimeout(() => setAdded(false), 1400);
            }}
            className={cn(
              "btn !px-3 !py-1.5 !text-xs",
              added ? "bg-sage-500 text-paper-50" : "btn-ghost",
              !stock.inStock && "opacity-50",
            )}
          >
            {!stock.inStock ? "Sold out" : added ? "Added ✓" : "Add"}
          </button>
        </div>
        {retailer && (
          <p className="text-[11px] text-ink-300">
            at {retailer.name}
            {stock.inStock && stock.remaining <= 3 && (
              <span className="text-clay-500"> · only {stock.remaining} left</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
