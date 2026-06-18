"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAtelier } from "@/lib/store/AtelierStore";
import { PLANS } from "@/lib/premium";
import { PageHeader } from "@/components/ui/PageHeader";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils/format";

export default function UpgradePage() {
  return (
    <Suspense fallback={null}>
      <UpgradeInner />
    </Suspense>
  );
}

function UpgradeInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { plan, setPlan, hydrated } = useAtelier();
  const welcome = params.get("welcome") === "1";
  if (!hydrated) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Membership"
        title={welcome && plan === "plus" ? "Welcome to Mira+" : "Unlock Mira+"}
        subtitle={
          welcome && plan === "plus"
            ? "You're all set. Unlimited styling and advanced try-on are now on."
            : "Your personal AI shopper, unlimited — built for people who actually care how they look."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {(["free", "plus"] as const).map((id) => {
          const p = PLANS[id];
          const current = plan === id;
          const premium = id === "plus";
          return (
            <div
              key={id}
              className={cn(
                "relative overflow-hidden rounded-3xl border p-6",
                premium ? "border-transparent bg-studio-900 bg-studio-spot text-paper-50 shadow-studio-card" : "border-line bg-paper-50",
              )}
            >
              {premium && (
                <span className="absolute right-5 top-5 rounded-full bg-champagne-gradient px-2.5 py-1 text-[10px] font-semibold text-studio-900">
                  Most popular
                </span>
              )}
              <p className={cn("eyebrow", premium && "!text-champagne-200")}>{p.name}</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="font-display text-4xl">{p.priceMonthly === 0 ? "Free" : `$${p.priceMonthly}`}</span>
                {p.priceMonthly > 0 && <span className={cn("pb-1 text-sm", premium ? "text-paper-300" : "text-ink-400")}>/mo</span>}
              </div>
              <p className={cn("mt-1 text-sm", premium ? "text-paper-200" : "text-ink-500")}>{p.blurb}</p>

              <ul className="mt-4 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className={cn("flex items-start gap-2 text-sm", premium ? "text-paper-100" : "text-ink-600")}>
                    <span className={premium ? "text-champagne-300" : "text-clay-400"}>✦</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {current ? (
                  <div className={cn("rounded-full py-2.5 text-center text-sm font-medium", premium ? "bg-white/10 text-paper-100" : "bg-paper-200 text-ink-500")}>
                    Your current plan
                  </div>
                ) : premium ? (
                  <button
                    className="btn-champagne w-full !py-3"
                    onClick={() => { track({ name: "upgrade_started", plan: "plus" }); setPlan("plus"); router.push("/upgrade?welcome=1"); }}
                  >
                    Start Mira+ · ${p.priceMonthly}/mo
                  </button>
                ) : (
                  <button className="btn-ghost w-full !py-3" onClick={() => setPlan("free")}>
                    Switch to Free
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-ink-400">
        Prototype billing — upgrades activate instantly and no card is charged. Production wires this to Stripe / App Store / Play billing.
      </p>
    </div>
  );
}
