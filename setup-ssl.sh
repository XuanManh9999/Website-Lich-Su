#!/bin/bash

# Script cài đặt SSL cho vietsuquan.io.vn
# Sử dụng certbot để cấp chứng chỉ Let's Encrypt

set -e

DOMAIN="vietsuquan.io.vn"
EMAIL=""  # Thay bằng email của bạn để nhận thông báo từ Let's Encrypt
NGINX_CONF_SOURCE="/usr/local/app/Website-Lich-Su/nginx/vietsuquan.io.vn.conf"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

echo "=== Cài đặt SSL cho $DOMAIN ==="
echo ""

# Kiểm tra quyền root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Vui lòng chạy script này với quyền root (sudo)"
    exit 1
fi

# Bước 1: Cài đặt certbot nếu chưa có
echo "📦 Bước 1: Kiểm tra và cài đặt certbot..."
if ! command -v certbot &> /dev/null; then
    echo "Đang cài đặt certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    echo "✓ Certbot đã được cài đặt"
else
    echo "✓ Certbot đã được cài đặt"
fi

# Bước 2: Kiểm tra và cài đặt nginx nếu chưa có
echo ""
echo "📦 Bước 2: Kiểm tra và cài đặt nginx..."
if ! command -v nginx &> /dev/null; then
    echo "Đang cài đặt nginx..."
    apt-get update
    apt-get install -y nginx
    systemctl enable nginx
    echo "✓ Nginx đã được cài đặt"
else
    echo "✓ Nginx đã được cài đặt"
fi

# Bước 3: Tạo thư mục cho acme-challenge
echo ""
echo "📁 Bước 3: Tạo thư mục cho acme-challenge..."
mkdir -p /var/www/html/.well-known/acme-challenge
chown -R www-data:www-data /var/www/html
echo "✓ Thư mục đã được tạo"

# Bước 4: Copy cấu hình nginx (chưa có SSL)
echo ""
echo "📝 Bước 4: Cấu hình nginx ban đầu (HTTP only)..."
if [ ! -f "$NGINX_CONF_SOURCE" ]; then
    echo "❌ Không tìm thấy file cấu hình: $NGINX_CONF_SOURCE"
    exit 1
fi

# Tạo file cấu hình HTTP tạm thời để certbot có thể verify
cat > "$NGINX_SITES_AVAILABLE/$DOMAIN" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name vietsuquan.io.vn www.vietsuquan.io.vn;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}
EOF

# Tạo symlink
if [ -L "$NGINX_SITES_ENABLED/$DOMAIN" ]; then
    rm "$NGINX_SITES_ENABLED/$DOMAIN"
fi
ln -s "$NGINX_SITES_AVAILABLE/$DOMAIN" "$NGINX_SITES_ENABLED/$DOMAIN"

# Test và reload nginx
echo "Kiểm tra cấu hình nginx..."
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "✓ Nginx đã được cấu hình"
else
    echo "❌ Lỗi cấu hình nginx"
    exit 1
fi

# Bước 5: Cấp chứng chỉ SSL với certbot
echo ""
echo "🔐 Bước 5: Cấp chứng chỉ SSL với certbot..."
echo "⚠️  LƯU Ý: Bạn cần nhập email của bạn khi certbot hỏi"
echo ""

# Yêu cầu email nếu chưa có
if [ -z "$EMAIL" ]; then
    read -p "Nhập email của bạn (để nhận thông báo từ Let's Encrypt): " EMAIL
fi

# Chạy certbot
if [ -n "$EMAIL" ]; then
    certbot certonly --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
else
    certbot certonly --nginx -d "$DOMAIN" -d "www.$DOMAIN" --register-unsafely-without-email --agree-tos --non-interactive
fi

if [ $? -eq 0 ]; then
    echo "✓ Chứng chỉ SSL đã được cấp thành công"
else
    echo "❌ Lỗi khi cấp chứng chỉ SSL"
    echo "Vui lòng kiểm tra:"
    echo "  1. Domain đã trỏ đúng về IP server này chưa?"
    echo "  2. Port 80 và 443 đã mở chưa?"
    exit 1
fi

# Bước 6: Cập nhật cấu hình nginx với SSL
echo ""
echo "📝 Bước 6: Cập nhật cấu hình nginx với SSL..."
cp "$NGINX_CONF_SOURCE" "$NGINX_SITES_AVAILABLE/$DOMAIN"

# Test và reload nginx
echo "Kiểm tra cấu hình nginx..."
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "✓ Nginx đã được cấu hình với SSL"
else
    echo "❌ Lỗi cấu hình nginx"
    exit 1
fi

# Bước 7: Cấu hình auto-renewal
echo ""
echo "🔄 Bước 7: Cấu hình tự động gia hạn chứng chỉ..."
# Test renewal
certbot renew --dry-run
if [ $? -eq 0 ]; then
    echo "✓ Auto-renewal đã được cấu hình"
else
    echo "⚠️  Có thể có vấn đề với auto-renewal, nhưng chứng chỉ vẫn hợp lệ"
fi

echo ""
echo "=== Hoàn tất cài đặt SSL ==="
echo ""
echo "✅ HTTPS đã được cấu hình thành công!"
echo ""
echo "🌐 Truy cập website tại:"
echo "   https://$DOMAIN"
echo "   https://www.$DOMAIN"
echo ""
echo "📋 Thông tin chứng chỉ:"
echo "   - Chứng chỉ: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "   - Private key: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo "   - Tự động gia hạn: Đã cấu hình"
echo ""
echo "📝 Lệnh hữu ích:"
echo "   - Kiểm tra trạng thái: sudo systemctl status nginx"
echo "   - Xem log: sudo tail -f /var/log/nginx/vietsuquan.io.vn-error.log"
echo "   - Gia hạn thủ công: sudo certbot renew"
echo "   - Test cấu hình: sudo nginx -t"
echo ""

