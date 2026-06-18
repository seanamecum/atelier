"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/States";

/** Route-segment error boundary for the app. Keeps a crash from whiting-out. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[route-error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <ErrorState onRetry={reset} />
    </div>
  );
}
