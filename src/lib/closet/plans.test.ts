import { describe, it, expect } from "vitest";
import { buildPackingList, seasonalWardrobe } from "@/lib/closet/plans";
import type { ClosetItem, StyleProfile } from "@/lib/types";

const profile: StyleProfile = {
  name: "T",
  sizes: {},
  budget: 600,
  favoriteBrandIds: [],
  colorPreferences: [],
  colorAvoids: [],
  fitPreference: "regular",
  styleKeywords: [],
  onboarded: true,
};

const closet: ClosetItem[] = [
  { id: "c1", label: "White tee", category: "top", color: { name: "white", hex: "#F3F0EA" } },
  { id: "c2", label: "Jeans", category: "bottom", color: { name: "navy", hex: "#222B3D" } },
];

describe("buildPackingList", () => {
  it("scales essentials to trip length and includes trip looks + tips", () => {
    const plan = buildPackingList(profile, closet, { days: 7, season: "summer", mode: "vacation" });
    const tops = plan.essentials.find((e) => e.category === "top")!;
    expect(tops.needed).toBeGreaterThan(1);
    // We own one top, so there should be suggestions to fill the gap.
    expect(tops.owned.length).toBe(1);
    expect(tops.suggestions.length).toBeGreaterThan(0);
    expect(plan.outfits.length).toBeGreaterThan(0);
    expect(plan.tips.length).toBeGreaterThan(0);
  });
});

describe("seasonalWardrobe", () => {
  it("reports completeness in 0–100 and suggests for gaps", () => {
    const plan = seasonalWardrobe(profile, closet, "summer");
    expect(plan.completeness).toBeGreaterThanOrEqual(0);
    expect(plan.completeness).toBeLessThanOrEqual(100);
    const gapped = plan.slots.find((s) => s.have < s.target);
    expect(gapped?.suggestions.length).toBeGreaterThan(0);
  });
});
