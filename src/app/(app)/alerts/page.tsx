"use client";

import { useEffect, useMemo } from "react";
import { useAtelier } from "@/lib/store/AtelierStore";
import { computeAlerts } from "@/lib/data/alerts";
import { getProduct } from "@/lib/data/catalog";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/States";
import { ProductRail, SectionHeader } from "@/components/feed/ProductRail";
import { ProductCard } from "@/components/outfit/ProductCard";
import { track } from "@/lib/analytics";
import { money } from "@/lib/utils/format";

export default function AlertsPage() {
  const { watchlist, profile, hydrated } = useAtelier();
  const alerts = useMemo(
    () => (hydrated ? computeAlerts(watchlist, profile.budget) : null),
    [hydrated, watchlist, profile.budget],
  );

  useEffect(() => {
    if (alerts) track({ name: "alerts_viewed", badgeCount: alerts.badgeCount });
  }, [alerts?.badgeCount]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hydrated || !alerts) return null;

  const watching = watchlist.length > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Alerts"
        title="Drops, deals & trends"
        subtitle="Price drops on the pieces you watch, plus what's trending and just landed."
      />

      {/* Watched price drops */}
      <section>
        <SectionHeader title="Price drops" caption={watching ? "Markdowns on your watchlist & the catalog" : "Markdowns across the catalog"} />
        {alerts.priceDrops.length === 0 ? (
          <EmptyState icon="🔔" title="No drops right now" body="Tap the bell on any product to watch it — we'll flag the moment its price falls." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {alerts.priceDrops.slice(0, 8).map((d) => (
              <div key={d.product.id} className="relative">
                <span className="absolute -right-1.5 -top-1.5 z-10 rounded-full bg-clay-400 px-2 py-0.5 text-[10px] font-semibold text-paper-50 shadow-card">
                  −{d.dropPct}% · save {money(d.saved)}
                </span>
                <ProductCard product={d.product} compact />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Watchlist status */}
      {watching && (
        <section>
          <SectionHeader title="Your watchlist" caption={`${watchlist.length} item${watchlist.length === 1 ? "" : "s"}`} />
          {alerts.watchedLowStock.length > 0 && (
            <div className="mb-3 rounded-xl border border-clay-200 bg-clay-50 px-4 py-3 text-sm text-clay-600">
              ⚠️ Selling out: {alerts.watchedLowStock.map((p) => p.name).join(", ")} — limited sizes left.
            </div>
          )}
          <ProductRail products={watchlist.map(getProduct).filter(Boolean) as never} />
        </section>
      )}

      {/* Trending */}
      <section>
        <SectionHeader title="Trending now" caption="Most-loved this week" />
        <ProductRail products={alerts.trending} />
      </section>

      {/* New arrivals */}
      <section>
        <SectionHeader title="Just landed" caption="New arrivals from your retailers" />
        <ProductRail products={alerts.newArrivals} />
      </section>
    </div>
  );
}
