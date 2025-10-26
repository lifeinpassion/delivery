# Botswana Courier Platform - Local Development Setup

## Quick Start Guide

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd delivery
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required .env variables:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/courier_db
JWT_SECRET=your_super_secret_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
GOOGLE_MAPS_API_KEY=your_google_maps_key
PORT=3001
```

```bash
# Set up database
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
```

Backend will run on http://localhost:3001

### 3. Web Dashboard Setup

```bash
cd ../web

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local
nano .env.local
```

**Required .env.local variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
```

```bash
# Start development server
npm run dev
```

Web dashboard will run on http://localhost:3000

### 4. Mobile Driver App Setup

```bash
cd ../mobile-driver

# Install dependencies
npm install

# Update API URL in src/services/api.ts
# Change API_URL to your backend URL

# Start Expo
npm start
```

Scan QR code with:
- iOS: Expo Go app (from App Store)
- Android: Expo Go app (from Play Store)

### 5. Mobile Customer App Setup

```bash
cd ../mobile-customer

# Install dependencies
npm install

# Update API URL in src/services/api.ts
# Change API_URL to your backend URL

# Start Expo
npm start
```

## Database Setup

### Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### Create Database

```bash
# Access PostgreSQL
psql postgres

# Create database
CREATE DATABASE courier_db;

# Create user
CREATE USER courier_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE courier_db TO courier_user;

# Exit
\q
```

## External Services Setup

### 1. Twilio (SMS)

1. Sign up at https://www.twilio.com
2. Get phone number that supports SMS in Botswana
3. Copy Account SID, Auth Token, and Phone Number
4. Add to backend .env file

**Test SMS:**
```bash
cd backend
# Create test script
node test-sms.js
```

### 2. Google Maps API

1. Go to https://console.cloud.google.com
2. Create new project
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Distance Matrix API
   - Geocoding API
4. Create API key
5. Add to .env files

**Restrict API key:**
- Set application restrictions (HTTP referrers for web)
- Set API restrictions (only enabled APIs)

## Creating Test Data

### Create Admin User

```bash
cd backend
npx prisma studio
```

In Prisma Studio:
1. Open "User" model
2. Add new record:
   - email: admin@courier.bw
   - password: (hash with bcrypt)
   - role: ADMIN
   - firstName: Admin
   - lastName: User

**Or use script:**
```javascript
// create-admin.js
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@courier.bw',
      phone: '+2677XXXXXXX',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log('Admin created:', admin);
}

createAdmin();
```

### Create Test Driver

```bash
cd backend
node create-driver.js
```

### Create Test Customer

Register through web app at http://localhost:3000/register

## Testing

### Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@courier.bw","password":"admin123"}'

# Create order (with token)
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pickupAddressId": "...",
    "dropoffAddressId": "...",
    "packageDescription": "Test package"
  }'
```

### Test WebSocket Connection

```javascript
// test-socket.js
const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  auth: { token: 'YOUR_TOKEN' }
});

socket.on('connect', () => {
  console.log('Connected!');

  socket.emit('order:subscribe', 'order-id');
});

socket.on('order:status:update', (data) => {
  console.log('Order update:', data);
});
```

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check if port 3001 is already in use
- Run `npx prisma generate`

### Web app connection error
- Verify backend is running
- Check NEXT_PUBLIC_API_URL is correct
- Check browser console for errors
- Verify CORS settings in backend

### Mobile app can't connect
- For iOS Simulator: use `http://localhost:3001`
- For Android Emulator: use `http://10.0.2.2:3001`
- For Physical Device: use your computer's IP (e.g., `http://192.168.1.100:3001`)
- Ensure firewall allows connections

### SMS not working
- Check Twilio credentials
- Verify phone number format
- Check Twilio account balance
- Review Twilio dashboard logs

### Database migration errors
- Drop database and recreate: `npx prisma migrate reset`
- Check DATABASE_URL format
- Ensure PostgreSQL is running

## Development Workflow

### Make Database Changes

```bash
cd backend

# Edit prisma/schema.prisma
# Then create migration
npx prisma migrate dev --name your_migration_name

# Generate Prisma Client
npx prisma generate
```

### Add New API Endpoint

1. Create controller in `backend/src/controllers/`
2. Create route in `backend/src/routes/`
3. Add route to `backend/src/index.ts`
4. Test with curl or Postman

### Add New Web Page

1. Create file in `web/src/app/[page]/page.tsx`
2. Add to navigation
3. Test in browser

### Add Mobile Screen

1. Create file in `mobile-*/src/screens/`
2. Add to navigator
3. Test in Expo

## Useful Commands

```bash
# Backend
cd backend
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npx prisma studio    # Open database GUI
npx prisma migrate   # Run migrations

# Web
cd web
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Mobile
cd mobile-driver
npm start            # Start Expo
npm run android      # Open in Android emulator
npm run ios          # Open in iOS simulator
```

## Next Steps

1. Customize branding and colors
2. Add more features (ratings, chat, etc.)
3. Implement route optimization
4. Add payment integration
5. Set up CI/CD pipeline
6. Deploy to production (see DEPLOYMENT.md)

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Google Maps API](https://developers.google.com/maps/documentation)
