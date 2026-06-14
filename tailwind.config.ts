import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        card: "#FFFFFF",
        ink: "#0F172A",
        muted: "#64748B",
        border: "#E2E8F0",
        primary: "#10B981",
        "primary-dark": "#047857",
        accent: "#2563EB",
        highlight: "#F59E0B",
      },
      boxShadow: {
        soft: "0 16px 40px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
