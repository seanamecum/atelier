import { describe, it, expect } from "vitest";
import { parseRequest, generateOutfit, pieceAlternatives } from "@/lib/ai/stylist";
import { getProduct } from "@/lib/data/catalog";
import type { StyleProfile } from "@/lib/types";

const baseProfile: StyleProfile = {
  name: "Test",
  sizes: { top: "M", bottomWaist: "32", shoe: "10" },
  budget: 600,
  favoriteBrandIds: [],
  colorPreferences: [],
  colorAvoids: [],
  fitPreference: "regular",
  styleKeywords: [],
  onboarded: true,
};

describe("parseRequest", () => {
  it("extracts a budget when a money cue is present", () => {
    expect(parseRequest("clean summer outfit under $200").budget).toBe(200);
  });

  it("does not treat a bare number as a budget", () => {
    // "2 shirts" has a number but no money cue.
    expect(parseRequest("2 nice shirts").budget).toBeUndefined();
  });

  it("infers mode from the prompt", () => {
    expect(parseRequest("a streetwear fit for campus").mode).toBe("streetwear");
    expect(parseRequest("business casual look for dinner").mode).toBe("business-casual");
  });

  it("detects style intents", () => {
    expect(parseRequest("dress me like an investment banker").intents.map((i) => i.id)).toContain(
      "investment-banker",
    );
    expect(parseRequest("old money summer style").intents.map((i) => i.id)).toContain("old-money");
  });

  it("picks up color hints", () => {
    expect(parseRequest("navy and cream outfit").colorHints).toEqual(
      expect.arrayContaining(["navy", "cream"]),
    );
  });
});

describe("generateOutfit", () => {
  it("returns a multi-piece outfit with a positive total", () => {
    const { outfit } = generateOutfit(baseProfile, { prompt: "everyday outfit" });
    expect(outfit.pieces.length).toBeGreaterThanOrEqual(3);
    expect(outfit.total).toBeGreaterThan(0);
  });

  it("respects an explicit budget for catalog pieces", () => {
    const { outfit, overBudget } = generateOutfit(baseProfile, {
      prompt: "a complete everyday outfit under $250",
    });
    // Either it fits the budget, or the engine flags it as the cheapest possible.
    expect(outfit.total <= 250 || overBudget).toBe(true);
  });

  it("attaches intent-driven style notes for banker requests", () => {
    const { outfit } = generateOutfit(baseProfile, { prompt: "dress me like an investment banker" });
    expect(outfit.intents).toContain("Investment banker");
    expect(outfit.styleNotes?.join(" ").toLowerCase()).toMatch(/blazer|boardroom|loafer/);
  });

  it("only recommends in-stock sizes", () => {
    const { outfit } = generateOutfit(baseProfile, { prompt: "everyday outfit" });
    for (const piece of outfit.pieces) {
      const product = getProduct(piece.productId);
      if (!product) continue;
      const variant = product.variants.find((v) => v.size === piece.recommendedSize);
      expect(variant?.inventory ?? 0).toBeGreaterThan(0);
    }
  });
});

describe("pieceAlternatives", () => {
  it("returns a cheaper and/or pricier same-category option", () => {
    const product = getProduct("p-chino-stone")!;
    const alts = pieceAlternatives(product, "business-casual");
    if (alts.cheaper) expect(alts.cheaper.price).toBeLessThan(product.price);
    if (alts.upgrade) expect(alts.upgrade.price).toBeGreaterThan(product.price);
    expect(alts.cheaper || alts.upgrade).toBeTruthy();
  });
});
