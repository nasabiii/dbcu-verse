/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#121936',
        deep: '#0B1230',
        indigo: '#26365B',
        blush: '#EFC4CE',
        rose: '#B97F8E',
        ivory: '#F5F0E7',
        powder: '#B7D4ED',
        gold: '#E4BF68',
        olive: '#737C5A',
        ink: '#2A2F4A',
      },
      fontFamily: {
        script: ['"Pinyon Script"', 'cursive'],
        hand: ['Caveat', 'cursive'],
        type: ['"Special Elite"', 'monospace'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
