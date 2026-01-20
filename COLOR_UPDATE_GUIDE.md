# Hướng Dẫn Cập Nhật Màu Sắc và Logo - Việt Sử Quân

## 📅 Ngày cập nhật: 20/01/2026

## 🎨 Bảng Màu Mới

### Màu Chính (Primary)
Website đã được cập nhật từ màu đỏ burgundy sang **màu xanh dương đậm sang trọng**:

- **Primary Default**: `#0F4C81` - Xanh dương đậm chính
- **Primary Light**: `#1E88E5` - Xanh dương nhạt hơn
- **Primary Dark**: `#0A3A5F` - Xanh dương đậm hơn
- Các tông màu bổ sung: `#E3F2FD`, `#BBDEFB`, `#90CAF9`, `#64B5F6`, `#42A5F5`

### Màu Phụ (Accent)
Màu nhấn nhá cho các điểm nhấn quan trọng:

- **Accent Default**: `#FF9800` - Cam vàng ấm áp
- **Accent Light**: `#FFB74D` - Cam vàng nhạt
- **Accent Dark**: `#F57C00` - Cam đậm

## 🖼️ Logo Mới

### Thông tin Logo
- **File**: `/client/public/logo.svg`
- **Kích thước**: 120x120px (SVG, có thể scale)
- **Thiết kế**: 
  - Nền gradient xanh dương (#0F4C81 → #1E88E5)
  - Biểu tượng rồng Việt Nam phong cách hóa (màu cam vàng)
  - Icon sách lịch sử
  - Chữ "VSQ" ở phía dưới

### Sử dụng Logo
```jsx
<img 
  src="/logo.svg" 
  alt="Việt Sử Quân Logo" 
  className="h-10 w-10 md:h-12 md:w-12"
/>
```

## 🔧 Các Thay Đổi Kỹ Thuật

### 1. Tailwind Config (`client/tailwind.config.js`)
```javascript
colors: {
  'primary': {
    DEFAULT: '#0F4C81',
    'light': '#1E88E5',
    'dark': '#0A3A5F',
    // ... các tông màu khác
  },
  'accent': {
    DEFAULT: '#FF9800',
    'light': '#FFB74D',
    'dark': '#F57C00',
  },
  // history-red giờ trỏ đến primary cho backward compatibility
  'history-red': {
    DEFAULT: '#0F4C81',
    'light': '#1E88E5',
    'dark': '#0A3A5F',
  },
}
```

### 2. CSS Classes Đã Thay Đổi

#### Các class Tailwind đã được cập nhật:
- `bg-history-red` → `bg-primary`
- `text-history-red` → `text-primary`
- `border-history-red` → `border-primary`
- `bg-pink-100` → `bg-blue-100`
- `bg-red-50` → `bg-blue-50`

#### Các file CSS đã cập nhật:
- Tất cả `#8B0000` → `#0F4C81`
- Tất cả `#A52A2A` → `#1E88E5`

### 3. Components Đã Cập Nhật

#### Navbar (`client/src/components/Navbar.js`)
- ✅ Thêm logo SVG
- ✅ Màu nền từ `bg-history-red` → `bg-primary`
- ✅ Badge giỏ hàng từ `bg-yellow-400` → `bg-accent`

#### Footer (`client/src/components/Footer.js`)
- ✅ Màu nền từ `bg-history-red` → `bg-primary`

#### Home Page (`client/src/pages/Home.js`)
- ✅ Hero section với gradient `bg-gradient-to-br from-primary via-primary-dark to-primary-700`

#### Các Components Khác
- ✅ ImageCarousel
- ✅ FeaturedProducts
- ✅ FeaturedBlogPosts
- ✅ FeaturedFlashcards
- ✅ Posts
- ✅ Products
- ✅ Characters
- ✅ Quiz
- ✅ Chatbot
- ✅ Cart
- ✅ Admin components

## 🚀 Cách Sử Dụng

### Sử dụng màu chính
```jsx
<div className="bg-primary text-white">
  Nền xanh dương đậm với chữ trắng
</div>

<button className="bg-primary hover:bg-primary-light">
  Button với hover effect
</button>
```

### Sử dụng màu nhấn
```jsx
<span className="bg-accent text-white">
  Điểm nhấn cam vàng
</span>

<div className="border-accent">
  Viền màu cam
</div>
```

### Backward Compatibility
Các class `history-red` vẫn hoạt động (trỏ đến `primary`):
```jsx
<div className="bg-history-red"> 
  <!-- Vẫn hiển thị màu xanh dương mới -->
</div>
```

## 📝 Lý Do Thay Đổi

1. **Tính chuyên nghiệp**: Màu xanh dương đậm truyền tải sự tin cậy, uy tín, và tri thức - phù hợp với website lịch sử.

2. **Dễ đọc hơn**: Màu xanh dương có độ tương phản tốt hơn với chữ trắng, giảm mệt mỏi khi đọc.

3. **Hiện đại hơn**: Màu xanh dương là xu hướng design hiện đại cho các trang giáo dục và văn hóa.

4. **Tương phản tốt**: Kết hợp với màu accent cam vàng tạo sự nổi bật cho các CTA (Call-to-Action).

## 🎯 Kiểm Tra

Để đảm bảo mọi thứ hoạt động tốt:

1. Khởi động lại dev server:
```bash
cd client
npm start
```

2. Kiểm tra các trang:
   - ✅ Trang chủ (Hero section với gradient mới)
   - ✅ Logo trong Navbar
   - ✅ Footer
   - ✅ Trang sản phẩm
   - ✅ Blog
   - ✅ Quiz
   - ✅ Chatbot
   - ✅ Giỏ hàng

3. Kiểm tra responsive:
   - ✅ Mobile
   - ✅ Tablet
   - ✅ Desktop

## 📞 Hỗ Trợ

Nếu gặp vấn đề với màu sắc hoặc logo, vui lòng:
1. Xóa cache trình duyệt
2. Rebuild Tailwind CSS: `npm run build:css`
3. Khởi động lại dev server

---

**Cập nhật bởi**: AI Assistant
**Ngày**: 20/01/2026
**Version**: 2.0
