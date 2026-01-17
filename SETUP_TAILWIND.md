# Hướng Dẫn Cài Đặt Tailwind CSS

## Bước 1: Cài đặt dependencies

```bash
cd client
npm install
```

## Bước 2: Kiểm tra cấu hình

Đảm bảo các file sau đã được tạo:
- `tailwind.config.js` - Cấu hình Tailwind
- `postcss.config.js` - Cấu hình PostCSS
- `src/index.css` - Đã có Tailwind directives

## Bước 3: Chạy ứng dụng

```bash
npm start
```

Tailwind CSS sẽ tự động compile khi bạn chạy ứng dụng.

## Custom Colors

Màu sắc tùy chỉnh đã được định nghĩa trong `tailwind.config.js`:
- `history-red` (#8B0000) - Màu chủ đạo
- `history-red-light` (#A52A2A)
- `history-red-dark` (#6B0000)

Sử dụng: `bg-history-red`, `text-history-red`, etc.

## Responsive Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Components đã được cập nhật

Tất cả các component đã được cập nhật để sử dụng Tailwind CSS:
- ✅ Home
- ✅ Characters
- ✅ CharacterDetail
- ✅ Navbar
- ✅ AudioPlayer
- ✅ Admin/Login
- ✅ Admin/Dashboard
- ✅ Posts
- ✅ Products
- ✅ Quiz
- ✅ Chatbot
- ✅ Cart
