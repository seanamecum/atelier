"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useAtelier } from "@/lib/store/AtelierStore";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChipSelect } from "@/components/ui/ChipSelect";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { BRANDS } from "@/lib/data/brands";
import {
  COLOR_OPTIONS,
  STYLE_KEYWORDS,
  BODY_TYPES,
  FIT_PREFERENCES,
  TOP_SIZES,
  WAIST_SIZES,
  SHOE_SIZES,
  DRESS_SIZES,
} from "@/lib/data/preferences";
import { money, cn } from "@/lib/utils/format";

function toggle(list: string[], v: string): string[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function SingleSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn("chip", value === o.value && "chip-active")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <div className="mb-3">
        <h2 className="font-display text-xl text-ink-900">{title}</h2>
        {hint && <p className="text-sm text-ink-400">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileInner />
    </Suspense>
  );
}

function ProfileInner() {
  const params = useSearchParams();
  const router = useRouter();
  const setup = params.get("setup") === "1";
  const { profile, updateProfile, completeOnboarding, setBodyPhoto } = useAtelier();
  const [saved, setSaved] = useState(false);

  const sizes = profile.sizes;
  const setSize = (key: keyof typeof sizes, v: string) =>
    updateProfile({ sizes: { ...sizes, [key]: sizes[key] === v ? undefined : v } });

  const onSave = () => {
    if (setup) {
      completeOnboarding();
      router.push("/home");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div>
      <PageHeader
        eyebrow={setup ? "Step 2 of 2" : "Your profile"}
        title={setup ? "Build your style profile" : "Style profile"}
        subtitle="The more Mira knows, the sharper your outfits and size calls. You can change any of this later."
      />

      <div className="grid gap-5">
        {/* Identity */}
        <Section title="The basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="eyebrow mb-1.5 block">Name</span>
              <input
                className="field"
                placeholder="Your name"
                value={profile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="eyebrow mb-1.5 block">Height (cm)</span>
                <input
                  type="number"
                  className="field"
                  placeholder="178"
                  value={profile.heightCm ?? ""}
                  onChange={(e) => updateProfile({ heightCm: e.target.value ? +e.target.value : undefined })}
                />
              </label>
              <label className="block">
                <span className="eyebrow mb-1.5 block">Weight (kg)</span>
                <input
                  type="number"
                  className="field"
                  placeholder="74"
                  value={profile.weightKg ?? ""}
                  onChange={(e) => updateProfile({ weightKg: e.target.value ? +e.target.value : undefined })}
                />
              </label>
            </div>
          </div>
          <div className="mt-4">
            <span className="eyebrow mb-2 block">Body type</span>
            <SingleSelect
              options={BODY_TYPES}
              value={profile.bodyType}
              onChange={(v) => updateProfile({ bodyType: v as never })}
            />
          </div>
        </Section>

        {/* Sizes */}
        <Section title="Your sizes" hint="Used to recommend the right size for every piece.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="eyebrow mb-2 block">Tops</span>
              <SingleSelect options={TOP_SIZES.map((s) => ({ value: s, label: s }))} value={sizes.top} onChange={(v) => setSize("top", v)} />
            </div>
            <div>
              <span className="eyebrow mb-2 block">Outerwear</span>
              <SingleSelect options={TOP_SIZES.map((s) => ({ value: s, label: s }))} value={sizes.outerwear} onChange={(v) => setSize("outerwear", v)} />
            </div>
            <div>
              <span className="eyebrow mb-2 block">Waist</span>
              <SingleSelect options={WAIST_SIZES.map((s) => ({ value: s, label: s }))} value={sizes.bottomWaist} onChange={(v) => setSize("bottomWaist", v)} />
            </div>
            <div>
              <span className="eyebrow mb-2 block">Shoes (US)</span>
              <SingleSelect options={SHOE_SIZES.map((s) => ({ value: s, label: s }))} value={sizes.shoe} onChange={(v) => setSize("shoe", v)} />
            </div>
            <div>
              <span className="eyebrow mb-2 block">Dress</span>
              <SingleSelect options={DRESS_SIZES.map((s) => ({ value: s, label: s }))} value={sizes.dress} onChange={(v) => setSize("dress", v)} />
            </div>
          </div>
        </Section>

        {/* Budget */}
        <Section title="Budget" hint="Default ceiling for a full outfit. You can override it per request.">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={100}
              max={2000}
              step={50}
              value={profile.budget}
              onChange={(e) => updateProfile({ budget: +e.target.value })}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-line accent-clay-400"
            />
            <span className="w-24 text-right font-display text-2xl text-ink-900">{money(profile.budget)}</span>
          </div>
        </Section>

        {/* Fit */}
        <Section title="Fit preference" hint="How you like clothes to sit on you.">
          <SingleSelect
            options={FIT_PREFERENCES}
            value={profile.fitPreference}
            onChange={(v) => updateProfile({ fitPreference: v as never })}
          />
        </Section>

        {/* Colors */}
        <Section title="Colors you love" hint="Mira leans into these and avoids the ones you skip.">
          <span className="eyebrow mb-2 block">Favorites</span>
          <div className="mb-4 flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => {
              const active = profile.colorPreferences.includes(c.value);
              return (
                <button
                  key={c.value}
                  onClick={() => updateProfile({ colorPreferences: toggle(profile.colorPreferences, c.value) })}
                  className={cn("chip capitalize", active && "chip-active")}
                >
                  <span className="h-3.5 w-3.5 rounded-full ring-1 ring-line" style={{ backgroundColor: c.hex }} />
                  {c.value}
                </button>
              );
            })}
          </div>
          <span className="eyebrow mb-2 block">Avoid</span>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => {
              const active = profile.colorAvoids.includes(c.value);
              return (
                <button
                  key={c.value}
                  onClick={() => updateProfile({ colorAvoids: toggle(profile.colorAvoids, c.value) })}
                  className={cn("chip capitalize", active && "border-clay-400 bg-clay-50 text-clay-600")}
                >
                  {c.value}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Brands */}
        <Section title="Favorite brands" hint="We'll prioritize these when they fit the look and budget.">
          <ChipSelect
            options={BRANDS.map((b) => ({ value: b.id, label: b.name }))}
            selected={profile.favoriteBrandIds}
            onToggle={(v) => updateProfile({ favoriteBrandIds: toggle(profile.favoriteBrandIds, v) })}
          />
        </Section>

        {/* Taste */}
        <Section title="Style taste" hint="Pick the words that sound like you.">
          <ChipSelect
            options={STYLE_KEYWORDS.map((k) => ({ value: k, label: k }))}
            selected={profile.styleKeywords}
            onToggle={(v) => updateProfile({ styleKeywords: toggle(profile.styleKeywords, v) })}
          />
        </Section>

        {/* Photo */}
        <Section title="Photo for try-on" hint="Optional. A full-body photo powers the virtual fitting room.">
          <div className="max-w-[240px]">
            <PhotoUpload value={profile.bodyPhoto} onChange={setBodyPhoto} label="Upload your photo" />
          </div>
        </Section>

        <div className="sticky bottom-20 z-20 md:bottom-4">
          <button className="btn-accent w-full !py-3.5 text-base shadow-lift" onClick={onSave}>
            {setup ? "Finish & start styling" : saved ? "Saved ✓" : "Save profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
