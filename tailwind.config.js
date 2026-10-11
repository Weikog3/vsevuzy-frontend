/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#005b96', // фирменный синий оттенок из макета
          dark: '#0e3b5e',
          light: '#f4f8fb',
        }
      }
    },
  },
  plugins: [],
}