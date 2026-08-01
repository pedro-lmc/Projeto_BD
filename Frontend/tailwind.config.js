/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0F172A',
          blue: '#1E3A8A',
          teal: '#0D9488',
          bg: '#F8FAFC'
        }
      }
    }
  },
  plugins: [],
}