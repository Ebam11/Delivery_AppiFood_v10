/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        satisfy: ['Satisfy', 'cursive'],
      },
      colors: {
        brand: '#FF4B3E',
        'brand-dark': '#e03a2d',
      },
    },
  },
  plugins: [],
}