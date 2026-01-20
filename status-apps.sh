#!/bin/bash

echo "=== Trạng thái Việt Sử Quân ==="
echo ""

echo "SERVER (Backend - Port 5000):"
if ps aux | grep "node index.js" | grep -v grep > /dev/null; then
    echo "✅ Đang chạy"
    ps aux | grep "node index.js" | grep -v grep | head -2
else
    echo "❌ Không chạy"
fi

echo ""
echo "CLIENT (Frontend - Port 3000):"
if ps aux | grep "serve.*build" | grep -v grep > /dev/null; then
    echo "✅ Đang chạy"
    ps aux | grep "serve.*build" | grep -v grep | head -2
else
    echo "❌ Không chạy"
fi

echo ""
echo "=== Trạng thái Port ==="
lsof -i :5000 -i :3000 2>/dev/null | grep LISTEN || echo "Không có ứng dụng nào đang lắng nghe trên port 5000 và 3000"

echo ""
echo "=== Log gần đây ==="
echo ""
echo "--- Server Log (10 dòng cuối) ---"
tail -10 /tmp/server.log 2>/dev/null || echo "Không tìm thấy log server"
echo ""
echo "--- Client Log (10 dòng cuối) ---"
tail -10 /tmp/client.log 2>/dev/null || echo "Không tìm thấy log client"
