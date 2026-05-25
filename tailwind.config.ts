import type { Config } from "tailwindcss";

/**
 * Design system Acolhe — Wave 0.
 *
 * Cores funcionais (status) seguem a tabela em
 * `docs/architecture/design-system.md §2`. Os tokens neutros são
 * referenciados como CSS variables (definidos em `src/styles/globals.css`)
 * para suportar light/dark sem trocar classes.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "var(--bg)",
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        text: {
          DEFAULT: "var(--text)",
          2: "var(--text-2)",
          3: "var(--text-3)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          bg: "var(--accent-bg)",
        },
        whatsapp: {
          DEFAULT: "#22C55E",
          strong: "#16A34A",
        },
        status: {
          urgente: {
            DEFAULT: "#E11D48",
            bg: "#FFE4E6",
            dot: "#E11D48",
          },
          aguardando: {
            DEFAULT: "#C2410C",
            bg: "#FFEDD5",
            dot: "#EA580C",
          },
          acompanhamento: {
            DEFAULT: "#1D4ED8",
            bg: "#DBEAFE",
            dot: "#2563EB",
          },
          concluido: {
            DEFAULT: "#15803D",
            bg: "#DCFCE7",
            dot: "#16A34A",
          },
        },
      },
      borderRadius: {
        card: "18px",
        pill: "999px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        primary: "0 6px 16px rgba(45,127,249,0.18)",
        whatsapp: "0 6px 16px rgba(34,197,94,0.18)",
      },
      letterSpacing: {
        tight2: "-0.02em",
        tight3: "-0.025em",
        tight4: "-0.03em",
        tight5: "-0.035em",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
      },
      minHeight: {
        dvh: "100dvh",
      },
      maxWidth: {
        phone: "440px",
      },
      transitionDuration: {
        120: "120ms",
        150: "150ms",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
