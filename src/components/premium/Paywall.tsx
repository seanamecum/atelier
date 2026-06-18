"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtelier } from "@/lib/store/AtelierStore";
import { PLANS } from "@/lib/premium";
import { track } from "@/lib/analytics";

/** A focused upgrade prompt shown when a free user hits a gated feature. */
export function Paywall({
  feature,
  title,
  body,
  onClose,
}: {
  feature: string;
  title: string;
  body: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { setPlan } = useAtelier();
  const plus = PLANS.plus;

  useEffect(() => {
    track({ name: "paywall_viewed", feature });
  }, [feature]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end sm:place-items-center" role="dialog" aria-modal="true" aria-label="Upgrade to Mira+">
      <button className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-md animate-scale-in overflow-hidden rounded-t-3xl bg-studio-900 bg-studio-spot p-6 text-paper-50 shadow-float sm:rounded-3xl">
        <div className="mb-1 flex items-center justify-between">
          <span className="rounded-full bg-champagne-gradient px-2.5 py-1 text-[11px] font-semibold text-studio-900">Mira+</span>
          <button className="text-paper-300 hover:text-paper-50" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <h2 className="mt-2 font-display text-2xl leading-tight">{title}</h2>
        <p className="mt-1.5 text-sm text-paper-200">{body}</p>

        <ul className="mt-4 space-y-2">
          {plus.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-paper-100">
              <span className="mt-0.5 text-champagne-300">✦</span>
              {f}
            </li>
          ))}
        </ul>

        <button
          className="btn-champagne mt-5 w-full !py-3 text-base"
          onClick={() => {
            track({ name: "upgrade_started", plan: "plus" });
            // Prototype: activate instantly. Production: route to Stripe / StoreKit.
            setPlan("plus");
            onClose();
            router.push("/upgrade?welcome=1");
          }}
        >
          Start Mira+ · ${plus.priceMonthly}/mo
        </button>
        <button className="mt-2 w-full text-center text-xs text-paper-300 hover:text-paper-100" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
