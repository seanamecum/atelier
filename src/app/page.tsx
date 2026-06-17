"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { GarmentImage } from "@/components/visual/GarmentImage";
import { useAtelier } from "@/lib/store/AtelierStore";

const SAMPLE_PROMPTS = [
  "Make me a clean summer outfit under $200",
  "Build a business casual look for dinner",
  "Streetwear fit for campus, mostly black",
  "Something for a beach wedding I'm a guest at",
];

export default function Landing() {
  const { hydrated, profile } = useAtelier();
  const primaryHref = hydrated && profile.onboarded ? "/home" : "/onboarding";

  return (
    <div className="min-h-screen bg-paper bg-paper-fade">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <Link href={primaryHref} className="btn-ghost">
          {profile.onboarded ? "Open app" : "Sign in"}
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:py-20">
        <div className="animate-rise">
          <p className="eyebrow mb-4">AI stylist · Fitting room · One-tap checkout</p>
          <h1 className="font-display text-5xl leading-[1.05] text-ink-900 sm:text-6xl">
            Describe it.
            <br />
            See it on <span className="italic text-clay-400">you</span>.
            <br />
            Buy the whole look.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-500">
            Mira is your AI personal stylist and virtual fitting room. Tell it the
            outfit you want — it assembles a complete look from real retailers, sizes it
            to your body, places it on your photo, and lets you buy every piece at once.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={primaryHref} className="btn-accent !px-7 !py-3 text-base">
              Style my first outfit
            </Link>
            <Link href="/stylist" className="btn-ghost !px-7 !py-3 text-base">
              Try the generator
            </Link>
          </div>

          <div className="mt-8">
            <p className="eyebrow mb-2">Try saying</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((p) => (
                <Link
                  key={p}
                  href={`/stylist?q=${encodeURIComponent(p)}`}
                  className="chip text-xs"
                >
                  “{p}”
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Hero collage */}
        <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-3">
          <GarmentImage category="outerwear" color="#222B3D" palette={["#222B3D", "#E3DDD2", "#EFEAE1"]} className="col-span-2 aspect-[5/4] shadow-lift" />
          <GarmentImage category="bottom" color="#C9BFA8" palette={["#C9BFA8", "#EFEAE1", "#DBD3BF"]} className="aspect-square shadow-card" />
          <GarmentImage category="shoes" color="#EDEBE6" palette={["#EDEBE6", "#E3DDD2", "#FBFAF7"]} className="aspect-square shadow-card" />
          <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-line bg-paper-50 p-3 shadow-card">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-clay-400 text-paper-50">✦</div>
            <div className="text-sm">
              <p className="font-medium text-ink-900">Considered Business Casual</p>
              <p className="text-ink-400">5 pieces · sized to you · $688</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature row */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: "✨", t: "AI personal stylist", d: "Natural-language requests become complete, occasion-ready outfits within your budget." },
            { icon: "🪞", t: "Virtual fitting room", d: "Upload a photo and see recommended pieces placed on your body, sized to your measurements." },
            { icon: "🧥", t: "Shop your closet", d: "Add clothes you own and Mira builds around them — or finds the missing pieces." },
          ].map((f) => (
            <div key={f.t} className="card p-5">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-paper-200 text-lg">{f.icon}</div>
              <h3 className="mb-1 font-display text-xl text-ink-900">{f.t}</h3>
              <p className="text-sm leading-relaxed text-ink-500">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
