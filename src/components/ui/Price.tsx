import { money, cn } from "@/lib/utils/format";

export function Price({
  value,
  msrp,
  className,
  size = "md",
}: {
  value: number;
  msrp?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-2xl font-display" };
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn(sizes[size], "tabular-nums text-ink-900")}>{money(value)}</span>
      {msrp && msrp > value && (
        <>
          <span className="text-xs tabular-nums text-ink-300 line-through">{money(msrp)}</span>
          <span className="rounded-full bg-clay-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-clay-500">
            Sale
          </span>
        </>
      )}
    </span>
  );
}
