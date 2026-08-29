/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Fredoka'", "'Nunito'", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        cream: "#FBF4E7",
        ink: "#2B2320",
      },
      boxShadow: {
        device:
          "0 2px 0 rgba(255,255,255,0.5) inset, 0 -6px 14px rgba(0,0,0,0.18) inset, 0 22px 45px rgba(43,35,32,0.28), 0 6px 12px rgba(43,35,32,0.18)",
        wheel:
          "0 2px 0 rgba(255,255,255,0.6) inset, 0 -4px 10px rgba(0,0,0,0.12) inset, 0 10px 20px rgba(43,35,32,0.18)",
        screen: "inset 0 2px 6px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.08)",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.85) translateY(24px)", opacity: "0" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};
