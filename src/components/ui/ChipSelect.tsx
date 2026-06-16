"use client";

import { cn } from "@/lib/utils/format";

interface Option {
  value: string;
  label: string;
}

/** Multi- or single-select chip group. */
export function ChipSelect({
  options,
  selected,
  onToggle,
  className,
}: {
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onToggle(o.value)}
          className={cn("chip", selected.includes(o.value) && "chip-active")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
