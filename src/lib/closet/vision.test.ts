import { describe, it, expect } from "vitest";
import { nearestNamed, suggestCategoryFromAspect } from "@/lib/closet/vision";

describe("nearestNamed", () => {
  it("maps primaries to the expected named swatch", () => {
    expect(nearestNamed(0, 0, 0)).toBe("black");
    expect(nearestNamed(245, 242, 235)).toBe("white");
    expect(nearestNamed(34, 43, 61)).toBe("navy"); // #222B3D
    expect(nearestNamed(110, 34, 48)).toBe("garnet"); // #6E2230
  });
});

describe("suggestCategoryFromAspect", () => {
  it("guesses shoes for wide images and dress for very tall ones", () => {
    expect(suggestCategoryFromAspect(300, 150)).toBe("shoes");
    expect(suggestCategoryFromAspect(200, 400)).toBe("dress");
    expect(suggestCategoryFromAspect(300, 300)).toBe("top");
  });
});
