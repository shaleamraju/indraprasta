/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hotel: {
          primary: '#0ea5e9', // Sky Blue
          secondary: '#0c4a6e', // Deep Sky Blue
          accent: '#ef4444', // Soft Red
          background: '#f0f9ff', // Light Sky Blue Tint
          surface: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}
