import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // v2a Design System
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: "#0F172A",
        coral: {
          DEFAULT: "#FF6B6B",
          dark: "#EF5350",
          light: "#FFE5E5",
        },
        muted: "#F8FAFC",
        border: "#F1F5F9",
      },
      fontFamily: {
        outfit: ["'Outfit'", "sans-serif"],
        "space-mono": ["'Space Mono'", "monospace"],
      },
      boxShadow: {
        coral: "0 10px 25px -5px rgba(255, 107, 107, 0.25)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
