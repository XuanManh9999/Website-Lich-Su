/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Màu chính - Xanh dương đậm sang trọng
        'primary': {
          DEFAULT: '#0F4C81',
          'light': '#1E88E5',
          'dark': '#0A3A5F',
          '50': '#E3F2FD',
          '100': '#BBDEFB',
          '200': '#90CAF9',
          '300': '#64B5F6',
          '400': '#42A5F5',
          '500': '#0F4C81',
          '600': '#0A3A5F',
          '700': '#062947',
        },
        // Màu phụ - Vàng cam ấm áp
        'accent': {
          DEFAULT: '#FF9800',
          'light': '#FFB74D',
          'dark': '#F57C00',
        },
        // Giữ lại history-red cho backward compatibility
        'history-red': {
          DEFAULT: '#0F4C81',
          'light': '#1E88E5',
          'dark': '#0A3A5F',
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
