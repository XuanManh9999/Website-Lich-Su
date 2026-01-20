# Hướng dẫn sử dụng Scripts

## Scripts quản lý ứng dụng Việt Sử Quân

Dự án cung cấp 3 script để dễ dàng quản lý ứng dụng:

### 1. start-apps.sh - Khởi động ứng dụng

Khởi động cả Server (Backend) và Client (Frontend) với nohup.

**Sử dụng:**
```bash
./start-apps.sh
```

**Chức năng:**
- Khởi động Server trên port 5000
- Khởi động Client trên port 3000
- Chạy background với nohup
- Hiển thị trạng thái và PID của các process
- Log được lưu tại `/tmp/server.log` và `/tmp/client.log`

### 2. stop-apps.sh - Dừng ứng dụng

Dừng tất cả các ứng dụng đang chạy.

**Sử dụng:**
```bash
./stop-apps.sh
```

**Chức năng:**
- Dừng Server
- Dừng Client
- Kill tất cả process liên quan

### 3. status-apps.sh - Kiểm tra trạng thái

Kiểm tra trạng thái của các ứng dụng đang chạy.

**Sử dụng:**
```bash
./status-apps.sh
```

**Chức năng:**
- Hiển thị trạng thái Server (đang chạy/không chạy)
- Hiển thị trạng thái Client (đang chạy/không chạy)
- Kiểm tra port 5000 và 3000
- Hiển thị 10 dòng log gần nhất của mỗi ứng dụng

## Quy trình làm việc

### Khởi động lần đầu

```bash
# 1. Cài đặt dependencies (nếu chưa cài)
npm run install-all

# 2. Cấu hình database và .env
# Xem file README.md

# 3. Build client (production)
cd client
npm run build
cd ..

# 4. Khởi động ứng dụng
./start-apps.sh
```

### Khởi động hàng ngày

```bash
# Kiểm tra trạng thái
./status-apps.sh

# Nếu chưa chạy, khởi động
./start-apps.sh
```

### Cập nhật code

```bash
# 1. Dừng ứng dụng
./stop-apps.sh

# 2. Pull code mới hoặc chỉnh sửa

# 3. Rebuild client (nếu có thay đổi frontend)
cd client
npm run build
cd ..

# 4. Khởi động lại
./start-apps.sh
```

### Khắc phục sự cố

```bash
# 1. Kiểm tra trạng thái và log
./status-apps.sh

# 2. Xem log chi tiết
tail -f /tmp/server.log  # Server log
tail -f /tmp/client.log  # Client log

# 3. Restart
./stop-apps.sh
./start-apps.sh
```

## Lưu ý

- Các script phải được chạy từ thư mục gốc của dự án (`/usr/local/app/Website-Lich-Su`)
- Log files được lưu tại `/tmp/` và sẽ bị xóa khi server restart
- Client chạy ở chế độ production (serve static files) để tránh lỗi webpack dev server
- Nếu muốn chạy development mode, sử dụng `npm run dev` trong thư mục gốc

## URL truy cập

- **Frontend:** http://localhost:3000 hoặc http://[server-ip]:3000
- **Backend API:** http://localhost:5000 hoặc http://[server-ip]:5000

## Các lệnh khác

### Chạy development mode (cả 2 ứng dụng)
```bash
npm run dev
```

### Chạy từng ứng dụng riêng lẻ
```bash
# Server
cd server
npm run dev

# Client (development)
cd client
npm start
```

### Seed database
```bash
npm run seed
# hoặc
npm run create-tables
```

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra log files
2. Đảm bảo ports 3000 và 5000 không bị chiếm bởi ứng dụng khác
3. Kiểm tra cấu hình `.env` trong thư mục `server/`
4. Xem file `README.md` để biết thêm chi tiết
