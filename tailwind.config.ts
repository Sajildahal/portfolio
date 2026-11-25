import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        charcoal: "#0E131F",
        bronze: "#2A2415",
        champagne: "#F5E6A8",
        "slate-850": "#172033",
        obsidian: {
          DEFAULT: "#080B11",
          dark: "#05070B",
          card: "#0F1626",
          cardHover: "#162035",
          border: "#1E293B",
          borderLight: "#2E3D56",
        },
        gold: {
          DEFAULT: "#D4AF37",
          champagne: "#F5E6A8",
          dim: "#A88B2A",
          muted: "#66541A",
          glow: "rgba(212, 175, 55, 0.15)",
        },
        nepse: {
          green: "#10B981",
          red: "#EF4444",
          gold: "#D4AF37",
          bronze: "#2A2415",
          obsidian: "#080B11",
          card: "#0F1626",
          cardLight: "#162035",
        },
      },
      boxShadow: {
        gold: "0 0 25px rgba(212, 175, 55, 0.15)",
        "gold-sm": "0 0 10px rgba(212, 175, 55, 0.12)",
        emerald: "0 0 20px rgba(16, 185, 129, 0.25)",
        rose: "0 0 20px rgba(239, 68, 68, 0.25)",
        terminal: "0 8px 30px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
