/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        black: '#0a0a0a',
        white: '#fafafa',
        primary: '#0a0a0a',
        secondary: '#fafafa',
        accent: '#ffffff',
        muted: '#525252',
        border: '#262626',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
