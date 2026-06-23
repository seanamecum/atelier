import { describe, it, expect } from "vitest";
import { fitReport } from "@/lib/ai/look";
import type { StyleProfile } from "@/lib/types";

function profile(over: Partial<StyleProfile> = {}): StyleProfile {
  return {
    name: "T",
    sizes: {},
    budget: 400,
    favoriteBrandIds: [],
    colorPreferences: [],
    colorAvoids: [],
    fitPreference: "regular",
    styleKeywords: [],
    onboarded: true,
    ...over,
  };
}

describe("fitReport", () => {
  it("rises in confidence as measurements are added", () => {
    const sparse = fitReport(profile());
    const rich = fitReport(
      profile({
        bodyType: "athletic",
        heightCm: 180,
        weightKg: 78,
        sizes: { top: "M", bottomWaist: "32", shoe: "10" },
        measurements: { chest: 100, waist: 82, hips: 98, inseam: 81, shoulder: 46 },
      }),
    );
    expect(rich.confidence).toBeGreaterThan(sparse.confidence);
    expect(rich.sizingAccuracy).toBeGreaterThan(sparse.sizingAccuracy);
  });

  it("keeps confidence and accuracy within sane bounds", () => {
    const r = fitReport(profile());
    expect(r.confidence).toBeGreaterThan(0);
    expect(r.confidence).toBeLessThanOrEqual(1);
    expect(r.sizingAccuracy).toBeGreaterThanOrEqual(0);
    expect(r.sizingAccuracy).toBeLessThanOrEqual(100);
  });

  it("prompts for measurements when none are set", () => {
    expect(fitReport(profile()).adjustments.join(" ").toLowerCase()).toMatch(/measurement/);
  });
});
