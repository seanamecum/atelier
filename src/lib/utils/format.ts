/** Small presentation helpers shared across the UI. */

export function money(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** Tailwind-friendly className combiner. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const MODE_LABELS: Record<string, string> = {
  streetwear: "Streetwear",
  college: "College",
  "date-night": "Date Night",
  gym: "Gym",
  vacation: "Vacation",
  "business-casual": "Business Casual",
  formal: "Formal",
  wedding: "Wedding",
  interview: "Interview",
  everyday: "Everyday",
};

export function modeLabel(mode: string): string {
  return MODE_LABELS[mode] ?? mode;
}

export function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Deterministic id generator (no external dep). */
export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
