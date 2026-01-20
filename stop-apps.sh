#!/bin/bash

echo "=== Dừng Việt Sử Quân ==="
echo ""

# Stop Server
echo "Đang dừng Server..."
pkill -f "node index.js"
echo "✓ Server đã dừng"

# Stop Client
echo "Đang dừng Client..."
pkill -f "serve.*build"
echo "✓ Client đã dừng"

echo ""
echo "✅ Tất cả ứng dụng đã dừng"
