/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8d5a3',
          dark: '#9a7a2e',
        },
        navy: {
          DEFAULT: '#1a2e4a',
          light: '#2a4a72',
          dark: '#0d1c2e',
        },
        sand: {
          DEFAULT: '#f5ede0',
          dark: '#e8d8c0',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
};
