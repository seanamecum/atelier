import { describe, it, expect } from "vitest";
import { computeStyleDNA } from "@/lib/personalization/styleDNA";
import type { StyleProfile } from "@/lib/types";

const empty: StyleProfile = {
  name: "",
  sizes: {},
  budget: 400,
  favoriteBrandIds: [],
  colorPreferences: [],
  colorAvoids: [],
  fitPreference: "regular",
  styleKeywords: [],
  onboarded: false,
};

describe("computeStyleDNA", () => {
  it("scores a bare profile low and 'Emerging'", () => {
    const dna = computeStyleDNA(empty, [], { lines: [] });
    expect(dna.score).toBeGreaterThanOrEqual(0);
    expect(dna.score).toBeLessThan(40);
    expect(dna.tier).toBe("Emerging");
  });

  it("rewards a richer profile with a higher score", () => {
    const rich: StyleProfile = {
      ...empty,
      name: "Sean",
      bodyType: "athletic",
      heightCm: 180,
      weightKg: 78,
      sizes: { top: "M", bottomWaist: "32", shoe: "10", dress: "M", outerwear: "M" },
      favoriteBrandIds: ["everlane", "uniqlo", "cos"],
      colorPreferences: ["navy", "cream", "stone"],
      styleKeywords: ["minimal", "tailored", "classic"],
      bodyPhoto: "data:image/jpeg;base64,xxx",
    };
    const dna = computeStyleDNA(rich, [], { lines: [] });
    expect(dna.score).toBeGreaterThan(computeStyleDNA(empty, [], { lines: [] }).score);
    expect(dna.traits.length).toBeGreaterThan(0);
    expect(dna.palette.length).toBeGreaterThan(0);
  });

  it("never exceeds a score of 100", () => {
    const maxed: StyleProfile = {
      ...empty,
      name: "Max",
      bodyType: "athletic",
      heightCm: 180,
      weightKg: 78,
      sizes: { top: "M", bottomWaist: "32", shoe: "10", dress: "M", outerwear: "M" },
      favoriteBrandIds: ["a", "b", "c", "d", "e", "f"],
      colorPreferences: ["navy", "cream", "stone", "black", "white", "olive"],
      styleKeywords: ["minimal", "tailored", "classic", "vintage", "bold", "preppy"],
      bodyPhoto: "x",
    };
    expect(computeStyleDNA(maxed, [], { lines: [] }).score).toBeLessThanOrEqual(100);
  });
});
