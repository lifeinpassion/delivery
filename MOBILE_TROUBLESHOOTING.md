# Mobile App Troubleshooting Guide

## Issue 1: EMFILE Error (Too Many Open Files) - macOS

This error occurs because macOS has a low default limit on the number of files that can be watched by Metro bundler.

### Solution: Increase File Watcher Limits

Run these commands in your terminal:

```bash
# Check current limits
ulimit -n

# Temporarily increase limit (current terminal session only)
ulimit -n 65536

# OR permanently increase limits:
# Edit/create the file:
sudo nano /Library/LaunchDaemons/limit.maxfiles.plist
```

Add this content to `limit.maxfiles.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string>
      <string>limit</string>
      <string>maxfiles</string>
      <string>65536</string>
      <string>200000</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>ServiceIPC</key>
    <false/>
  </dict>
</plist>
```

Then run:
```bash
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
sudo chmod 644 /Library/LaunchDaemons/limit.maxfiles.plist
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

**Quick Fix (Temporary):**
```bash
# Just run this before starting Expo each time
ulimit -n 65536
npm start
```

## Issue 2: Expo Go Connection Error

### Problem: "could not connect to the server exp://192.168.1.82:8081"

### Solutions:

#### A. Clear Metro Bundler Cache
```bash
# Stop the current server (Ctrl+C)
# Clear cache
cd mobile-driver
rm -rf .expo node_modules/.cache
npm start -- --clear
```

#### B. Check Firewall Settings

**macOS:**
1. Open System Preferences > Security & Privacy > Firewall
2. Click "Firewall Options"
3. Ensure "node" or "Expo" is allowed
4. Or temporarily disable firewall for testing

**Alternative:** Allow incoming connections explicitly:
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

#### C. Ensure Both Devices on Same Network

- Your Mac and iPhone must be on the same WiFi network
- No VPN should be active
- No guest network or network isolation enabled

#### D. Try Tunnel Mode (Works Through Firewall)

```bash
npm start -- --tunnel
```

This will show a different QR code that works through Expo's servers.

#### E. Try LAN Connection
```bash
npm start -- --lan
```

#### F. Use Manual Connection

In Expo Go app:
1. Tap "Enter URL manually"
2. Enter: `exp://192.168.1.82:8081`

Or try your computer's actual IP:
```bash
# Find your IP address
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## Issue 3: Package Version Warnings

Update to recommended versions:

```bash
cd mobile-driver

# Update React Native
npm install react-native@0.73.6

# Update Expo Camera
npm install expo-camera@~14.1.3

# Fix vulnerabilities
npm audit fix
```

## Complete Clean Restart Process

If still having issues, do a complete clean restart:

```bash
# 1. Stop all running processes (Ctrl+C)

# 2. Clean everything
cd mobile-driver
rm -rf node_modules
rm -rf .expo
rm -rf package-lock.json
rm -rf ios/Pods
rm -rf ios/build
watchman watch-del-all

# 3. Increase file limits
ulimit -n 65536

# 4. Reinstall
npm install

# 5. Start with clean cache
npm start -- --clear --tunnel
```

## Quick Fix Checklist

Try these in order:

1. **Quick File Limit Fix:**
   ```bash
   ulimit -n 65536
   cd mobile-driver
   npm start -- --clear
   ```

2. **If connection fails, use tunnel:**
   ```bash
   ulimit -n 65536
   npm start -- --tunnel
   ```

3. **Check firewall** - Temporarily disable or allow node

4. **Verify network** - Same WiFi, no VPN

5. **Clean restart** - See "Complete Clean Restart Process" above

## Debugging Connection Issues

### Test Metro Bundler Directly

Open in browser:
```
http://192.168.1.82:8081
```

You should see Metro bundler status page.

### Check if Port is in Use
```bash
lsof -i :8081
# If something is using it, kill it:
kill -9 <PID>
```

### Verify Network Connection
```bash
# From your Mac, ping your phone's IP (if known)
ping <iphone-ip>

# Test if port is accessible
nc -zv 192.168.1.82 8081
```

## Alternative: Use iOS Simulator

If physical device keeps having issues:

```bash
# Install Xcode from App Store (if not already installed)
# Then:
npm start
# Press 'i' to open iOS simulator
```

## Alternative: Use Development Build

If Expo Go keeps having issues:

```bash
# Create a development build
npx expo install expo-dev-client
npx expo prebuild
npx expo run:ios
```

## Common Issues & Fixes

### "Unknown error: could not connect to the server"
- **Fix:** Use tunnel mode: `npm start -- --tunnel`
- **Fix:** Check firewall settings
- **Fix:** Ensure same WiFi network

### "EMFILE: too many open files"
- **Fix:** `ulimit -n 65536`
- **Fix:** Install watchman: `brew install watchman`

### Metro bundler crashes
- **Fix:** Clear cache: `npm start -- --clear`
- **Fix:** Increase memory: `export NODE_OPTIONS=--max_old_space_size=4096`

### "Unable to resolve module"
- **Fix:**
  ```bash
  rm -rf node_modules
  npm install
  npm start -- --clear
  ```

## Recommended Setup for Development

Add this to your `.zshrc` or `.bash_profile`:

```bash
# React Native Development
ulimit -n 65536
export NODE_OPTIONS=--max_old_space_size=4096
```

Then restart terminal or run:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

## Still Having Issues?

1. **Check Expo Status:** https://status.expo.dev/
2. **Update Expo CLI:** `npm install -g expo-cli@latest`
3. **Update Expo Go App:** Check App Store for updates
4. **Try Different Network:** Mobile hotspot, different WiFi
5. **Check Console Logs:** Look for specific error messages

## Get System Info

```bash
# Node version (should be 18+)
node --version

# npm version
npm --version

# Expo version
npx expo --version

# Watchman (optional but recommended)
brew install watchman
watchman version
```

## macOS-Specific: Install Watchman (Recommended)

```bash
brew install watchman
```

Watchman helps with file watching and reduces EMFILE errors.

## Quick Start Script

Create a file `start-app.sh`:

```bash
#!/bin/bash
ulimit -n 65536
cd mobile-driver
npm start -- --clear --tunnel
```

Make it executable:
```bash
chmod +x start-app.sh
./start-app.sh
```

---

## Need More Help?

- Check Expo documentation: https://docs.expo.dev/
- Metro bundler docs: https://facebook.github.io/metro/
- React Native troubleshooting: https://reactnative.dev/docs/troubleshooting
