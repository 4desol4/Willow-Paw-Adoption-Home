/** @type {import('tailwindcss').Config} */
const channel = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: { xs: "480px", sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" },
    extend: {
      colors: {
        bg: channel("bg"),
        surface: channel("surface"),
        ink: channel("ink"),
        muted: channel("muted"),
        line: channel("line"),
        sun: channel("sun"),
        accent: channel("accent"),
        leaf: channel("leaf"),
        coral: channel("coral"),
        sky: channel("sky"),
        inverse: channel("inverse"),
        "inverse-fg": channel("inverse-fg"),
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": [
          "clamp(3.5rem, 11vw, 10rem)",
          { lineHeight: "0.88", letterSpacing: "-0.045em", fontWeight: "800" },
        ],
        "display-lg": [
          "clamp(2.75rem, 7.5vw, 6.5rem)",
          { lineHeight: "0.92", letterSpacing: "-0.04em", fontWeight: "800" },
        ],
        "display-md": [
          "clamp(2rem, 4.6vw, 3.75rem)",
          { lineHeight: "1", letterSpacing: "-0.035em", fontWeight: "700" },
        ],
        "display-sm": [
          "clamp(1.5rem, 2.6vw, 2.125rem)",
          { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "700" },
        ],
        lead: ["clamp(1.0625rem, 1.5vw, 1.3125rem)", { lineHeight: "1.55" }],
      },
      borderRadius: { field: "0.875rem" },
      transitionTimingFunction: { out: "cubic-bezier(0.22, 1, 0.36, 1)" },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: { shimmer: "shimmer 1.6s infinite" },
    },
  },
  plugins: [],
};
