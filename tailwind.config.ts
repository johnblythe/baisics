import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Safelist dynamic classes used in milestones (can't be detected at build time)
  safelist: [
    // Milestone gradients (from milestones.ts)
    'from-amber-400', 'to-amber-600',
    'from-orange-400', 'to-orange-600',
    'from-yellow-400', 'to-yellow-600',
    'from-emerald-400', 'to-emerald-600',
    'from-blue-400', 'to-blue-600',
    'from-violet-400', 'to-violet-600',
    'from-indigo-400', 'to-indigo-600',
    'from-rose-400', 'to-rose-600',
    'from-[#FF6B6B]', 'to-[#0F172A]',
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
