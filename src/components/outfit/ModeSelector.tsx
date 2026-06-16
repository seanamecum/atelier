"use client";

import type { OutfitMode } from "@/lib/types";
import { modeLabel, cn } from "@/lib/utils/format";

export const ALL_MODES: OutfitMode[] = [
  "everyday",
  "streetwear",
  "business-casual",
  "date-night",
  "gym",
  "college",
  "vacation",
  "formal",
  "wedding",
  "interview",
];

const EMOJI: Record<OutfitMode, string> = {
  everyday: "☀️",
  streetwear: "🧢",
  "business-casual": "💼",
  "date-night": "🍷",
  gym: "🏋️",
  college: "🎒",
  vacation: "🏝️",
  formal: "🎩",
  wedding: "💍",
  interview: "🤝",
};

export function ModeSelector({
  value,
  onChange,
  className,
}: {
  value: OutfitMode;
  onChange: (m: OutfitMode) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1 no-scrollbar", className)}>
      {ALL_MODES.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn("chip shrink-0", value === m && "chip-active")}
        >
          <span aria-hidden>{EMOJI[m]}</span>
          {modeLabel(m)}
        </button>
      ))}
    </div>
  );
}
