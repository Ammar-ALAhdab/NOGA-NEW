/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3457D5",
        orangGold: "#D9A322",
        lavender: "#7049A3",
        halloweenOrange: "#E76D3B",
        topaz: "#2DBDA8",
        BlueBell: "#9290C3",
      },
      backgroundImage: {},
    },
    screens: {
      xs: "420px",
      sm: "640px",
      md: "800px",
      lg: "920px",
      xlg: "1024px",
      "2xl": "1280px",
      "3xl": "1536px",
    },
  },
  plugins: [],
};
