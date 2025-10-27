# Courier Driver Mobile App

React Native mobile app for courier drivers using Expo.

## Quick Start

### Method 1: Using npm scripts (Recommended)

```bash
# Pull latest changes first
git pull

# Clear cache and start (fixes EMFILE error automatically)
npm run start:clear

# OR use tunnel mode if having connection issues
npm run start:tunnel
```

### Method 2: Using shell scripts

```bash
# Regular start
./start.sh

# Tunnel mode (better for firewall/network issues)
./start-tunnel.sh
```

### Method 3: Manual

```bash
# Stop any running instances (Ctrl+C)

# Increase file watcher limit
ulimit -n 65536

# Start Expo
npm start -- --clear

# OR with tunnel mode
npm start -- --tunnel
```

## Testing

### On Physical Device

1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Run `npm run start:tunnel` (most reliable)
3. Scan QR code with Expo Go app

### On iOS Simulator

```bash
npm start
# Press 'i' when Metro bundler starts
```

### On Android Emulator

```bash
npm start
# Press 'a' when Metro bundler starts
```

## Common Issues

### "EMFILE: too many open files"

**Fixed automatically** in npm scripts. If using `npm start` directly:

```bash
ulimit -n 65536
npm start
```

### "Could not connect to server"

Use tunnel mode:

```bash
npm run start:tunnel
```

### App crashes or won't load

Clear cache:

```bash
npm run start:clear
```

### Complete reset

```bash
rm -rf node_modules .expo
npm install
npm run start:clear
```

## Features

- **GPS Tracking**: Automatic location updates
- **Order Management**: Accept and manage deliveries
- **Real-time Updates**: Live order status via WebSocket
- **Proof of Delivery**: Camera integration for photos

## Configuration

Update API URL in `src/services/api.ts`:

```typescript
// For local development on physical device, use your computer's IP:
const API_URL = 'http://192.168.1.XXX:3001/api';

// For iOS Simulator:
const API_URL = 'http://localhost:3001/api';

// For Android Emulator:
const API_URL = 'http://10.0.2.2:3001/api';
```

## Available Scripts

- `npm start` - Start Expo (with ulimit fix)
- `npm run start:clear` - Start with cleared cache
- `npm run start:tunnel` - Start with tunnel mode
- `npm run ios` - Open in iOS simulator
- `npm run android` - Open in Android emulator

## Troubleshooting

See `../MOBILE_TROUBLESHOOTING.md` for detailed solutions.

## Architecture

```
src/
├── contexts/       # React contexts (Auth, Location)
├── navigation/     # React Navigation setup
├── screens/        # App screens
├── services/       # API and external services
└── utils/          # Helper functions
```

## Development

The app uses:
- **Expo** ~50.0.0
- **React Native** 0.73.2
- **React Navigation** 6.x
- **Expo Location** for GPS
- **Socket.io** for real-time updates
