"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAtelier } from "@/lib/store/AtelierStore";
import { computeStyleDNA } from "@/lib/personalization/styleDNA";
import { recommendedForYou, trendingNow, newArrivals, outfitOfTheDay } from "@/lib/data/feed";
import { api, type FeedResult } from "@/lib/services/api";
import { getProduct } from "@/lib/data/catalog";
import { buildLook } from "@/lib/ai/look";
import { FashionFigure } from "@/components/tryon/FashionFigure";
import { ProductRail, SectionHeader } from "@/components/feed/ProductRail";
import { Swatches } from "@/components/visual/Swatches";
import { money, modeLabel, cn } from "@/lib/utils/format";

const QUICK_PROMPTS = [
  "Make me look taller",
  "Dress me like an investment banker",
  "Old-money summer outfit under $400",
  "A college fit that turns heads",
];

export default function HomePage() {
  const router = useRouter();
  const { profile, savedOutfits, cart, recentlyViewedIds, streak, collections, outfits, hydrated, storeOutfit } = useAtelier();
  const [q, setQ] = useState("");

  const saved = hydrated ? savedOutfits() : [];
  const dna = useMemo(() => (hydrated ? computeStyleDNA(profile, saved, cart) : null), [hydrated, profile, saved, cart]);
  const ootd = useMemo(() => (hydrated ? outfitOfTheDay(profile) : null), [hydrated, profile]);

  // Local feed is the instant fallback; the API result upgrades it when it lands
  // (so home never shows a loading gap and the /api/v1/feed endpoint is exercised).
  const localRecs = useMemo(() => (hydrated ? recommendedForYou(profile) : []), [hydrated, profile]);
  const localTrending = useMemo(() => trendingNow(), []);
  const localArrivals = useMemo(() => newArrivals(), []);
  const [feed, setFeed] = useState<FeedResult | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    api.feed(profile).then((f) => active && setFeed(f)).catch(() => {});
    return () => { active = false; };
  }, [hydrated, profile]);

  const recs = feed?.recommended ?? localRecs;
  const trending = feed?.trending ?? localTrending;
  const arrivals = feed?.newArrivals ?? localArrivals;
  const recent = recentlyViewedIds.map(getProduct).filter(Boolean) as ReturnType<typeof getProduct>[];

  if (!hydrated || !dna || !ootd) return <HomeSkeleton />;

  const firstName = profile.name?.split(" ")[0] || "there";
  const ootdLook = buildLook(ootd);

  const go = (text: string) => router.push(`/stylist?q=${encodeURIComponent(text)}`);

  return (
    <div className="space-y-9 pb-6">
      {/* Greeting + streak */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">{greeting()}</p>
          <h1 className="font-display text-3xl leading-tight text-ink-900 sm:text-4xl">Hello, {firstName}</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-line bg-paper-50 px-3 py-1.5 shadow-card">
          <span className="text-lg">🔥</span>
          <div className="leading-none">
            <p className="text-sm font-semibold text-ink-900">{streak.count} day{streak.count === 1 ? "" : "s"}</p>
            <p className="text-[10px] text-ink-400">style streak</p>
          </div>
        </div>
      </div>

      {/* AI stylist search hero */}
      <section className="relative overflow-hidden rounded-3xl bg-studio-900 bg-studio-spot p-6 text-paper-50 shadow-studio-card sm:p-8">
        <div className="absolute right-5 top-5 h-14 w-14 animate-spin-slow rounded-full border border-champagne-300/30" />
        <p className="eyebrow !text-champagne-200">Mira AI Stylist</p>
        <h2 className="mt-2 max-w-md font-display text-2xl leading-tight sm:text-3xl">
          Describe any outfit. See it on you. Buy the look.
        </h2>
        <form
          onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q); }}
          className="mt-4 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 p-1.5 backdrop-blur-xl"
        >
          <span className="pl-3 text-lg">✦</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="“a clean summer outfit under $200”"
            className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm text-paper-50 outline-none placeholder:text-paper-300"
          />
          <button type="submit" className="btn-champagne shrink-0 !px-4 !py-2">Style it</button>
        </form>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => go(p)}
              className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-paper-200 transition hover:bg-white/15"
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* Outfit of the Day + Style DNA */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* OOTD */}
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-0 sm:grid-cols-[180px_minmax(0,1fr)]">
            <div className="relative bg-gradient-to-b from-studio-800 to-studio-950">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_10%,rgba(201,161,90,0.22),transparent_60%)]" />
              <FashionFigure look={ootdLook} className="p-2" />
            </div>
            <div className="flex flex-col p-4">
              <p className="eyebrow text-clay-500">Outfit of the day</p>
              <h3 className="mt-1 font-display text-2xl leading-tight text-ink-900">{ootd.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-ink-500">{ootd.summary}</p>
              <div className="mt-2"><Swatches colors={ootd.palette} /></div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <span className="font-display text-xl text-ink-900">{money(ootd.total)}</span>
                <button
                  className="btn-accent !py-2"
                  onClick={() => { storeOutfit(ootd); router.push(`/outfit/${ootd.id}`); }}
                >
                  View look
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Style DNA */}
        <Link href="/profile" className="card-interactive overflow-hidden bg-studio-900 bg-studio-spot p-5 text-paper-50">
          <div className="flex items-center justify-between">
            <p className="eyebrow !text-champagne-200">Your Style DNA</p>
            <span className="rounded-full bg-champagne-gradient px-2 py-0.5 text-[10px] font-semibold text-studio-900">{dna.tier}</span>
          </div>
          <div className="mt-3 flex items-end gap-3">
            <span className="font-display text-5xl leading-none text-champagne">{dna.score}</span>
            <span className="pb-1 text-xs text-paper-300">/ 100 style score</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-paper-200">{dna.descriptor}</p>
          <div className="mt-3 space-y-1.5">
            {dna.traits.slice(0, 3).map((t) => (
              <div key={t.label}>
                <div className="mb-0.5 flex justify-between text-[11px] text-paper-300">
                  <span>{t.label}</span><span>{t.value}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-champagne-gradient" style={{ width: `${t.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Swatches colors={dna.palette} />
            <span className="ml-auto text-xs text-champagne-200">Refine →</span>
          </div>
        </Link>
      </section>

      {/* Recommended for You */}
      <section>
        <SectionHeader title="Recommended for you" caption="Tuned to your Style DNA" href="/stylist" hrefLabel="Style a look" />
        <ProductRail products={recs} />
      </section>

      {/* Trending */}
      <section>
        <SectionHeader title="Trending now" caption="What everyone's wearing this week" />
        <ProductRail products={trending} />
      </section>

      {/* Complete your closet */}
      <section className="overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-paper-50 to-paper-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-clay-500">Complete your closet</p>
            <h3 className="mt-1 font-display text-2xl text-ink-900">Add what you own. We'll style around it.</h3>
            <p className="mt-1 max-w-md text-sm text-ink-500">
              Mira categorizes your pieces, detects colors, builds outfits from them and finds what's missing.
            </p>
          </div>
          <Link href="/closet" className="btn-accent">Open closet</Link>
        </div>
      </section>

      {/* New arrivals */}
      <section>
        <SectionHeader title="New arrivals" caption="Fresh from your favorite retailers" />
        <ProductRail products={arrivals} />
      </section>

      {/* Recently viewed */}
      {recent.length > 0 && (
        <section>
          <SectionHeader title="Recently viewed" />
          <ProductRail products={recent as never} />
        </section>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <section>
          <SectionHeader title="Your collections" caption="Curated boards" href="/saved" />
          <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 edge-fade">
            {collections.map((c) => {
              const looks = c.outfitIds.map((id) => outfits[id]).filter(Boolean);
              return (
                <Link key={c.id} href="/saved" className="w-44 shrink-0 rounded-2xl border border-line bg-paper-50 p-3 shadow-card transition hover:-translate-y-0.5">
                  <div className="mb-2 grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
                    {[0, 1, 2, 3].map((i) => {
                      const o = looks[i];
                      return (
                        <div key={i} className="aspect-square overflow-hidden bg-gradient-to-b from-studio-800 to-studio-950">
                          {o ? <FashionFigure look={buildLook(o)} /> : null}
                        </div>
                      );
                    })}
                  </div>
                  <p className="truncate text-sm font-medium text-ink-900">{c.name}</p>
                  <p className="text-xs text-ink-400">{c.outfitIds.length} look{c.outfitIds.length === 1 ? "" : "s"}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Saved */}
      {saved.length > 0 && (
        <section>
          <SectionHeader title="Your saved looks" href="/saved" />
          <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 edge-fade">
            {saved.slice(0, 6).map((o) => (
              <Link
                key={o.id}
                href={`/outfit/${o.id}`}
                className="w-44 shrink-0 rounded-2xl border border-line bg-paper-50 p-3 shadow-card transition hover:-translate-y-0.5"
              >
                <div className="relative mb-2 aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-b from-studio-800 to-studio-950">
                  <FashionFigure look={buildLook(o)} />
                </div>
                <p className="truncate text-sm font-medium text-ink-900">{o.title}</p>
                <p className="text-xs text-ink-400">{modeLabel(o.mode)} · {money(o.total)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function HomeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="shimmer h-10 w-48 rounded-lg" />
      <div className="shimmer h-40 w-full rounded-3xl" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="shimmer h-48 rounded-2xl" />)}
      </div>
    </div>
  );
}
