/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'desert-gold': '#D4A574',
        'desert-dark': '#2D1810',
        'desert-light': '#F5F0E8',
        'amber-date': '#8B6F47',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
