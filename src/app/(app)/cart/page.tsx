"use client";

import Link from "next/link";
import { useAtelier } from "@/lib/store/AtelierStore";
import { getProduct } from "@/lib/data/catalog";
import { getRetailer } from "@/lib/data/retailers";
import { getBrand } from "@/lib/data/brands";
import { GarmentImage } from "@/components/visual/GarmentImage";
import { PageHeader } from "@/components/ui/PageHeader";
import { Price } from "@/components/ui/Price";
import { money, cn } from "@/lib/utils/format";

export default function CartPage() {
  const { cart, updateCartQty, removeFromCart, cartSubtotal, cartCount, hydrated } = useAtelier();
  if (!hydrated) return null;

  const shipping = cartSubtotal > 250 || cartSubtotal === 0 ? 0 : 12;
  const tax = +(cartSubtotal * 0.0875).toFixed(2);
  const total = cartSubtotal + shipping + tax;

  // group by retailer
  const retailers = Array.from(
    new Set(cart.lines.map((l) => getProduct(l.productId)?.retailerId).filter(Boolean) as string[]),
  );

  if (cart.lines.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Your bag" title="Bag" />
        <div className="card grid place-items-center gap-2 p-12 text-center">
          <div className="text-4xl">🛍️</div>
          <p className="font-display text-xl text-ink-900">Your bag is empty</p>
          <p className="max-w-sm text-sm text-ink-400">Style a look or browse pieces, then add them here.</p>
          <Link href="/stylist" className="btn-accent mt-1">Style an outfit</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Your bag" title={`Bag · ${cartCount} item${cartCount > 1 ? "s" : ""}`} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Lines grouped by retailer */}
        <div className="space-y-5">
          {retailers.map((rid) => {
            const retailer = getRetailer(rid);
            const lines = cart.lines.filter((l) => getProduct(l.productId)?.retailerId === rid);
            return (
              <div key={rid} className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                  <span className="text-sm font-medium text-ink-900">{retailer?.name}</span>
                  <span className="text-xs text-ink-400">
                    {retailer?.supportsCartHandoff ? "One-tap cart handoff" : "Deep link checkout"}
                  </span>
                </div>
                <div className="divide-y divide-line">
                  {lines.map((line) => {
                    const p = getProduct(line.productId);
                    if (!p) return null;
                    const brand = getBrand(p.brandId);
                    return (
                      <div key={line.productId + line.size} className="flex gap-3 p-3.5">
                        <Link href={`/product/${p.id}`}>
                          <GarmentImage category={p.category} color={p.color.hex} palette={p.palette} className="h-20 w-20" rounded="rounded-lg" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="eyebrow">{brand?.name}</p>
                          <Link href={`/product/${p.id}`} className="truncate text-sm font-medium text-ink-900 hover:text-clay-500">
                            {p.name}
                          </Link>
                          <p className="text-xs text-ink-400">Size {line.size} · {p.color.name}</p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="inline-flex items-center rounded-full border border-line">
                              <button className="px-2.5 py-1 text-ink-500 hover:text-ink-900" onClick={() => updateCartQty(line.productId, line.size, line.qty - 1)}>−</button>
                              <span className="min-w-6 text-center text-sm tabular-nums">{line.qty}</span>
                              <button className="px-2.5 py-1 text-ink-500 hover:text-ink-900" onClick={() => updateCartQty(line.productId, line.size, line.qty + 1)}>+</button>
                            </div>
                            <Price value={p.price * line.qty} />
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(line.productId, line.size)} className="self-start text-ink-300 hover:text-clay-500" aria-label="Remove">✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="card p-5">
            <h2 className="mb-3 font-display text-xl text-ink-900">Summary</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Subtotal" value={money(cartSubtotal)} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : money(shipping)} />
              <Row label="Estimated tax" value={money(tax)} />
              <div className="my-2 border-t border-line" />
              <Row label="Total" value={money(total)} bold />
            </dl>
            <Link href="/checkout" className="btn-accent mt-4 w-full !py-3">
              Review & checkout
            </Link>
            <p className="mt-2 text-center text-xs text-ink-400">You'll confirm before anything is purchased.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={cn("text-ink-500", bold && "font-medium text-ink-900")}>{label}</dt>
      <dd className={cn("tabular-nums text-ink-700", bold && "font-display text-lg text-ink-900")}>{value}</dd>
    </div>
  );
}
