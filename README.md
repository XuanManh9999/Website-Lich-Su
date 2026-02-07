# Việt Sử Quân

**Việt Sử Quân** - Website giới thiệu các nhân vật lịch sử Việt Nam với tích hợp NFC và audio kể chuyện. Khám phá hành trình lịch sử hào hùng của dân tộc qua các anh hùng, danh tướng và nhà cách mạng Việt Nam.

## Công nghệ

- **Backend**: Node.js + Express
- **Frontend**: React.js + Tailwind CSS
- **Database**: MySQL
- **Upload**: Multer (audio files)
- **Styling**: Tailwind CSS (responsive, mobile-first)

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm run install-all
```

### 2. Cấu hình database

Tạo file `.env` trong thư mục `server/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vietsuquan
JWT_SECRET=your_secret_key_here
PORT=5000

# Email configuration (for forgot password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# VNPay Sandbox configuration
VNP_TMNCODE=YOUR_TMNCODE
VNP_HASHSECRET=YOUR_HASHSECRET
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/payment/result

# Gemini AI configuration
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Tạo database

**Cách 1: Chạy file SQL trực tiếp**

```bash
mysql -u root -p < server/database/schema.sql
```

Hoặc import vào phpMyAdmin/MySQL Workbench.

**Cách 2: Chạy script Node.js (Khuyến nghị)**

```bash
cd server
node scripts/createTables.js
```

Script này sẽ tự động tạo database và tất cả các bảng cần thiết (bao gồm: characters, admins, posts, products, quiz_questions, orders, order_items).

### 4. Thêm dữ liệu mẫu (Seeder)

**Cách 1: Reset và seed dữ liệu mới (Khuyến nghị)**

Script này sẽ xóa hết dữ liệu cũ và thêm dữ liệu mới:

```bash
cd server
npm run reset-seed
```

Hoặc:

```bash
cd server
node scripts/resetAndSeed.js
```

**Cách 2: Chỉ thêm dữ liệu (không xóa dữ liệu cũ)**

```bash
cd server
npm run seed
```

Hoặc:

```bash
cd server
node scripts/seedData.js
```

Script sẽ tự động thêm:
- ✅ **15 nhân vật lịch sử** (Trần Hưng Đạo, Lý Thái Tổ, Lê Lợi, Nguyễn Huệ, Hồ Chí Minh, Võ Nguyên Giáp, và nhiều hơn nữa)
- ✅ **15 bài viết blog** về lịch sử, văn hóa Việt Nam
- ✅ **15 sản phẩm** liên quan đến lịch sử Việt Nam
- ✅ **30 câu hỏi quiz** về lịch sử Việt Nam
- ✅ **1 tài khoản admin** mặc định (username: `admin`, password: `admin123`)

**Lưu ý:** 
- Script `reset-seed` sẽ xóa **tất cả dữ liệu cũ** trước khi thêm dữ liệu mới
- Script `seed` sẽ bỏ qua các bản ghi đã tồn tại (dựa trên slug/username), an toàn để chạy nhiều lần

### 5. Chạy ứng dụng

```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Cấu trúc dự án

```
├── server/           # Backend Express
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── database/
│   ├── uploads/      # Audio files
│   └── index.js
├── client/           # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── public/
└── package.json
```

## Tính năng

- ✅ Danh sách và chi tiết nhân vật lịch sử
- ✅ Audio kể chuyện (upload MP3, player tích hợp)
- ✅ Tích hợp NFC (link ổn định theo slug)
- ✅ Trang admin (CRUD nhân vật, upload ảnh/audio)
- ✅ Trang blog/tin tức với phân trang và tìm kiếm
- ✅ Trang sản phẩm với phân trang và tìm kiếm
- ✅ Quiz trắc nghiệm (Flash Cards) với kết quả chi tiết
- ✅ Chatbot AI với Gemini AI (truy vấn database)
- ✅ Giỏ hàng với localStorage
- ✅ Thanh toán VNPay Sandbox
- ✅ Quên mật khẩu và reset qua email
- ✅ Responsive mobile-first (Tailwind CSS)
- ✅ Đăng nhập/Đăng ký admin với JWT
- ✅ Giao diện chuyên nghiệp với Tailwind CSS

## NFC Integration

Mỗi nhân vật có một URL duy nhất:

- Format: `/nhan-vat/{slug}`
- Ví dụ: `/nhan-vat/tran-hung-dao`

Ghi URL này vào thẻ NFC, khi chạm sẽ mở đúng trang nhân vật.

## Tailwind CSS

Dự án sử dụng Tailwind CSS cho styling. Xem file `SETUP_TAILWIND.md` để biết thêm chi tiết về cấu hình và sử dụng.

### Custom Colors

- `history-red` (#8B0000) - Màu chủ đạo
- `history-red-light` (#A52A2A)
- `history-red-dark` (#6B0000)

### Responsive Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Cấu hình tính năng nâng cao

### Email (Quên mật khẩu)

Cấu hình email trong `.env` để sử dụng chức năng quên mật khẩu:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password  # Sử dụng App Password cho Gmail
```

**Lưu ý:** Với Gmail, bạn cần tạo App Password tại: https://myaccount.google.com/apppasswords

### VNPay Sandbox

Để sử dụng thanh toán VNPay Sandbox:

1. Đăng ký tài khoản tại: https://sandbox.vnpayment.vn/
2. Lấy `TmnCode` và `HashSecret` từ tài khoản
3. Cấu hình trong `.env`:

```env
VNP_TMNCODE=your_tmncode
VNP_HASHSECRET=your_hashsecret
VNP_RETURN_URL=http://localhost:3000/payment/result
```

### Gemini AI (Chatbot)

Để sử dụng chatbot với Gemini AI:

1. Lấy API Key tại: https://makersuite.google.com/app/apikey
2. Cấu hình trong `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Chatbot sẽ tự động truy vấn database để tìm thông tin liên quan và sử dụng Gemini AI để trả lời câu hỏi.
