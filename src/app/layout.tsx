import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AtelierProvider } from "@/lib/store/AtelierStore";

export const metadata: Metadata = {
  title: "Atelier — Your AI Stylist & Fitting Room",
  description:
    "Describe the outfit you want, see it on your own body, and buy the whole look in one place. An AI personal stylist, virtual fitting room and shopping assistant.",
};

export const viewport: Viewport = {
  themeColor: "#F6F3EE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AtelierProvider>{children}</AtelierProvider>
      </body>
    </html>
  );
}
