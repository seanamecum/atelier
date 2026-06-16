import { cn } from "@/lib/utils/format";

export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
        <rect width="32" height="32" rx="8" className="fill-ink-900" />
        <path d="M9 22 L16 9 L23 22 M12 18 H20" stroke="#F6F3EE" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!mark && (
        <span className="font-display text-xl tracking-tight text-ink-900">Atelier</span>
      )}
    </span>
  );
}
