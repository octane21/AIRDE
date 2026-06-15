/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // Sidebar selalu tampil di atas 1030px; hamburger di bawahnya
        'sidebar': '1030px',
      },
      colors: {
        navy: {
          900: '#070e1a',
          800: '#0a1628',
          700: '#0d1f3c',
          600: '#111d35',
          500: '#162040',
          400: '#1e2d4f',
        },
        airde: {
          orange: '#f97316',
          amber: '#fb923c',
        }
      },
    },
  },
  plugins: [],
}
