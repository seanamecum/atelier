import type { Config } from "tailwindcss";

/**
 * Atelier design system.
 * Editorial, premium, gallery-quiet: warm paper, deep ink, a single clay accent.
 * Fonts are pure CSS stacks (no network fetch) so the app builds & runs offline.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Editorial serif for display / headlines
        display: ["Georgia", "Cambria", "Times New Roman", "ui-serif", "serif"],
        // Clean grotesque for UI / body
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        // Warm paper backgrounds
        paper: {
          DEFAULT: "#F6F3EE",
          50: "#FBFAF7",
          100: "#F6F3EE",
          200: "#EFEAE1",
          300: "#E3DDD2",
          400: "#D6CEBF",
        },
        // Warm near-black ink (text + dark surfaces)
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
        // Clay — the single accent (sale tags, CTAs, focus)
        clay: {
          50: "#FBEFE9",
          100: "#F3D7C9",
          200: "#E4AE94",
          300: "#D08763",
          400: "#B25C3B",
          500: "#9C4A2C",
          600: "#7E3A22",
        },
        // Sage — quiet secondary / success
        sage: {
          100: "#E7EAE1",
          300: "#B4BBA6",
          500: "#7C8568",
          700: "#525B41",
        },
        line: "#E3DDD2",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,23,20,0.04), 0 8px 24px rgba(26,23,20,0.06)",
        lift: "0 12px 40px rgba(26,23,20,0.12)",
        ring: "inset 0 0 0 1px rgba(26,23,20,0.08)",
      },
      backgroundImage: {
        "paper-fade": "radial-gradient(ellipse at top, rgba(178,92,59,0.05), transparent 55%)",
      },
      animation: {
        rise: "rise 0.5s cubic-bezier(0.16,1,0.3,1)",
        "fade-in": "fade-in 0.4s ease-out",
        shimmer: "shimmer 1.4s linear infinite",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
