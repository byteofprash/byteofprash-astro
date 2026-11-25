/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        paper: "var(--paper)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        soft: "var(--soft)",
        gold: "var(--gold)",
        deep: "var(--deep)",
        warm: "var(--warm)",
        sky: "var(--sky)",
        photo: "var(--photo)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: { tile: "var(--radius)" },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            "--tw-prose-body": "var(--ink)",
            "--tw-prose-headings": "var(--ink)",
            "--tw-prose-links": "var(--deep)",
            "--tw-prose-bold": "var(--ink)",
            "--tw-prose-counters": "var(--muted)",
            "--tw-prose-bullets": "var(--muted)",
            "--tw-prose-hr": "var(--soft)",
            "--tw-prose-quotes": "var(--ink)",
            "--tw-prose-quote-borders": "var(--gold)",
            "--tw-prose-captions": "var(--muted)",
            "--tw-prose-code": "var(--deep)",
            "--tw-prose-pre-code": "var(--paper)",
            "--tw-prose-pre-bg": "var(--ink)",
            "--tw-prose-th-borders": "var(--soft)",
            "--tw-prose-td-borders": "var(--soft)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
