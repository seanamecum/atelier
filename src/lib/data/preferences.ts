import type { BodyType, FitPreference } from "@/lib/types";

/** Option sets used across onboarding & profile editing. */

export const COLOR_OPTIONS: { value: string; hex: string }[] = [
  { value: "black", hex: "#1A1714" },
  { value: "white", hex: "#F3F0EA" },
  { value: "navy", hex: "#222B3D" },
  { value: "grey", hex: "#8D8F93" },
  { value: "olive", hex: "#5B5A3E" },
  { value: "camel", hex: "#A9824F" },
  { value: "stone", hex: "#C9BFA8" },
  { value: "brown", hex: "#5A3B22" },
  { value: "garnet", hex: "#6E2230" },
  { value: "sage", hex: "#7C8568" },
  { value: "blue", hex: "#5D7793" },
  { value: "cream", hex: "#EDE6D8" },
];

export const STYLE_KEYWORDS = [
  "minimal", "classic", "vintage", "bold", "preppy", "edgy",
  "relaxed", "tailored", "sporty", "elevated", "earthy", "monochrome",
];

export const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: "slim", label: "Slim" },
  { value: "athletic", label: "Athletic" },
  { value: "average", label: "Average" },
  { value: "curvy", label: "Curvy" },
  { value: "plus", label: "Plus" },
  { value: "tall", label: "Tall" },
  { value: "petite", label: "Petite" },
];

export const FIT_PREFERENCES: { value: FitPreference; label: string }[] = [
  { value: "slim", label: "Slim" },
  { value: "tailored", label: "Tailored" },
  { value: "regular", label: "Regular" },
  { value: "relaxed", label: "Relaxed" },
  { value: "oversized", label: "Oversized" },
];

export const TOP_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
export const WAIST_SIZES = ["28", "30", "31", "32", "33", "34", "36", "38"];
export const SHOE_SIZES = ["7", "8", "9", "10", "11", "12", "13"];
export const DRESS_SIZES = ["XS", "S", "M", "L", "XL"];
