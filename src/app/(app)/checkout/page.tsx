"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAtelier } from "@/lib/store/AtelierStore";
import { getProduct } from "@/lib/data/catalog";
import { getBrand } from "@/lib/data/brands";
import { planCartHandoff } from "@/lib/retail/affiliate";
import { PageHeader } from "@/components/ui/PageHeader";
import { money, cn } from "@/lib/utils/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, order, createPendingOrder, confirmOrder, resetOrder, hydrated } =
    useAtelier();
  const [confirmed, setConfirmed] = useState(false);
  const [placed, setPlaced] = useState(false);

  if (!hydrated) return null;

  // Order success view
  if (placed || order?.status === "confirmed") {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card grid place-items-center gap-3 p-10 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-sage-500 text-3xl text-paper-50">✓</div>
          <h1 className="font-display text-3xl text-ink-900">Order confirmed</h1>
          <p className="max-w-sm text-sm text-ink-500">
            Your look is on its way. We've handed each retailer their portion of the order — you'll get
            individual shipping confirmations by email.
          </p>
          <div className="flex gap-2">
            <Link href="/stylist" className="btn-accent" onClick={resetOrder}>Style another look</Link>
            <Link href="/saved" className="btn-ghost" onClick={resetOrder}>View saved</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Checkout" title="Checkout" />
        <div className="card grid place-items-center gap-2 p-12 text-center">
          <p className="font-display text-xl text-ink-900">Nothing to check out</p>
          <Link href="/stylist" className="btn-accent">Style an outfit</Link>
        </div>
      </div>
    );
  }

  const shipping = cartSubtotal > 250 ? 0 : 12;
  const tax = +(cartSubtotal * 0.0875).toFixed(2);
  const total = +(cartSubtotal + shipping + tax).toFixed(2);
  const handoffs = planCartHandoff(cart.lines);

  return (
    <div>
      <PageHeader eyebrow="Checkout" title="Review & confirm" subtitle="Nothing is purchased until you confirm below." action={<Link href="/cart" className="btn-quiet">← Back to bag</Link>} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          {/* Retailer handoff plan */}
          <div className="card p-5">
            <h2 className="mb-1 font-display text-xl text-ink-900">How this order is placed</h2>
            <p className="mb-4 text-sm text-ink-400">
              Your look spans {handoffs.length} retailer{handoffs.length > 1 ? "s" : ""}. Mira hands each
              one their items. You stay in control — confirm once and we route every piece.
            </p>
            <div className="space-y-3">
              {handoffs.map((h) => (
                <div key={h.retailerId} className="rounded-xl border border-line p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink-900">{h.retailerName}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px]", h.supportsCartHandoff ? "bg-sage-100 text-sage-700" : "bg-paper-200 text-ink-500")}>
                      {h.supportsCartHandoff ? "Direct cart handoff" : "Secure deep link"}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-ink-600">
                    {h.lines.map((l) => {
                      const p = getProduct(l.productId);
                      const brand = getBrand(p?.brandId ?? "");
                      return (
                        <li key={l.productId + l.size} className="flex justify-between">
                          <span>{brand?.name} {p?.name} · {l.size} × {l.qty}</span>
                          <span className="tabular-nums">{money((p?.price ?? 0) * l.qty)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping (mock) */}
          <div className="card p-5">
            <h2 className="mb-3 font-display text-xl text-ink-900">Shipping to</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field" placeholder="Full name" defaultValue="" />
              <input className="field" placeholder="Email" defaultValue="" />
              <input className="field sm:col-span-2" placeholder="Address" />
              <input className="field" placeholder="City" />
              <input className="field" placeholder="ZIP" />
            </div>
            <p className="mt-2 text-xs text-ink-400">Demo only — no real address or payment is processed.</p>
          </div>
        </div>

        {/* Confirm panel */}
        <div className="lg:sticky lg:top-20 h-fit">
          <div className="card p-5">
            <h2 className="mb-3 font-display text-xl text-ink-900">Order total</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Subtotal" value={money(cartSubtotal)} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : money(shipping)} />
              <Row label="Estimated tax" value={money(tax)} />
              <div className="my-2 border-t border-line" />
              <Row label="Total" value={money(total)} bold />
            </dl>

            <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl bg-paper-200/60 p-3 text-sm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-clay-400"
              />
              <span className="text-ink-600">
                I've reviewed my look and authorize Mira to place this order across the retailers above.
              </span>
            </label>

            <button
              className="btn-accent mt-3 w-full !py-3"
              disabled={!confirmed}
              onClick={() => { createPendingOrder(); confirmOrder(); setPlaced(true); }}
            >
              Confirm & place order · {money(total)}
            </button>
            <p className="mt-2 text-center text-xs text-ink-400">
              🔒 Mira never auto-purchases. This is the only step that places the order.
            </p>
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
