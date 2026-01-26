# Hướng dẫn cài đặt HTTPS cho vietsuquan.io.vn

## Yêu cầu trước khi cài đặt

1. ✅ Domain `vietsuquan.io.vn` đã được trỏ về IP server của bạn
2. ✅ Port 80 (HTTP) và 443 (HTTPS) đã được mở trong firewall
3. ✅ Ứng dụng đang chạy trên:
   - Frontend: Port 3000
   - Backend: Port 5000

## Các bước cài đặt

### Bước 1: Chạy script cài đặt SSL

```bash
cd /usr/local/app/Website-Lich-Su
sudo chmod +x setup-ssl.sh
sudo ./setup-ssl.sh
```

Script sẽ tự động:
- Cài đặt certbot và nginx (nếu chưa có)
- Cấu hình nginx ban đầu (HTTP)
- Cấp chứng chỉ SSL từ Let's Encrypt
- Cấu hình nginx với HTTPS
- Thiết lập tự động gia hạn chứng chỉ

### Bước 2: Kiểm tra kết quả

Sau khi chạy script, truy cập:
- https://vietsuquan.io.vn
- https://www.vietsuquan.io.vn

## Cấu trúc file

- `nginx/vietsuquan.io.vn.conf` - File cấu hình nginx
- `setup-ssl.sh` - Script tự động cài đặt SSL

## Cấu hình nginx

File cấu hình nginx được lưu tại:
- `/etc/nginx/sites-available/vietsuquan.io.vn`
- `/etc/nginx/sites-enabled/vietsuquan.io.vn` (symlink)

### Các tính năng đã cấu hình:

1. **HTTP → HTTPS Redirect**: Tự động chuyển hướng tất cả traffic HTTP sang HTTPS
2. **SSL/TLS**: Sử dụng TLS 1.2 và 1.3 với cấu hình bảo mật tốt nhất
3. **Security Headers**: 
   - HSTS (HTTP Strict Transport Security)
   - X-Frame-Options
   - X-Content-Type-Options
   - X-XSS-Protection
4. **Proxy Configuration**:
   - Frontend (React) trên port 3000
   - Backend API trên port 5000
   - Static files (uploads) với cache
5. **Max Upload Size**: 50MB (phù hợp với upload audio và ảnh)

## Quản lý chứng chỉ SSL

### Kiểm tra trạng thái chứng chỉ

```bash
sudo certbot certificates
```

### Gia hạn thủ công

```bash
sudo certbot renew
```

### Test auto-renewal

```bash
sudo certbot renew --dry-run
```

### Xóa chứng chỉ (nếu cần)

```bash
sudo certbot delete --cert-name vietsuquan.io.vn
```

## Quản lý nginx

### Kiểm tra cấu hình

```bash
sudo nginx -t
```

### Reload nginx (sau khi thay đổi cấu hình)

```bash
sudo systemctl reload nginx
```

### Restart nginx

```bash
sudo systemctl restart nginx
```

### Xem log

```bash
# Log lỗi
sudo tail -f /var/log/nginx/vietsuquan.io.vn-error.log

# Log truy cập
sudo tail -f /var/log/nginx/vietsuquan.io.vn-access.log
```

## Xử lý sự cố

### Lỗi: Domain chưa trỏ về server

Kiểm tra DNS:
```bash
dig vietsuquan.io.vn
nslookup vietsuquan.io.vn
```

### Lỗi: Port 80/443 bị chặn

Kiểm tra firewall:
```bash
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Lỗi: Nginx không khởi động

Kiểm tra cấu hình:
```bash
sudo nginx -t
sudo systemctl status nginx
```

### Lỗi: Chứng chỉ không hợp lệ

Xóa và cấp lại:
```bash
sudo certbot delete --cert-name vietsuquan.io.vn
sudo ./setup-ssl.sh
```

## Lưu ý quan trọng

1. **Auto-renewal**: Certbot tự động gia hạn chứng chỉ mỗi 90 ngày. Đảm bảo cron job đang chạy:
   ```bash
   sudo systemctl status certbot.timer
   ```

2. **Backup**: Nên backup file cấu hình nginx và chứng chỉ SSL:
   ```bash
   sudo cp -r /etc/letsencrypt /backup/letsencrypt
   sudo cp /etc/nginx/sites-available/vietsuquan.io.vn /backup/
   ```

3. **Monitoring**: Theo dõi log để phát hiện sự cố sớm

4. **Performance**: Nginx đã được cấu hình với HTTP/2 và các tối ưu hóa khác

## Liên hệ hỗ trợ

Nếu gặp vấn đề, kiểm tra:
- Log nginx: `/var/log/nginx/vietsuquan.io.vn-error.log`
- Log certbot: `/var/log/letsencrypt/letsencrypt.log`
- Trạng thái service: `sudo systemctl status nginx`

