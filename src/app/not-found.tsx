import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper bg-paper-fade px-4 text-center">
      <div>
        <Logo className="mx-auto mb-6" />
        <p className="eyebrow mb-2">404</p>
        <h1 className="font-display text-4xl text-ink-900">This look doesn't exist</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-400">
          The page you're after isn't here. Let's get you back to styling.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/home" className="btn-accent">Go home</Link>
          <Link href="/stylist" className="btn-ghost">Style an outfit</Link>
        </div>
      </div>
    </div>
  );
}
