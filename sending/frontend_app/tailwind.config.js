/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
      },
      animation: {
        'shimmer': 'shimmer 4s linear infinite',
        'float': 'float 10s ease-in-out infinite',
        'scroll': 'scroll 40s linear infinite',
      },
    },
  },
  plugins: [],
}
