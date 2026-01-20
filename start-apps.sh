#!/bin/bash

echo "=== Khởi động Việt Sử Quân ==="
echo ""

# Start Server
echo "Đang khởi động Server (Backend)..."
cd /usr/local/app/Website-Lich-Su/server
nohup npm start > /tmp/server.log 2>&1 &
SERVER_PID=$!
echo "✓ Server đã khởi động với PID: $SERVER_PID"
sleep 3

# Start Client
echo ""
echo "Đang khởi động Client (Frontend)..."
cd /usr/local/app/Website-Lich-Su/client
nohup serve -s build -p 3000 > /tmp/client.log 2>&1 &
CLIENT_PID=$!
echo "✓ Client đã khởi động với PID: $CLIENT_PID"
sleep 3

echo ""
echo "=== Trạng thái ứng dụng ==="
echo ""
echo "Server (Port 5000):"
ps aux | grep "node index.js" | grep -v grep | head -1
echo ""
echo "Client (Port 3000):"
ps aux | grep "serve.*build" | grep -v grep | head -1
echo ""
echo "=== URL truy cập ==="
echo "🌐 Backend API: http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "=== Log files ==="
echo "📝 Server log: /tmp/server.log"
echo "📝 Client log: /tmp/client.log"
echo ""
echo "✅ Việt Sử Quân đã khởi động thành công!"
