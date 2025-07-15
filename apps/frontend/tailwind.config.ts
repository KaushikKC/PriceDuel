import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Uncage", "system-ui", "sans-serif"],
        uncage: ["Uncage", "system-ui", "sans-serif"],
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      colors: {
        background: "#FAF9F6",
        foreground: "#4A4A4A",
        primary: "#D72638",
        secondary: "#3EB489",
        accent: "#F4C95D",
        glow: "#F984E5",
        surface: "#FFFFFF",
        border: "#E5E5E5",
        error: "#EF4E4E",
        success: "#CDE4A1",
        "text-secondary": "#6E6E6E",
        cranberry: "#D72638",
        mint: "#3EB489",
        champagne: "#F4C95D",
        "candy-pink": "#F984E5",
        "sky-blue": "#80D0FF",
        soft: "#FAF9F6",
      },
    },
  },
  plugins: [],
};

export default config;
