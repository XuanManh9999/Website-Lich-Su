#!/bin/bash

echo "=== Stopping Website Lich Su Applications ==="
echo ""

# Stop Server
echo "Stopping Server..."
pkill -f "node index.js"
echo "Server stopped"

# Stop Client
echo "Stopping Client..."
pkill -f "serve.*build"
echo "Client stopped"

echo ""
echo "=== All applications stopped ==="
