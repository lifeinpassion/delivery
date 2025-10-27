#!/bin/bash

# Increase file watcher limit
ulimit -n 65536

echo "✓ File watcher limit increased to 65536"
echo "✓ Starting Expo in TUNNEL mode (works through firewall)..."
echo ""

# Start Expo with tunnel mode for better connectivity
npm start -- --tunnel --clear
