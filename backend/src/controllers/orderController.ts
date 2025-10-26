import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import smsService from '../services/smsService';
import logger from '../utils/logger';

/**
 * Calculate estimated price based on distance
 */
const calculatePrice = (distance: number): number => {
  // Base price + per km rate
  const basePrice = 20; // BWP
  const perKmRate = 5; // BWP per km
  return basePrice + (distance * perKmRate);
};

/**
 * Generate unique order number
 */
const generateOrderNumber = (): string => {
  const prefix = 'BWC'; // Botswana Courier
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

/**
 * Create a new order
 */
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      pickupAddressId,
      dropoffAddressId,
      packageDescription,
      packageWeight,
      specialInstructions,
      scheduledPickupTime,
    } = req.body;

    // Validate required fields
    if (!pickupAddressId || !dropoffAddressId) {
      throw new AppError('Pickup and dropoff addresses are required', 400);
    }

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user!.userId },
      include: { user: true },
    });

    if (!customer) {
      throw new AppError('Customer profile not found', 404);
    }

    // Get addresses
    const pickupAddress = await prisma.address.findUnique({
      where: { id: pickupAddressId },
    });

    const dropoffAddress = await prisma.address.findUnique({
      where: { id: dropoffAddressId },
    });

    if (!pickupAddress || !dropoffAddress) {
      throw new AppError('Invalid addresses', 404);
    }

    // Calculate distance (simplified - in production use Google Distance Matrix API)
    const distance = calculateDistance(
      pickupAddress.latitude,
      pickupAddress.longitude,
      dropoffAddress.latitude,
      dropoffAddress.longitude
    );

    const estimatedPrice = calculatePrice(distance);
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        pickupAddressId,
        dropoffAddressId,
        packageDescription,
        packageWeight,
        specialInstructions,
        estimatedPrice,
        distance,
        scheduledPickupTime: scheduledPickupTime ? new Date(scheduledPickupTime) : null,
        status: 'PENDING',
      },
      include: {
        pickupAddress: true,
        dropoffAddress: true,
        customer: {
          include: { user: true },
        },
      },
    });

    // Create tracking event
    await prisma.trackingEvent.create({
      data: {
        orderId: order.id,
        status: 'PENDING',
        description: 'Order created',
      },
    });

    // Send SMS confirmation
    const estimatedTime = scheduledPickupTime || 'within 1 hour';
    await smsService.sendOrderConfirmation(
      customer.user.phone,
      orderNumber,
      estimatedTime.toString()
    );

    logger.info(`Order created: ${orderNumber}`);

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get all orders (with filters)
 */
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, customerId, driverId, page = 1, limit = 20 } = req.query;

    const where: any = {};

    // Filter by role
    if (req.user!.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({
        where: { userId: req.user!.userId },
      });
      where.customerId = customer?.id;
    } else if (req.user!.role === 'DRIVER') {
      const driver = await prisma.driver.findUnique({
        where: { userId: req.user!.userId },
      });
      where.driverId = driver?.id;
    }

    // Additional filters
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (driverId) where.driverId = driverId;

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
          driver: {
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
 * Get order by ID
 */
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          include: { user: true },
        },
        driver: {
          include: { user: true },
        },
        pickupAddress: true,
        dropoffAddress: true,
        trackingEvents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check authorization
    if (req.user!.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({
        where: { userId: req.user!.userId },
      });
      if (order.customerId !== customer?.id) {
        throw new AppError('Unauthorized', 403);
      }
    } else if (req.user!.role === 'DRIVER') {
      const driver = await prisma.driver.findUnique({
        where: { userId: req.user!.userId },
      });
      if (order.driverId !== driver?.id) {
        throw new AppError('Unauthorized', 403);
      }
    }

    res.json({ order });
  } catch (error) {
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, latitude, longitude, proofOfDelivery } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true } },
        driver: { include: { user: true } },
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        actualPickupTime: status === 'PICKED_UP' ? new Date() : order.actualPickupTime,
        actualDeliveryTime: status === 'DELIVERED' ? new Date() : order.actualDeliveryTime,
        proofOfDelivery: proofOfDelivery || order.proofOfDelivery,
      },
      include: {
        customer: { include: { user: true } },
        driver: { include: { user: true } },
        pickupAddress: true,
        dropoffAddress: true,
      },
    });

    // Create tracking event
    await prisma.trackingEvent.create({
      data: {
        orderId: id,
        status,
        latitude,
        longitude,
        description: `Order status updated to ${status}`,
      },
    });

    // Send SMS notifications
    if (status === 'PICKED_UP') {
      await smsService.sendPickupNotification(
        order.customer.user.phone,
        order.orderNumber
      );
    } else if (status === 'DELIVERED') {
      await smsService.sendDeliveryCompleted(
        order.customer.user.phone,
        order.orderNumber
      );
    }

    logger.info(`Order ${order.orderNumber} status updated to ${status}`);

    res.json({
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Assign driver to order
 */
export const assignDriver = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      throw new AppError('Driver ID is required', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true } },
        pickupAddress: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { user: true },
    });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        driverId,
        status: 'ASSIGNED',
      },
      include: {
        customer: { include: { user: true } },
        driver: { include: { user: true } },
        pickupAddress: true,
        dropoffAddress: true,
      },
    });

    // Create tracking event
    await prisma.trackingEvent.create({
      data: {
        orderId: id,
        status: 'ASSIGNED',
        description: `Driver ${driver.user.firstName} ${driver.user.lastName} assigned`,
      },
    });

    // Send SMS notifications
    await smsService.sendDriverAssigned(
      order.customer.user.phone,
      order.orderNumber,
      `${driver.user.firstName} ${driver.user.lastName}`
    );

    await smsService.sendNewOrderToDriver(
      driver.user.phone,
      order.orderNumber,
      `${order.pickupAddress.street}, ${order.pickupAddress.city}`
    );

    logger.info(`Driver ${driver.user.firstName} assigned to order ${order.orderNumber}`);

    res.json({
      message: 'Driver assigned successfully',
      order: updatedOrder,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true } },
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if order can be cancelled
    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new AppError('Order cannot be cancelled', 400);
    }

    // Update order
    await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Create tracking event
    await prisma.trackingEvent.create({
      data: {
        orderId: id,
        status: 'CANCELLED',
        description: 'Order cancelled',
      },
    });

    logger.info(`Order ${order.orderNumber} cancelled`);

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    throw error;
  }
};

/**
 * Calculate distance between two points (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
