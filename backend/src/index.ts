import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/env';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { verifyToken } from './utils/jwt';

// Import routes
import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';
import driverRoutes from './routes/driverRoutes';
import addressRoutes from './routes/addressRoutes';

// Initialize Express
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.cors.allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/addresses', addressRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Socket.io authentication middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = verifyToken(token);
    socket.data.user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  const user = socket.data.user;
  logger.info(`User connected: ${user.userId} (${user.role})`);

  // Join user-specific room
  socket.join(`user:${user.userId}`);

  // Join role-specific room
  socket.join(`role:${user.role}`);

  // Driver-specific events
  if (user.role === 'DRIVER') {
    // Driver location updates
    socket.on('driver:location', async (data) => {
      const { latitude, longitude, orderId } = data;

      // Broadcast to admin dashboard
      io.to('role:ADMIN').emit('driver:location:update', {
        driverId: user.userId,
        latitude,
        longitude,
        timestamp: new Date(),
      });

      // If order is active, broadcast to customer
      if (orderId) {
        io.to(`order:${orderId}`).emit('delivery:location', {
          latitude,
          longitude,
          timestamp: new Date(),
        });
      }

      logger.debug(`Driver location update: ${user.userId}`);
    });

    // Driver status change
    socket.on('driver:status', async (data) => {
      const { status } = data;
      io.to('role:ADMIN').emit('driver:status:update', {
        driverId: user.userId,
        status,
        timestamp: new Date(),
      });
    });
  }

  // Order tracking
  socket.on('order:subscribe', (orderId) => {
    socket.join(`order:${orderId}`);
    logger.debug(`User ${user.userId} subscribed to order ${orderId}`);
  });

  socket.on('order:unsubscribe', (orderId) => {
    socket.leave(`order:${orderId}`);
    logger.debug(`User ${user.userId} unsubscribed from order ${orderId}`);
  });

  // Order status updates (from driver)
  socket.on('order:update', async (data) => {
    const { orderId, status, latitude, longitude } = data;

    // Broadcast to all subscribed to this order
    io.to(`order:${orderId}`).emit('order:status:update', {
      orderId,
      status,
      latitude,
      longitude,
      timestamp: new Date(),
    });

    // Broadcast to admin
    io.to('role:ADMIN').emit('order:update', {
      orderId,
      status,
      timestamp: new Date(),
    });

    logger.info(`Order ${orderId} status updated to ${status}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${user.userId}`);
  });
});

// Export io for use in controllers
export { io };

// Start server
httpServer.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`CORS allowed origins: ${config.cors.allowedOrigins.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
