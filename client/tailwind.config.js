/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'history-red': {
          DEFAULT: '#8B0000',
          'light': '#A52A2A',
          'dark': '#6B0000',
          '50': '#fff5f5',
          '100': '#ffe5e5',
          '200': '#ffcccc',
          '300': '#ff9999',
          '400': '#ff6666',
          '500': '#8B0000',
          '600': '#6B0000',
          '700': '#4B0000',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
