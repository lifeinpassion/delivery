#!/bin/bash

# Increase file watcher limit
ulimit -n 65536

echo "✓ File watcher limit increased to 65536"
echo "✓ Starting Expo with clear cache..."
echo ""

# Start Expo with clear cache
npm start -- --clear
