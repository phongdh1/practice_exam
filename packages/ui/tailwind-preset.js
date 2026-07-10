/** Stitch-synced DESIGN.md tokens — project 18250451551830173588 */
import tailwindcssAnimate from "tailwindcss-animate";

const practiceExamPreset = {
  plugins: [tailwindcssAnimate],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          container: "#1B4F72",
          fixed: "#CCE5FF",
          "fixed-dim": "#9DCBF4",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          container: "#D6E2E6",
          fixed: "#D9E5E8",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "#0E7C4A",
          foreground: "#FFFFFF",
          muted: "#E6F4ED",
        },
        error: {
          DEFAULT: "#C0392B",
          foreground: "#FFFFFF",
          muted: "#FDECEA",
        },
        warning: {
          DEFAULT: "#D68910",
          foreground: "#1A1B1F",
          muted: "#FEF5E7",
        },
        surface: {
          DEFAULT: "#F9F9FC",
          subtle: "#F7F9FB",
          elevated: "#FFFFFF",
          dim: "#D9DADD",
          bright: "#F9F9FC",
          container: "#EDEEF1",
          "container-low": "#F3F3F7",
          "container-lowest": "#FFFFFF",
          "container-high": "#E7E8EB",
          "container-highest": "#E2E2E5",
          variant: "#E2E2E5",
        },
        background: "#F9F9FC",
        "on-surface": "#1A1C1E",
        "on-surface-variant": "#41474E",
        "on-primary": "#FFFFFF",
        "on-primary-container": "#92C0E9",
        "on-background": "#1A1C1E",
        "ink-muted": "#5D6D7E",
        "ink-disabled": "#AEB6BF",
        "price-highlight": "#1B4F72",
        "subscription-active": "#0E7C4A",
        "surface-subtle": "#F7F9FB",
        "surface-elevated": "#FFFFFF",
        outline: "#72787F",
        "outline-variant": "#C1C7CF",
        disclaimer: {
          bg: "#FEF9E7",
          border: "#F4D03F",
        },
        "disclaimer-bg": "#FEF9E7",
        "disclaimer-border": "#F4D03F",
      },
      fontFamily: {
        sans: ["var(--font-be-vietnam-pro)", "Be Vietnam Pro", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-be-vietnam-pro)", "Be Vietnam Pro", "sans-serif"],
        heading: ["var(--font-be-vietnam-pro)", "Be Vietnam Pro", "sans-serif"],
        body: ["var(--font-be-vietnam-pro)", "Be Vietnam Pro", "sans-serif"],
        label: ["var(--font-be-vietnam-pro)", "Be Vietnam Pro", "sans-serif"],
        caption: ["var(--font-be-vietnam-pro)", "Be Vietnam Pro", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-lg": ["28px", { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-sm": ["22px", { lineHeight: "1.3", fontWeight: "600" }],
        heading: ["18px", { lineHeight: "1.35", fontWeight: "600" }],
        body: ["16px", { lineHeight: "1.55", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["14px", { lineHeight: "1.4", fontWeight: "500" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
        "question-stem": ["17px", { lineHeight: "1.6", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "var(--radius)",
        xl: "16px",
      },
      spacing: {
        "gutter-mobile": "16px",
        "gutter-tablet": "24px",
        "gutter-desktop": "32px",
        "section-gap": "32px",
        "question-padding": "20px",
      },
      maxWidth: {
        content: "80rem",
      },
    },
  },
};

export default practiceExamPreset;
