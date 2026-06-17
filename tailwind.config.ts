import type { Config } from "tailwindcss";

/**
 * Atelier design system v2 — "Studio".
 *
 * Editorial warmth (paper + ink + clay) for the light surfaces, plus a cinematic
 * dark "studio" palette for hero / try-on / feature moments. A champagne accent
 * adds the venture-backed luxe sheen. Fonts are pure CSS stacks (offline-safe).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Georgia", "Cambria", "Times New Roman", "ui-serif", "serif"],
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        paper: {
          DEFAULT: "#F6F3EE",
          50: "#FBFAF7",
          100: "#F6F3EE",
          200: "#EFEAE1",
          300: "#E3DDD2",
          400: "#D6CEBF",
        },
        ink: {
          DEFAULT: "#1A1714",
          900: "#1A1714",
          800: "#26221D",
          700: "#332E27",
          600: "#4A4339",
          500: "#6B6155",
          400: "#8C8478",
          300: "#ADA597",
        },
        clay: {
          50: "#FBEFE9",
          100: "#F3D7C9",
          200: "#E4AE94",
          300: "#D08763",
          400: "#B25C3B",
          500: "#9C4A2C",
          600: "#7E3A22",
        },
        sage: {
          100: "#E7EAE1",
          300: "#B4BBA6",
          500: "#7C8568",
          700: "#525B41",
        },
        // Cinematic dark "studio" surfaces (hero, try-on, premium)
        studio: {
          DEFAULT: "#14110E",
          950: "#0C0A08",
          900: "#14110E",
          850: "#1A1612",
          800: "#221D17",
          700: "#2E281F",
          600: "#3D352A",
        },
        // Champagne — premium metallic accent
        champagne: {
          100: "#F7ECD6",
          200: "#EAD3A6",
          300: "#DCBA78",
          400: "#C9A15A",
          500: "#B0863F",
        },
        line: "#E3DDD2",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,23,20,0.04), 0 8px 24px rgba(26,23,20,0.06)",
        lift: "0 12px 40px rgba(26,23,20,0.12)",
        float: "0 24px 70px -20px rgba(26,23,20,0.35)",
        ring: "inset 0 0 0 1px rgba(26,23,20,0.08)",
        glow: "0 0 0 1px rgba(201,161,90,0.4), 0 8px 40px -8px rgba(201,161,90,0.45)",
        "studio-card": "0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -24px rgba(0,0,0,0.7)",
      },
      backgroundImage: {
        "paper-fade": "radial-gradient(ellipse at top, rgba(178,92,59,0.05), transparent 55%)",
        "studio-spot": "radial-gradient(120% 80% at 50% -10%, rgba(201,161,90,0.18), transparent 55%), radial-gradient(80% 60% at 80% 110%, rgba(178,92,59,0.16), transparent 60%)",
        "champagne-gradient": "linear-gradient(135deg, #DCBA78 0%, #F7ECD6 45%, #C9A15A 100%)",
        "clay-gradient": "linear-gradient(135deg, #B25C3B 0%, #D08763 100%)",
        "sheen": "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.5) 48%, transparent 60%)",
        "weave": "repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0 1px, transparent 1px 3px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.03) 0 1px, transparent 1px 3px)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        rise: "rise 0.5s cubic-bezier(0.16,1,0.3,1)",
        "rise-slow": "rise 0.8s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.4s ease-out",
        shimmer: "shimmer 1.4s linear infinite",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin 14s linear infinite",
        sheen: "sheen 2.4s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2.6s ease-in-out infinite",
        "scale-in": "scale-in 0.4s cubic-bezier(0.16,1,0.3,1)",
        marquee: "marquee 36s linear infinite",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        sheen: {
          "0%": { transform: "translateX(-120%)" },
          "60%, 100%": { transform: "translateX(220%)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
