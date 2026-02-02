#!/bin/bash

# Script tự động thử lại cấp chứng chỉ SSL cho thiensuky.io.vn
# Sau khi hết rate limit từ Let's Encrypt

set -e

DOMAIN="thiensuky.io.vn"
NGINX_CONF_SOURCE="/usr/local/app/Website-Lich-Su/nginx/thiensuky.io.vn.conf"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"

echo "=== Thử lại cấp chứng chỉ SSL cho $DOMAIN ==="
echo ""

# Kiểm tra quyền root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Vui lòng chạy script này với quyền root (sudo)"
    exit 1
fi

# Đảm bảo thư mục acme-challenge tồn tại
echo "📁 Kiểm tra thư mục acme-challenge..."
mkdir -p /var/www/html/.well-known/acme-challenge
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
echo "✓ Thư mục đã sẵn sàng"

# Cập nhật cấu hình nginx (chỉ HTTP, chưa có SSL)
echo ""
echo "📝 Cập nhật cấu hình nginx..."
cat > "$NGINX_SITES_AVAILABLE/$DOMAIN" << 'EOF'
# HTTP server - cho phép certbot verify
server {
    listen 80;
    listen [::]:80;
    server_name thiensuky.io.vn www.thiensuky.io.vn;

    # Ưu tiên cao nhất cho acme-challenge
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
        default_type text/plain;
        try_files $uri =404;
        access_log off;
    }

    # Tạm thời proxy đến React app (sẽ redirect sang HTTPS sau khi có SSL)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

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

# Thử cấp chứng chỉ
echo ""
echo "🔐 Thử cấp chứng chỉ SSL..."
certbot certonly --webroot -w /var/www/html -d "$DOMAIN" -d "www.$DOMAIN" --register-unsafely-without-email --agree-tos --non-interactive

if [ $? -eq 0 ]; then
    echo "✓ Chứng chỉ SSL đã được cấp thành công"
    
    # Cập nhật cấu hình nginx với SSL
    echo ""
    echo "📝 Cập nhật cấu hình nginx với SSL..."
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
    
    echo ""
    echo "=== Hoàn tất ==="
    echo "✅ HTTPS đã được cấu hình thành công!"
    echo ""
    echo "🌐 Truy cập website tại:"
    echo "   https://$DOMAIN"
    echo "   https://www.$DOMAIN"
else
    echo "❌ Lỗi khi cấp chứng chỉ SSL"
    echo "Vui lòng kiểm tra:"
    echo "  1. Domain đã trỏ đúng về IP server này chưa?"
    echo "  2. Port 80 và 443 đã mở chưa?"
    echo "  3. Có CDN/proxy cache nào đang chặn không?"
    echo "  4. Đã hết rate limit từ Let's Encrypt chưa?"
    exit 1
fi

