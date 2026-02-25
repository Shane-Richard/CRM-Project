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
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#b2f40e', // Lime Green
        background: '#ffffff', // Pure White
        surface: '#f9fafb', // Light Gray
        text: '#1a1a1a', // Deep Black
      },
    },
  },
  plugins: [],
}
