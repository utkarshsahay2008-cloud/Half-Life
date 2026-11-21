import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        alabaster: "#F8FAFC",
        fresh: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        decay: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
        stale: {
          50: "#FFF1F2",
          100: "#FFE4E6",
          500: "#F43F5E",
          600: "#E11D48",
          700: "#BE123C",
        },
        bifrost: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
        },
        tavily: {
          50: "#F0FDFA",
          100: "#CCFBF1",
          500: "#0D9488",
          600: "#0F766E",
          700: "#115E59",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.04)",
        "glass-hover": "0 12px 40px 0 rgba(0, 0, 0, 0.08)",
        "glow-emerald": "0 0 24px -4px rgba(16, 185, 129, 0.35)",
        "glow-amber": "0 0 24px -4px rgba(245, 158, 11, 0.35)",
        "glow-rose": "0 0 24px -4px rgba(244, 63, 94, 0.35)",
        "glow-blue": "0 0 24px -4px rgba(37, 99, 235, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
