/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { 
    extend: {
      colors: {
        primaryC: {
          50: "#F6F4F9",
          100: "#EEEAF3",
          200: "#D4CAE1",
          300: "#B9A9CF",
          400: "#8569AC",
          DEFAULT: "#512988",
          600: "#49257A",
          700: "#311952",
          800: "#24123D",
          900: "#180C29",
        },
        backgroundC: "#FBFBFD",
        surfaceC: "#FFFFFF",
        TextC: "#1D1D1F",
        mutedTextC: "#86868B"
      },
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
