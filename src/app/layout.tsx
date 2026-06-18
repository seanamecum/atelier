import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AtelierProvider } from "@/lib/store/AtelierStore";

export const metadata: Metadata = {
  applicationName: "Mira",
  title: { default: "Mira — Your AI Stylist & Fitting Room", template: "%s · Mira" },
  description:
    "Describe the outfit you want, see it on your own body, and buy the whole look in one place. An AI personal stylist, virtual fitting room and shopping assistant.",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Mira" },
  formatDetection: { telephone: false },
  openGraph: {
    title: "Mira — Your AI Stylist & Fitting Room",
    description: "Describe an outfit, see it on your body, buy the whole look.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F3EE" },
    { media: "(prefers-color-scheme: dark)", color: "#14110E" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:text-paper-50"
        >
          Skip to content
        </a>
        <AtelierProvider>{children}</AtelierProvider>
      </body>
    </html>
  );
}
