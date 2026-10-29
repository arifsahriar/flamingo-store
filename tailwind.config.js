/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        flamingo: {
          DEFAULT: "var(--flamingo-vivid)",
          deep: "var(--flamingo-primary)",
          rose: "var(--flamingo-rose)",
          blush: "var(--flamingo-blush)",
          cream: "var(--flamingo-cream)",
        },
        silver: {
          DEFAULT: "var(--silver-bright)",
          slate: "var(--silver-slate)",
        },
      },
    },
  },
  plugins: [],
};
