#!/bin/bash

echo "=== Website Lich Su Applications Status ==="
echo ""

echo "SERVER (Backend - Port 5000):"
if ps aux | grep "node index.js" | grep -v grep > /dev/null; then
    echo "✓ Running"
    ps aux | grep "node index.js" | grep -v grep | head -2
else
    echo "✗ Not running"
fi

echo ""
echo "CLIENT (Frontend - Port 3000):"
if ps aux | grep "serve.*build" | grep -v grep > /dev/null; then
    echo "✓ Running"
    ps aux | grep "serve.*build" | grep -v grep | head -2
else
    echo "✗ Not running"
fi

echo ""
echo "=== Port Status ==="
lsof -i :5000 -i :3000 2>/dev/null | grep LISTEN || echo "No applications listening on ports 5000 and 3000"

echo ""
echo "=== Recent Logs ==="
echo ""
echo "--- Server Log (last 10 lines) ---"
tail -10 /tmp/server.log 2>/dev/null || echo "No server log found"
echo ""
echo "--- Client Log (last 10 lines) ---"
tail -10 /tmp/client.log 2>/dev/null || echo "No client log found"
