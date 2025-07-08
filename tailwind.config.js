/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './*.js'],
  safelist: [
  {
    pattern: /bg-gradient-to-.*/,
  },
  {
    pattern: /from-.*/,
  },
  {
    pattern: /to-.*/,
  },
  {
    pattern: /via-.*/,
  },
],
  theme: {
    extend: {},
  },
  plugins: [],
}

