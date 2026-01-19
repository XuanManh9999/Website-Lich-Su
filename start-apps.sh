#!/bin/bash

echo "=== Starting Website Lich Su Applications ==="
echo ""

# Start Server
echo "Starting Server (Backend)..."
cd /usr/local/app/Website-Lich-Su/server
nohup npm start > /tmp/server.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"
sleep 3

# Start Client
echo ""
echo "Starting Client (Frontend)..."
cd /usr/local/app/Website-Lich-Su/client
nohup serve -s build -p 3000 > /tmp/client.log 2>&1 &
CLIENT_PID=$!
echo "Client started with PID: $CLIENT_PID"
sleep 3

echo ""
echo "=== Applications Status ==="
echo ""
echo "Server (Port 5000):"
ps aux | grep "node index.js" | grep -v grep | head -1
echo ""
echo "Client (Port 3000):"
ps aux | grep "serve.*build" | grep -v grep | head -1
echo ""
echo "=== Access URLs ==="
echo "Backend API: http://180.93.52.233:5000"
echo "Frontend: http://180.93.52.233:3000"
echo ""
echo "=== Logs ==="
echo "Server log: /tmp/server.log"
echo "Client log: /tmp/client.log"
