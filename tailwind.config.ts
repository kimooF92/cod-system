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
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          subtle: "var(--surface-subtle)",
        },
        border: "var(--border)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
        profit: {
          DEFAULT: "#10B981",
          emerald: "#10B981",
          subtle: "rgba(16, 185, 129, 0.12)",
        },
        hold: {
          DEFAULT: "#F59E0B",
          amber: "#F59E0B",
          subtle: "rgba(245, 158, 11, 0.12)",
        },
        kill: {
          DEFAULT: "#EF4444",
          crimson: "#EF4444",
          subtle: "rgba(239, 68, 68, 0.12)",
        },
        testing: {
          DEFAULT: "#3B82F6",
          blue: "#3B82F6",
          subtle: "rgba(59, 130, 246, 0.12)",
        },
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        full: "9999px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SF Mono", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
