"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/outfit/ProductCard";

export function SectionHeader({
  title,
  caption,
  href,
  hrefLabel = "See all",
}: {
  title: string;
  caption?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="feed-title">{title}</h2>
        {caption && <p className="text-sm text-ink-400">{caption}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-medium text-clay-500 hover:text-clay-600">
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}

export function ProductRail({ products }: { products: Product[] }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 edge-fade">
      {products.map((p) => (
        <div key={p.id} className="w-40 shrink-0 sm:w-44">
          <ProductCard product={p} compact />
        </div>
      ))}
    </div>
  );
}
