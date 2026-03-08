import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Medical Blue" premium
        blue: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fe',
          300: '#7cc7fd',
          400: '#36a8fa',
          500: '#0c8bed',
          600: '#006ccf',
          700: '#0055a6',
          800: '#05498a',
          900: '#0a3d74',
          950: '#07274f',
        },
      },
      fontFamily: {
        // Par défaut sur Inter/Outfit si on l'intègre via next/font
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), // Obligatoire pour de jolis inputs SaaS
  ],
};
export default config;
