import { cn } from "@/lib/utils/format";

export function Stars({
  rating,
  count,
  className,
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  const pct = (rating / 5) * 100;
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="relative inline-block text-sm leading-none" aria-label={`${rating} out of 5`}>
        <span className="text-line">★★★★★</span>
        <span
          className="absolute left-0 top-0 overflow-hidden text-clay-400"
          style={{ width: `${pct}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className="text-xs tabular-nums text-ink-400">
        {rating.toFixed(1)}
        {count != null && ` (${count.toLocaleString()})`}
      </span>
    </span>
  );
}
