import type { MetadataRoute } from "next";

/** PWA manifest — makes Mira installable to the home screen (web → "App Store" path). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mira — AI Stylist & Fitting Room",
    short_name: "Mira",
    description:
      "Describe an outfit, see it on your body, and buy the whole look. Your AI personal stylist & virtual fitting room.",
    start_url: "/home",
    display: "standalone",
    background_color: "#F6F3EE",
    theme_color: "#14110E",
    orientation: "portrait",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
