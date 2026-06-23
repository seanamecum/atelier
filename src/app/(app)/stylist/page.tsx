"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Outfit, OutfitMode } from "@/lib/types";
import { useAtelier } from "@/lib/store/AtelierStore";
import { api } from "@/lib/services/api";
import { ModeSelector } from "@/components/outfit/ModeSelector";
import { OutfitResult } from "@/components/outfit/OutfitResult";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/States";
import { Paywall } from "@/components/premium/Paywall";
import { track } from "@/lib/analytics";
import { money } from "@/lib/utils/format";
import Link from "next/link";

const STARTERS = [
  "A clean summer outfit under $200",
  "Business casual look for a dinner meeting",
  "All-black streetwear fit for campus",
  "Smart interview outfit, navy and grey",
  "Relaxed vacation outfit for warm weather",
];

const THINKING = [
  "Reading your request…",
  "Matching your sizes & palette…",
  "Pulling pieces from retailers…",
  "Balancing the budget…",
  "Composing your look…",
];

export default function StylistPage() {
  return (
    <Suspense fallback={null}>
      <StylistInner />
    </Suspense>
  );
}

function StylistInner() {
  const params = useSearchParams();
  const { profile, storeOutfit, hydrated, consumeGeneration, generationsLeft, isPremium } = useAtelier();

  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<OutfitMode>("everyday");
  // Whether the user explicitly picked a mode chip. Until they do, the mode is
  // inferred from the prompt so "business casual dinner" doesn't get overridden.
  const [modeTouched, setModeTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [result, setResult] = useState<Outfit | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastPrompt = useRef("");
  const seeded = useRef(false);

  // Seed from ?q= once.
  useEffect(() => {
    if (seeded.current || !hydrated) return;
    const q = params.get("q");
    if (q) {
      seeded.current = true;
      setPrompt(q);
      run(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function run(text: string) {
    // Free tier: enforce the daily styling cap, then open the paywall.
    if (!consumeGeneration()) {
      setPaywall(true);
      return;
    }
    lastPrompt.current = text;
    setLoading(true);
    setResult(null);
    setError(null);
    setThinkingStep(0);
    const interval = setInterval(
      () => setThinkingStep((s) => Math.min(s + 1, THINKING.length - 1)),
      280,
    );
    // Call the AI stylist over the versioned HTTP API (same endpoint a mobile
    // client would use). Only force the mode when the user picked a chip.
    api.stylist
      .generate({ prompt: text, mode: modeTouched ? mode : undefined, profile })
      .then(({ outfit }) => {
        storeOutfit(outfit);
        track({ name: "outfit_generated", prompt: text, mode: outfit.mode, total: outfit.total, intents: outfit.intents });
        if (!modeTouched) setMode(outfit.mode); // sync chip highlight to inference
        setResult(outfit);
      })
      .catch(() => setError("We couldn't reach the stylist just now. Please try again."))
      .finally(() => {
        clearInterval(interval);
        setLoading(false);
      });
  }

  const budgetHint = (() => {
    const m = prompt.match(/\$?\s?(\d{2,4})/);
    if (m && /(\$|under|budget|less|spend)/.test(prompt.toLowerCase())) return +m[1];
    return profile.budget;
  })();

  return (
    <div>
      <PageHeader
        eyebrow="AI Stylist"
        title="What should we put you in?"
        subtitle="Describe the outfit, occasion, vibe, colors or budget — in your own words."
        action={
          isPremium ? (
            <span className="rounded-full bg-champagne-gradient px-3 py-1.5 text-xs font-semibold text-studio-900">Mira+ · unlimited</span>
          ) : (
            <Link href="/upgrade" className="rounded-full border border-line bg-paper-50 px-3 py-1.5 text-xs text-ink-600 hover:border-ink-300">
              {generationsLeft} styling{generationsLeft === 1 ? "" : "s"} left today
            </Link>
          )
        }
      />

      {/* Composer */}
      <div className="card p-4 sm:p-5">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. Make me a clean summer outfit under $200 — neutral colors, comfortable shoes"
          className="field resize-none text-base"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && prompt.trim()) run(prompt);
          }}
        />

        <div className="mt-3">
          <p className="eyebrow mb-2">Outfit mode</p>
          <ModeSelector value={mode} onChange={(m) => { setMode(m); setModeTouched(true); }} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-ink-400">
            Budget for this look: <span className="font-medium text-ink-700">{money(budgetHint)}</span>
          </span>
          <button
            className="btn-accent !px-6"
            disabled={loading || !prompt.trim()}
            onClick={() => run(prompt)}
          >
            {loading ? "Styling…" : "✦ Style my outfit"}
          </button>
        </div>

        {!prompt && (
          <div className="mt-4 border-t border-line pt-3">
            <p className="eyebrow mb-2">Need a starting point?</p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button key={s} className="chip text-xs" onClick={() => { setPrompt(s); run(s); }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result area */}
      <div className="mt-7">
        {loading && <ThinkingState step={thinkingStep} />}
        {!loading && error && (
          <ErrorState title="Styling failed" body={error} onRetry={() => run(lastPrompt.current || prompt || "everyday outfit")} />
        )}
        {!loading && !error && result && (
          <div className="animate-rise">
            <OutfitResult outfit={result} />
            <div className="mt-5 flex justify-center">
              <button className="btn-ghost" onClick={() => run(prompt || "everyday outfit")}>
                ↻ Restyle this request
              </button>
            </div>
          </div>
        )}
        {!loading && !result && !error && (
          <div className="card grid place-items-center gap-2 p-12 text-center">
            <div className="text-4xl">✨</div>
            <p className="font-display text-xl text-ink-900">Your outfit will appear here</p>
            <p className="max-w-sm text-sm text-ink-400">
              Describe a look above and Mira will assemble a complete outfit — pieces, prices,
              sizes and a visual preview.
            </p>
          </div>
        )}
      </div>

      {paywall && (
        <Paywall
          feature="unlimited-styling"
          title="You're on a roll"
          body={`You've used your ${3} free stylings today. Go unlimited with Mira+ and never stop.`}
          onClose={() => setPaywall(false)}
        />
      )}
    </div>
  );
}

function ThinkingState({ step }: { step: number }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="order-2 lg:order-1">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="shimmer aspect-[4/5]" />
              <div className="space-y-2 p-3.5">
                <div className="shimmer h-3 w-1/2 rounded" />
                <div className="shimmer h-3 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <div className="card grid place-items-center gap-3 p-10 text-center">
          <div className="relative h-12 w-12">
            <span className="absolute inset-0 animate-ping rounded-full bg-clay-200/60" />
            <span className="absolute inset-2 rounded-full bg-clay-400" />
          </div>
          <p className="font-display text-lg text-ink-900">{THINKING[step]}</p>
          <p className="text-xs text-ink-400">Composing a look tuned to your profile</p>
        </div>
      </div>
    </div>
  );
}
