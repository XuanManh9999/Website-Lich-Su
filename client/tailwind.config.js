/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Màu chính - Đỏ đậm sang trọng
        'primary': {
          DEFAULT: '#8F1A1E',
          'light': '#B83236',
          'dark': '#6B1316',
          '50': '#FEE2E2',
          '100': '#FECACA',
          '200': '#FCA5A5',
          '300': '#F87171',
          '400': '#EF4444',
          '500': '#8F1A1E',
          '600': '#6B1316',
          '700': '#4A0D0F',
        },
        // Màu phụ - Vàng cam ấm áp
        'accent': {
          DEFAULT: '#FF9800',
          'light': '#FFB74D',
          'dark': '#F57C00',
        },
        // Giữ lại history-red cho backward compatibility
        'history-red': {
          DEFAULT: '#8F1A1E',
          'light': '#B83236',
          'dark': '#6B1316',
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
