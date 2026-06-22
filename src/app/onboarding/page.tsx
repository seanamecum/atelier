"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { GarmentImage } from "@/components/visual/GarmentImage";
import { useAtelier } from "@/lib/store/AtelierStore";
import { isValidEmail } from "@/lib/auth";
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
  const { signIn, continueAsGuest } = useAtelier();
  const [step, setStep] = useState(0); // 0..2 slides, 3 = account
  const onSlides = step < SLIDES.length;
  const slide = SLIDES[Math.min(step, SLIDES.length - 1)];

  return (
    <div className="flex min-h-screen flex-col bg-paper bg-paper-fade">
      <header className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
        <Logo />
        <button className="btn-quiet" onClick={() => { continueAsGuest(); router.push("/profile?setup=1"); }}>
          Skip
        </button>
      </header>

      {onSlides ? (
        <>
          <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 text-center">
            <div className="mb-8 w-full max-w-[260px] animate-rise">
              <GarmentImage category={slide.art.category as never} color={slide.art.color} palette={slide.art.palette} className="aspect-[4/5] w-full shadow-lift" />
            </div>
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-paper-200 text-2xl">{slide.icon}</div>
            <h1 className="font-display text-3xl text-ink-900">{slide.title}</h1>
            <p className="mt-3 text-base leading-relaxed text-ink-500">{slide.body}</p>
            <div className="mt-8 flex items-center gap-2">
              {SLIDES.map((_, idx) => (
                <span key={idx} className={cn("h-1.5 rounded-full transition-all", idx === step ? "w-6 bg-clay-400" : "w-1.5 bg-line")} />
              ))}
            </div>
          </main>
          <footer className="mx-auto w-full max-w-md px-5 pb-10">
            <button className="btn-accent w-full !py-3 text-base" onClick={() => setStep((s) => s + 1)}>
              {step === SLIDES.length - 1 ? "Get started" : "Continue"}
            </button>
          </footer>
        </>
      ) : (
        <AccountStep
          onSignIn={(name, email) => { signIn(name, email); router.push("/profile?setup=1"); }}
          onGuest={() => { continueAsGuest(); router.push("/profile?setup=1"); }}
          onBack={() => setStep(SLIDES.length - 1)}
        />
      )}
    </div>
  );
}

function AccountStep({
  onSignIn,
  onGuest,
  onBack,
}: {
  onSignIn: (name: string, email: string) => void;
  onGuest: () => void;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const valid = isValidEmail(email);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5">
      <div className="animate-rise">
        <p className="eyebrow mb-2">Create your account</p>
        <h1 className="font-display text-3xl leading-tight text-ink-900">Save your style, looks & closet</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Passwordless and private. We use your email only to keep your profile, saved outfits and closet in sync.
        </p>

        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => { e.preventDefault(); if (valid) onSignIn(name, email); }}
        >
          <label className="block">
            <span className="eyebrow mb-1.5 block">Name</span>
            <input className="field" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label className="block">
            <span className="eyebrow mb-1.5 block">Email</span>
            <input className="field" type="email" inputMode="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <button type="submit" className="btn-accent w-full !py-3 text-base" disabled={!valid}>
            Continue
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-ink-300">
          <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
        </div>
        <button className="btn-ghost w-full !py-3" onClick={onGuest}>Continue as guest</button>
        <button className="mt-4 block w-full text-center text-xs text-ink-400 hover:text-ink-700" onClick={onBack}>← Back</button>
      </div>
    </main>
  );
}
