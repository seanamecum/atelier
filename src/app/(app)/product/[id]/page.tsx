"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { CATALOG, getProduct } from "@/lib/data/catalog";
import { getBrand } from "@/lib/data/brands";
import { getRetailer } from "@/lib/data/retailers";
import { affiliateLink } from "@/lib/retail/affiliate";
import { useAtelier } from "@/lib/store/AtelierStore";
import { GarmentImage } from "@/components/visual/GarmentImage";
import { ProductCard } from "@/components/outfit/ProductCard";
import { Price } from "@/components/ui/Price";
import { Stars } from "@/components/ui/Stars";
import { Swatches } from "@/components/visual/Swatches";
import { money, cn } from "@/lib/utils/format";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = getProduct(id);
  const { addToCart, recordView } = useAtelier();

  useEffect(() => {
    if (product) {
      recordView(product.id);
      track({ name: "product_viewed", productId: product.id, price: product.price });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const firstInStock = product?.variants.find((v) => v.inventory > 0)?.size;
  const [size, setSize] = useState<string | undefined>(firstInStock);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="card grid place-items-center gap-2 p-12 text-center">
        <p className="font-display text-xl text-ink-900">Product not found</p>
        <Link href="/stylist" className="btn-accent">Back to stylist</Link>
      </div>
    );
  }

  const brand = getBrand(product.brandId);
  const retailer = getRetailer(product.retailerId);
  const selectedVariant = product.variants.find((v) => v.size === size);

  const related = CATALOG.filter(
    (p) => p.id !== product.id && p.styleTags.some((t) => product.styleTags.includes(t)) && p.category !== product.category,
  ).slice(0, 4);

  return (
    <div>
      <Link href="/stylist" className="btn-quiet mb-3 !px-0">← Back</Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <GarmentImage category={product.category} color={product.color.hex} palette={product.palette} className="aspect-[4/5]" />
          <div className="grid grid-cols-4 gap-3">
            {product.palette.slice(0, 4).map((hex, i) => (
              <GarmentImage key={i} category={product.category} color={hex} palette={product.palette} className="aspect-square" rounded="rounded-xl" />
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="eyebrow">{brand?.name}</p>
          <h1 className="mt-1 font-display text-3xl leading-tight text-ink-900">{product.name}</h1>
          <div className="mt-2 flex items-center gap-4">
            <Stars rating={product.rating} count={product.reviewCount} />
          </div>

          <div className="mt-4">
            <Price value={product.price} msrp={product.msrp} size="lg" />
          </div>

          <p className="mt-4 leading-relaxed text-ink-600">{product.description}</p>

          <div className="mt-5 flex items-center gap-3">
            <span className="eyebrow">Color</span>
            <span className="text-sm text-ink-700">{product.color.name}</span>
            <Swatches colors={[product.color.hex, ...product.palette]} />
          </div>

          {/* Size selector */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="eyebrow">Select size</span>
              {selectedVariant && selectedVariant.inventory <= 3 && selectedVariant.inventory > 0 && (
                <span className="text-xs text-clay-500">Only {selectedVariant.inventory} left</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const out = v.inventory === 0;
                return (
                  <button
                    key={v.size}
                    disabled={out}
                    onClick={() => setSize(v.size)}
                    className={cn(
                      "min-w-12 rounded-xl border px-3 py-2 text-sm transition",
                      v.size === size ? "border-ink-900 bg-ink-900 text-paper-50" : "border-line bg-paper-50 text-ink-700 hover:border-ink-300",
                      out && "cursor-not-allowed text-ink-300 line-through opacity-60 hover:border-line",
                    )}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              className="btn-accent flex-1 !py-3"
              disabled={!size || !selectedVariant?.inventory}
              onClick={() => {
                if (!size) return;
                addToCart({ productId: product.id, size, qty: 1 });
                setAdded(true);
                setTimeout(() => setAdded(false), 1500);
              }}
            >
              {added ? "Added to bag ✓" : `Add to bag · ${money(product.price)}`}
            </button>
            <a
              href={affiliateLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost flex-1 justify-center !py-3"
            >
              View at {retailer?.name} ↗
            </a>
          </div>
          <p className="mt-3 text-xs text-ink-400">
            Free shipping over $250 · You always confirm before any purchase. Mira never checks out
            on its own.
          </p>

          {/* meta */}
          <div className="mt-6 grid grid-cols-2 gap-2 border-t border-line pt-4 text-sm">
            <Meta label="Occasions" value={product.styleTags.map((t) => t.replace("-", " ")).join(", ")} />
            <Meta label="Season" value={product.seasons.join(", ")} />
            <Meta label="Retailer" value={retailer?.name ?? "—"} />
            <Meta label="Cart handoff" value={retailer?.supportsCartHandoff ? "Supported" : "Deep link"} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-3 font-display text-2xl text-ink-900">Pairs well with</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="capitalize text-ink-700">{value}</p>
    </div>
  );
}
