import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

/**
 * Create a new driver
 */
export const createDriver = async (req: AuthRequest, res: Response) => {
  try {
    const {
      email,
      phone,
      password,
      firstName,
      lastName,
      licenseNumber,
      vehicleType,
      vehicleModel,
      vehiclePlate,
      vehicleColor,
    } = req.body;

    // Validate required fields
    if (!email || !phone || !password || !firstName || !lastName || !licenseNumber || !vehicleType) {
      throw new AppError('All required fields must be provided', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      throw new AppError('User with this email or phone already exists', 400);
    }

    // Check if license number exists
    const existingDriver = await prisma.driver.findUnique({
      where: { licenseNumber },
    });

    if (existingDriver) {
      throw new AppError('License number already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and driver in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'DRIVER',
        },
      });

      const driver = await tx.driver.create({
        data: {
          userId: user.id,
          licenseNumber,
          vehicleType,
          vehicleModel,
          vehiclePlate,
          vehicleColor,
          status: 'OFFLINE',
        },
      });

      return { user, driver };
    });

    logger.info(`New driver registered: ${result.user.email}`);

    res.status(201).json({
      message: 'Driver registered successfully',
      driver: {
        id: result.driver.id,
        user: {
          id: result.user.id,
          email: result.user.email,
          phone: result.user.phone,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
        },
        licenseNumber: result.driver.licenseNumber,
        vehicleType: result.driver.vehicleType,
        vehicleModel: result.driver.vehicleModel,
        vehiclePlate: result.driver.vehiclePlate,
        vehicleColor: result.driver.vehicleColor,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get all drivers
 */
export const getDrivers = async (req: AuthRequest, res: Response) => {
  try {
    const { status, isAvailable, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              firstName: true,
              lastName: true,
              isActive: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.driver.count({ where }),
    ]);

    res.json({
      drivers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get driver by ID
 */
export const getDriverById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        },
      },
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    res.json({ driver });
  } catch (error) {
    throw error;
  }
};

/**
 * Update driver location
 */
export const updateDriverLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      throw new AppError('Latitude and longitude are required', 400);
    }

    // Get driver from authenticated user
    const driver = await prisma.driver.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!driver) {
      throw new AppError('Driver profile not found', 404);
    }

    // Update location
    const updatedDriver = await prisma.driver.update({
      where: { id: driver.id },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
        lastLocationUpdate: new Date(),
      },
    });

    res.json({
      message: 'Location updated successfully',
      location: {
        latitude: updatedDriver.currentLatitude,
        longitude: updatedDriver.currentLongitude,
        updatedAt: updatedDriver.lastLocationUpdate,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Update driver status
 */
export const updateDriverStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;

    if (!['OFFLINE', 'AVAILABLE', 'BUSY'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!driver) {
      throw new AppError('Driver profile not found', 404);
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: driver.id },
      data: { status },
    });

    logger.info(`Driver ${driver.id} status changed to ${status}`);

    res.json({
      message: 'Status updated successfully',
      status: updatedDriver.status,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get driver orders
 */
export const getDriverOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const where: any = { driverId: id };
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          customer: {
            include: { user: true },
          },
          pickupAddress: true,
          dropoffAddress: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get available orders for driver to accept
 */
export const getAvailableOrders = async (req: AuthRequest, res: Response) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!driver) {
      throw new AppError('Driver profile not found', 404);
    }

    // Get pending orders near driver's current location
    const orders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        driverId: null,
      },
      include: {
        customer: {
          include: { user: true },
        },
        pickupAddress: true,
        dropoffAddress: true,
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    res.json({ orders });
  } catch (error) {
    throw error;
  }
};

/**
 * Accept order (driver accepts an available order)
 */
export const acceptOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      throw new AppError('Order ID is required', 400);
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: req.user!.userId },
      include: { user: true },
    });

    if (!driver) {
      throw new AppError('Driver profile not found', 404);
    }

    // Check if driver is available
    if (driver.status !== 'AVAILABLE') {
      throw new AppError('Driver is not available', 400);
    }

    // Get order and check if still available
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { include: { user: true } },
        pickupAddress: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status !== 'PENDING' || order.driverId) {
      throw new AppError('Order is no longer available', 400);
    }

    // Update order and driver status in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          driverId: driver.id,
          status: 'ASSIGNED',
        },
        include: {
          customer: { include: { user: true } },
          driver: { include: { user: true } },
          pickupAddress: true,
          dropoffAddress: true,
        },
      });

      await tx.driver.update({
        where: { id: driver.id },
        data: { status: 'BUSY' },
      });

      await tx.trackingEvent.create({
        data: {
          orderId,
          status: 'ASSIGNED',
          description: `Driver ${driver.user.firstName} ${driver.user.lastName} accepted order`,
        },
      });

      return updatedOrder;
    });

    logger.info(`Driver ${driver.id} accepted order ${order.orderNumber}`);

    res.json({
      message: 'Order accepted successfully',
      order: result,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get driver statistics
 */
export const getDriverStats = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        orders: true,
      },
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    const totalOrders = driver.orders.length;
    const completedOrders = driver.orders.filter((o) => o.status === 'DELIVERED').length;
    const cancelledOrders = driver.orders.filter((o) => o.status === 'CANCELLED').length;
    const totalEarnings = driver.orders
      .filter((o) => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + (o.finalPrice || o.estimatedPrice), 0);

    res.json({
      stats: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        totalEarnings,
        rating: driver.rating,
        totalDeliveries: driver.totalDeliveries,
      },
    });
  } catch (error) {
    throw error;
  }
};
