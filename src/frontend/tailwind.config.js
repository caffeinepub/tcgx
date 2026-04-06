import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Satoshi", "system-ui", "sans-serif"],
        display: ["Bricolage Grotesque", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        teal: {
          DEFAULT: "oklch(var(--teal))",
          light: "oklch(var(--teal-light))",
          dark: "oklch(var(--teal-dark))",
        },
        champagne: {
          DEFAULT: "oklch(var(--champagne))",
          light: "oklch(var(--champagne-light))",
          dark: "oklch(var(--champagne-dark))",
        },
        green: {
          DEFAULT: "oklch(var(--teal))",
          light: "oklch(var(--teal-light))",
          dark: "oklch(var(--teal-dark))",
        },
        gold: {
          DEFAULT: "oklch(var(--champagne))",
          light: "oklch(var(--champagne-light))",
          dark: "oklch(var(--champagne-dark))",
        },
        chart: {
          1: "oklch(var(--chart-1))",
          2: "oklch(var(--chart-2))",
          3: "oklch(var(--chart-3))",
          4: "oklch(var(--chart-4))",
          5: "oklch(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))",
          primary: "oklch(var(--sidebar-primary))",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground))",
          accent: "oklch(var(--sidebar-accent))",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground))",
          border: "oklch(var(--sidebar-border))",
          ring: "oklch(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 3px 0 oklch(0.10 0.008 30 / 0.08)",
        card: "0 1px 4px 0 oklch(0.10 0.008 30 / 0.06), 0 2px 8px 0 oklch(0.10 0.008 30 / 0.04)",
        "card-hover": "0 8px 32px -4px oklch(0.10 0.008 30 / 0.12), 0 2px 8px 0 oklch(0.10 0.008 30 / 0.06)",
        "teal-sm": "0 0 0 1px oklch(0.38 0.125 168 / 0.25), 0 2px 8px oklch(0.38 0.125 168 / 0.12)",
        "teal-md": "0 0 30px oklch(0.38 0.125 168 / 0.12), 0 0 60px oklch(0.38 0.125 168 / 0.06)",
        "champagne-sm": "0 0 0 1px oklch(0.78 0.065 88 / 0.35), 0 2px 8px oklch(0.78 0.065 88 / 0.15)",
        "gold-sm": "0 0 0 1px oklch(0.78 0.065 88 / 0.35), 0 2px 8px oklch(0.78 0.065 88 / 0.15)",
        "gold-md": "0 0 30px oklch(0.78 0.065 88 / 0.12), 0 0 60px oklch(0.78 0.065 88 / 0.06)",
        "green-sm": "0 0 0 1px oklch(0.38 0.125 168 / 0.25), 0 2px 8px oklch(0.38 0.125 168 / 0.12)",
        "green-md": "0 0 30px oklch(0.38 0.125 168 / 0.12), 0 0 60px oklch(0.38 0.125 168 / 0.06)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "card-reveal": {
          from: { opacity: "0", transform: "translateY(40px) scale(0.85) rotateX(20deg)" },
          to: { opacity: "1", transform: "translateY(0) scale(1) rotateX(0deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "card-reveal": "card-reveal 0.6s cubic-bezier(0.2, 0, 0, 1) forwards",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
