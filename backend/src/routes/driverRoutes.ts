import { Router } from 'express';
import {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriverLocation,
  updateDriverStatus,
  getDriverOrders,
  getAvailableOrders,
  acceptOrder,
  getDriverStats,
} from '../controllers/driverController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/drivers
 * @desc    Create a new driver
 * @access  Private (Admin)
 */
router.post('/', authenticate, authorize('ADMIN'), createDriver);

/**
 * @route   GET /api/drivers
 * @desc    Get all drivers
 * @access  Private (Admin)
 */
router.get('/', authenticate, authorize('ADMIN'), getDrivers);

/**
 * @route   GET /api/drivers/available-orders
 * @desc    Get available orders for driver
 * @access  Private (Driver)
 */
router.get('/available-orders', authenticate, authorize('DRIVER'), getAvailableOrders);

/**
 * @route   POST /api/drivers/accept-order
 * @desc    Accept an order
 * @access  Private (Driver)
 */
router.post('/accept-order', authenticate, authorize('DRIVER'), acceptOrder);

/**
 * @route   PATCH /api/drivers/location
 * @desc    Update driver location
 * @access  Private (Driver)
 */
router.patch('/location', authenticate, authorize('DRIVER'), updateDriverLocation);

/**
 * @route   PATCH /api/drivers/status
 * @desc    Update driver status
 * @access  Private (Driver)
 */
router.patch('/status', authenticate, authorize('DRIVER'), updateDriverStatus);

/**
 * @route   GET /api/drivers/:id
 * @desc    Get driver by ID
 * @access  Private
 */
router.get('/:id', authenticate, getDriverById);

/**
 * @route   GET /api/drivers/:id/orders
 * @desc    Get driver orders
 * @access  Private
 */
router.get('/:id/orders', authenticate, getDriverOrders);

/**
 * @route   GET /api/drivers/:id/stats
 * @desc    Get driver statistics
 * @access  Private
 */
router.get('/:id/stats', authenticate, getDriverStats);

export default router;
