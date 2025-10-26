# Botswana Courier Platform

A comprehensive courier delivery management system for Botswana, featuring web admin dashboard, driver mobile app, and customer mobile app with SMS notifications.

## Features

### Core Functionality
- **Real-time Delivery Tracking** - Live GPS tracking of all deliveries
- **Auto-Dispatch System** - Intelligent order assignment to drivers
- **Route Optimization** - Efficient multi-stop delivery routes
- **SMS Notifications** - Automated customer and driver notifications
- **Proof of Delivery** - Digital signatures and photo capture
- **Multi-platform** - Web dashboard + iOS/Android apps

### User Roles
- **Customers** - Place orders, track deliveries, view history
- **Drivers** - Accept orders, navigate routes, update delivery status
- **Admins** - Manage orders, drivers, customers, and analytics

## Project Structure

```
delivery/
├── backend/              # Node.js/Express API server
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── controllers/ # Business logic
│   │   ├── models/      # Database models
│   │   ├── services/    # External services (SMS, maps)
│   │   ├── middleware/  # Auth, validation, etc.
│   │   └── config/      # Configuration files
│   └── tests/           # API tests
├── web/                 # Next.js web application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Next.js pages
│   │   ├── contexts/    # React contexts
│   │   └── utils/       # Helper functions
│   └── public/          # Static assets
├── mobile-driver/       # React Native driver app
│   ├── src/
│   │   ├── screens/     # App screens
│   │   ├── components/  # Reusable components
│   │   ├── navigation/  # Navigation setup
│   │   └── services/    # API services
│   └── assets/          # Images, fonts, etc.
├── mobile-customer/     # React Native customer app
│   └── src/             # (Same structure as driver app)
└── shared/              # Shared types and utilities
    ├── types/           # TypeScript definitions
    └── utils/           # Common utilities
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io
- **Authentication**: JWT
- **SMS**: Twilio (supports Botswana)
- **Maps**: Google Maps API

### Web Frontend
- **Framework**: Next.js 14 (React)
- **UI Library**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + SWR
- **Maps**: Google Maps React
- **Charts**: Recharts

### Mobile Apps
- **Framework**: React Native 0.73+
- **Navigation**: React Navigation
- **State**: React Context + Async Storage
- **Maps**: react-native-maps
- **Notifications**: React Native Push Notifications

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Twilio account (for SMS)
- Google Maps API key
- React Native development environment (for mobile apps)

### Environment Variables

Create `.env` files in each directory:

**backend/.env**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/courier_db
JWT_SECRET=your_jwt_secret_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
GOOGLE_MAPS_API_KEY=your_google_maps_key
PORT=3001
```

**web/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
```

**mobile-driver/.env** and **mobile-customer/.env**
```env
API_URL=http://localhost:3001
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Installation & Setup

1. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Web
cd ../web
npm install

# Mobile Driver App
cd ../mobile-driver
npm install

# Mobile Customer App
cd ../mobile-customer
npm install
```

2. **Set up database**
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

3. **Start development servers**

```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Web Dashboard
cd web
npm run dev

# Terminal 3: Driver App
cd mobile-driver
npm start

# Terminal 4: Customer App
cd mobile-customer
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order

### Drivers
- `GET /api/drivers` - List all drivers
- `POST /api/drivers` - Add new driver
- `GET /api/drivers/:id` - Get driver details
- `PATCH /api/drivers/:id/location` - Update driver location
- `GET /api/drivers/:id/orders` - Get driver orders

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer details
- `GET /api/customers/:id/orders` - Get customer orders

### Real-time Events (Socket.io)
- `order:created` - New order created
- `order:assigned` - Order assigned to driver
- `order:updated` - Order status updated
- `driver:location` - Driver location update
- `delivery:completed` - Delivery completed

## SMS Notifications

The platform sends SMS notifications for:
- Order confirmation (to customer)
- Driver assignment (to customer)
- En route notification (to customer)
- Delivery completion (to customer)
- New order assignment (to driver)
- Order updates (to both)

## Mobile App Features

### Driver App
- Login/Authentication
- View assigned deliveries
- Accept/Reject orders
- Real-time navigation
- Update delivery status
- Proof of delivery (signature + photo)
- Earnings tracking
- Delivery history

### Customer App
- Register/Login
- Place delivery orders
- Real-time tracking
- Delivery history
- Notifications
- Support chat
- Rate deliveries
- Multiple addresses

## Deployment

### Backend (Node.js)
- **Recommended**: Railway, Render, or DigitalOcean
- Set environment variables
- Configure PostgreSQL database
- Enable WebSocket support

### Web Dashboard
- **Recommended**: Vercel or Netlify
- Connect Git repository
- Set environment variables
- Deploy automatically on push

### Mobile Apps
- **iOS**: Build and deploy via Xcode to App Store
- **Android**: Build APK/AAB and deploy to Google Play Store

## License

MIT License - feel free to use for your courier business!

## Support

For questions or issues, please create an issue in the repository.
