import Link from "next/link";

/** Reusable empty / error / loading building blocks for consistent states. */

export function EmptyState({
  icon = "✨",
  title,
  body,
  cta,
}: {
  icon?: string;
  title: string;
  body?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="card grid place-items-center gap-2 p-12 text-center">
      <div aria-hidden className="text-4xl">{icon}</div>
      <p className="font-display text-xl text-ink-900">{title}</p>
      {body && <p className="max-w-sm text-sm text-ink-400">{body}</p>}
      {cta && <Link href={cta.href} className="btn-accent mt-1">{cta.label}</Link>}
    </div>
  );
}

export function ErrorState({
  title = "Something went sideways",
  body = "We hit a snag rendering this. Try again — your data is safe.",
  onRetry,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card grid place-items-center gap-3 p-12 text-center">
      <div aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-clay-50 text-2xl">⚠️</div>
      <p className="font-display text-xl text-ink-900">{title}</p>
      <p className="max-w-sm text-sm text-ink-400">{body}</p>
      <div className="mt-1 flex gap-2">
        {onRetry && <button className="btn-accent" onClick={onRetry}>Try again</button>}
        <Link href="/home" className="btn-ghost">Go home</Link>
      </div>
    </div>
  );
}

/** Card-grid skeleton used for product/outfit loading. */
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="shimmer aspect-[4/5]" />
          <div className="space-y-2 p-3.5">
            <div className="shimmer h-3 w-1/2 rounded" />
            <div className="shimmer h-3 w-3/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
