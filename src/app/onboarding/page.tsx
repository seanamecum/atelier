"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { GarmentImage } from "@/components/visual/GarmentImage";
import { cn } from "@/lib/utils/format";

const SLIDES = [
  {
    icon: "✨",
    title: "Meet your AI stylist",
    body: "Tell Mira what you need in plain words — “a clean summer outfit under $200” — and get a complete look with real pieces, prices and sizes.",
    art: { category: "top", color: "#6E2230", palette: ["#6E2230", "#EFEAE1", "#E3DDD2"] },
  },
  {
    icon: "🪞",
    title: "See it on your body",
    body: "Upload a photo and your measurements. Mira places recommended pieces on you and calls the right size, so you order with confidence.",
    art: { category: "dress", color: "#222B3D", palette: ["#222B3D", "#E3DDD2", "#EFEAE1"] },
  },
  {
    icon: "🛍️",
    title: "Buy the whole look",
    body: "Add every piece to one bag across retailers. You always confirm before anything is purchased — Mira never checks out on its own.",
    art: { category: "shoes", color: "#EDEBE6", palette: ["#EDEBE6", "#E3DDD2", "#FBFAF7"] },
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;

  return (
    <div className="flex min-h-screen flex-col bg-paper bg-paper-fade">
      <header className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
        <Logo />
        <button className="btn-quiet" onClick={() => router.push("/profile?setup=1")}>
          Skip intro
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 text-center">
        <div className="mb-8 w-full max-w-[260px] animate-rise">
          <GarmentImage
            category={slide.art.category as never}
            color={slide.art.color}
            palette={slide.art.palette}
            className="aspect-[4/5] w-full shadow-lift"
          />
        </div>
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-paper-200 text-2xl">
          {slide.icon}
        </div>
        <h1 className="font-display text-3xl text-ink-900">{slide.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">{slide.body}</p>

        <div className="mt-8 flex items-center gap-2">
          {SLIDES.map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === i ? "w-6 bg-clay-400" : "w-1.5 bg-line",
              )}
            />
          ))}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-md px-5 pb-10">
        <button
          className="btn-accent w-full !py-3 text-base"
          onClick={() => (last ? router.push("/profile?setup=1") : setI(i + 1))}
        >
          {last ? "Create my style profile" : "Continue"}
        </button>
      </footer>
    </div>
  );
}
