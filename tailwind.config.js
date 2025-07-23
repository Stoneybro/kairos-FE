/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Background Colors
        main: "#19191A",
        secondary:'#2A2A2A',
        buttonDefault: "#FFFFFF",
        buttonSecondary: "#FFFFFF1A",
        buttonSuccess: "#31FF7C",
        buttonExpired: "#FF4E4E",

        cardDefault: "#1C1C1D",
        cardBalance: "#17A34A29",
        cardTask: "#2463EB29",
        cardFund: "#9334E929",

        tagCompleted: "#31FF7C33",
        tagPending: "#1C4ED833",
        tagExpired: "#FF4E4E33",

        input: "#1C1C1D",
        inputInner: "#1A1A1B",

        // Text Colors
        textMain: "#ffffff",
        textSecondary: "#ffffff",
        textCardBalance: "#ACFFCE",
        textCardTask: "#85ACFF",
        textCardFund: "#BB6FFF",
        textTagCompleted: "#31FF7C",
        textTagPending: "#1C4ED8",
        textTagExpired: "#FF4E4E",
        textInput: "#676767",

        // Border Colors
        borderMain: "#2A2A2A",
        borderCardBalance: "#17A34A29",
        borderCardTask: "#2463EB29",
        borderCardFund: "#9334E929",
        borderexpired:'#DB242405'
      },

      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
        inter: ['var(--font-inter-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
