/** @type {import('tailwindcss').Config} */
// Token warna & tipografi diambil dari design system "PasarDigital" (pasardigital.md)
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F7F9FB",
        surface: "#F7F9FB",
        "surface-dim": "#D8DADC",
        "surface-bright": "#F7F9FB",
        "surface-lowest": "#FFFFFF",
        "surface-low": "#F2F4F6",
        "surface-container": "#ECEEF0",
        "surface-high": "#E6E8EA",
        "surface-highest": "#E0E3E5",
        ink: "#191C1E",              // on-surface
        "ink-muted": "#444653",       // on-surface-variant
        "inverse-surface": "#2D3133",
        "inverse-ink": "#EFF1F3",
        outline: "#757684",
        "outline-variant": "#C4C5D5",
        primary: "#00288E",
        "primary-container": "#1E40AF",
        "on-primary-container": "#A8B8FF",
        "primary-hover": "#173BAB",
        secondary: "#006C49",         // dipakai untuk status "Lunas"
        "secondary-container": "#6CF8BB",
        "on-secondary-container": "#00714D",
        tertiary: "#4C2E00",          // dipakai untuk status "Menunggu Pembayaran"
        "tertiary-container": "#6B4200",
        "on-tertiary-container": "#FFA929",
        danger: "#BA1A1A",
        "danger-container": "#FFDAD6",
        "on-danger-container": "#93000A",
        star: "#F59E0B",
      },
      fontFamily: {
        sans: ["'Inter'", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg-mobile": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "16px", letterSpacing: "0.01em", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "14px", fontWeight: "500" }],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        full: "9999px",
      },
      spacing: {
        "margin-desktop": "40px",
        "margin-mobile": "16px",
        gutter: "24px",
        "stack-xs": "4px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "32px",
        "container-max": "1280px",
      },
      boxShadow: {
        card: "0 4px 20px rgba(15, 23, 42, 0.05)",
        "card-hover": "0 10px 25px rgba(15, 23, 42, 0.1)",
      },
    },
  },
  plugins: [],
};
