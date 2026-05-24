import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FAF7F2",
          50: "#FDFBF7",
          100: "#FAF7F2",
          200: "#F2EEE5",
          300: "#E8E1D2",
          400: "#D8CDB6",
        },
        ink: {
          DEFAULT: "#1A1814",
          900: "#1A1814",
          700: "#3A352E",
          500: "#6B6356",
          300: "#9B9285",
          200: "#BCB4A6",
        },
        accent: {
          DEFAULT: "#8C4A2B", // warm terracotta — placeholder, refine in design phase
          soft: "#B86A47",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightish: "-0.015em",
      },
      transitionTimingFunction: {
        quiet: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
