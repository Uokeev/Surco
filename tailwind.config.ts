import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f2f7f3",
          100: "#e0efe3",
          200: "#c1dfc7",
          300: "#93c69f",
          400: "#5fa771",
          500: "#358048",
          600: "#2d6f42",
          700: "#255836",
          800: "#1e3d2b",
          900: "#1a3324",
          950: "#0e1d14",
        },
        warm: {
          50: "#fdf0e6",
          100: "#f9dcc7",
          200: "#f3b68a",
          300: "#ec8c4d",
          400: "#e56f26",
          500: "#d45517",
          600: "#b85c1a",
          700: "#854113",
          800: "#6b3617",
          900: "#582e16",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        app: "430px",
      },
    },
  },
  plugins: [],
};

export default config;
