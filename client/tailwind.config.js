/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Màu chính - Đỏ trầm (#8F1A1E) theo yêu cầu mới
        'primary': {
          DEFAULT: '#8F1A1E', // Đỏ chủ đạo
          'light': '#B83236',
          'dark': '#5C0F12',
          '50': '#FFF4F4',
          '100': '#FCE5E5',
          '200': '#F7BDBF',
          '300': '#F09295',
          '400': '#DF5D63',
          '500': '#B83236',
          '600': '#8F1A1E',
          '700': '#5C0F12',
        },
        // Màu phụ - Đỏ sáng làm điểm nhấn (đồng bộ với màu chủ đạo)
        'accent': {
          DEFAULT: '#B83236',
          'light': '#DF5D63',
          'dark': '#5C0F12',
        },
        // Màu gradient đỏ nhiều lớp
        'orange': {
          'gradient-start': '#8F1A1E', // Đỏ đậm
          'gradient-middle': '#C53A3F', // Đỏ tươi hơn
          'gradient-end': '#B83236', // Đỏ sáng
        },
        // Màu nâu đỏ đậm cho text và icon trong card
        'brown': {
          'dark': '#8B4513', // Dark reddish-brown
          'medium': '#A0522D',
          'light': '#CD853F',
        },
        // Giữ lại history-red cho backward compatibility (dùng cùng tông với primary)
        'history-red': {
          DEFAULT: '#8F1A1E',
          'light': '#B83236',
          'dark': '#5C0F12',
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
