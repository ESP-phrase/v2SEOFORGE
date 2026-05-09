import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        surface: "#0d0d0d",
        "surface-2": "#161616",
        "surface-3": "#1d1d1d",
        border: "#1f1f1f",
        "border-strong": "#2a2a2a",
        text: "#f1f1f1",
        muted: "#7a7a7a",
        "muted-2": "#5a5a5a",
        accent: "#c4f24e",
        "accent-dim": "rgba(196, 242, 78, 0.10)",
        "accent-border": "rgba(196, 242, 78, 0.25)",
        danger: "#ff5470",
        warning: "#f6c453",
        info: "#6cb6ff",
      },
      fontFamily: {
        sans: ['-apple-system', 'system-ui', '"Segoe UI"', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
