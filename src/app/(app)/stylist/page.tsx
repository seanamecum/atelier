"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Outfit, OutfitMode } from "@/lib/types";
import { useAtelier } from "@/lib/store/AtelierStore";
import { generateOutfit } from "@/lib/ai/stylist";
import { ModeSelector } from "@/components/outfit/ModeSelector";
import { OutfitResult } from "@/components/outfit/OutfitResult";
import { PageHeader } from "@/components/ui/PageHeader";
import { money } from "@/lib/utils/format";

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
  const { profile, storeOutfit, hydrated } = useAtelier();

  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<OutfitMode>("everyday");
  // Whether the user explicitly picked a mode chip. Until they do, the mode is
  // inferred from the prompt so "business casual dinner" doesn't get overridden.
  const [modeTouched, setModeTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [result, setResult] = useState<Outfit | null>(null);
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
    setLoading(true);
    setResult(null);
    setThinkingStep(0);
    const interval = setInterval(
      () => setThinkingStep((s) => Math.min(s + 1, THINKING.length - 1)),
      280,
    );
    // Simulate model latency; engine itself is synchronous.
    setTimeout(() => {
      clearInterval(interval);
      const { outfit } = generateOutfit(profile, {
        prompt: text,
        // Only force the mode when the user explicitly chose a chip; otherwise
        // let the engine infer it from the prompt.
        mode: modeTouched ? mode : undefined,
      });
      storeOutfit(outfit);
      if (!modeTouched) setMode(outfit.mode); // sync chip highlight to inference
      setResult(outfit);
      setLoading(false);
    }, 1500);
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
        {!loading && result && (
          <div className="animate-rise">
            <OutfitResult outfit={result} />
            <div className="mt-5 flex justify-center">
              <button className="btn-ghost" onClick={() => run(prompt || "everyday outfit")}>
                ↻ Restyle this request
              </button>
            </div>
          </div>
        )}
        {!loading && !result && (
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
