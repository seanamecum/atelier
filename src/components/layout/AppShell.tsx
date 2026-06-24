"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Logo } from "@/components/ui/Logo";
import { useAtelier } from "@/lib/store/AtelierStore";
import { computeAlerts } from "@/lib/data/alerts";
import { cn } from "@/lib/utils/format";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV: NavItem[] = [
  { href: "/home", label: "Home", icon: "🏠" },
  { href: "/stylist", label: "Stylist", icon: "✨" },
  { href: "/try-on", label: "Try-On", icon: "🪞" },
  { href: "/closet", label: "Closet", icon: "🧥" },
  { href: "/saved", label: "Saved", icon: "🔖" },
  { href: "/cart", label: "Cart", icon: "🛍️" },
];

// Bottom bar shows a focused subset (Saved lives in the sidebar / home).
const MOBILE_NAV = NAV.filter((n) => n.href !== "/saved");

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cartCount, profile, watchlist, hydrated } = useAtelier();
  const alertCount = useMemo(
    () => (hydrated ? computeAlerts(watchlist, profile.budget).badgeCount : 0),
    [hydrated, watchlist, profile.budget],
  );

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-paper bg-paper-fade">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/home" aria-label="Mira home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/alerts" className="relative btn-ghost !px-3 !py-1.5" aria-label="Alerts">
              🔔
              {alertCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-clay-400 px-1 text-[10px] font-semibold text-paper-50">
                  {alertCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative btn-ghost !px-3 !py-1.5" aria-label="Cart">
              🛍️
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-clay-400 px-1 text-[10px] font-semibold text-paper-50">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/profile" className="grid h-9 w-9 place-items-center rounded-full bg-ink-900 text-sm font-medium text-paper-50">
              {(profile.name || "Y").charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        {/* Desktop sidebar */}
        <aside className="sticky top-20 hidden h-fit w-44 shrink-0 md:block">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive(item.href)
                    ? "bg-ink-900 text-paper-50"
                    : "text-ink-600 hover:bg-paper-200",
                )}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
                {item.href === "/cart" && cartCount > 0 && (
                  <span className="ml-auto rounded-full bg-clay-400 px-1.5 text-[10px] text-paper-50">
                    {cartCount}
                  </span>
                )}
              </Link>
            ))}
            <Link
              href="/profile"
              className={cn(
                "mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive("/profile") ? "bg-ink-900 text-paper-50" : "text-ink-600 hover:bg-paper-200",
              )}
            >
              <span aria-hidden>👤</span>
              Profile
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 pb-24 outline-none md:pb-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/90 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-6">
          {MOBILE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                isActive(item.href) ? "text-clay-500" : "text-ink-400",
              )}
            >
              <span className="text-lg" aria-hidden>{item.icon}</span>
              {item.label}
              {item.href === "/cart" && cartCount > 0 && (
                <span className="absolute right-3 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-clay-400 px-1 text-[9px] text-paper-50">
                  {cartCount}
                </span>
              )}
            </Link>
          ))}
          <Link
            href="/profile"
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
              isActive("/profile") ? "text-clay-500" : "text-ink-400",
            )}
          >
            <span className="text-lg" aria-hidden>👤</span>
            You
          </Link>
        </div>
      </nav>
    </div>
  );
}
