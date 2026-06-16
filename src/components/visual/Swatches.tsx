import { cn } from "@/lib/utils/format";

export function Swatches({
  colors,
  className,
  size = 18,
}: {
  colors: string[];
  className?: string;
  size?: number;
}) {
  return (
    <span className={cn("inline-flex items-center -space-x-1.5", className)}>
      {colors.slice(0, 6).map((c, i) => (
        <span
          key={i}
          className="inline-block rounded-full ring-2 ring-paper-50"
          style={{ width: size, height: size, backgroundColor: c }}
          title={c}
        />
      ))}
    </span>
  );
}
