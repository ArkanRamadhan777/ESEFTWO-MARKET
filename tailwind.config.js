/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#DA291C',
        accent: '#FFB800',
        'primary-dark': '#B5200F',
        'accent-dark': '#E6A500',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Contrail One', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
