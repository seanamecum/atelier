import { describe, it, expect } from "vitest";
import { money, cn, modeLabel, titleCase, uid } from "@/lib/utils/format";

describe("money", () => {
  it("formats whole dollars without cents and fractional with cents", () => {
    expect(money(30)).toBe("$30");
    expect(money(12.5)).toBe("$12.50");
    expect(money(0)).toBe("$0");
    expect(money(1299)).toBe("$1,299");
  });
});

describe("cn", () => {
  it("joins truthy class names and drops falsy ones", () => {
    expect(cn("a", false, "b", null, undefined, "c")).toBe("a b c");
  });
});

describe("modeLabel", () => {
  it("maps known modes to human labels and passes through unknowns", () => {
    expect(modeLabel("business-casual")).toBe("Business Casual");
    expect(modeLabel("date-night")).toBe("Date Night");
    expect(modeLabel("everyday")).toBe("Everyday");
    expect(modeLabel("mystery")).toBe("mystery");
  });
});

describe("titleCase", () => {
  it("capitalizes each word", () => {
    expect(titleCase("old money style")).toBe("Old Money Style");
  });
});

describe("uid", () => {
  it("produces unique prefixed ids", () => {
    const a = uid("outfit");
    const b = uid("outfit");
    expect(a.startsWith("outfit-")).toBe(true);
    expect(a).not.toBe(b);
  });
});
