import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  assignDriver,
  cancelOrder,
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private (Customer)
 */
router.post('/', authenticate, authorize('CUSTOMER', 'ADMIN'), createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get all orders (filtered by role)
 * @access  Private
 */
router.get('/', authenticate, getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', authenticate, getOrderById);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Driver, Admin)
 */
router.patch('/:id/status', authenticate, authorize('DRIVER', 'ADMIN'), updateOrderStatus);

/**
 * @route   PATCH /api/orders/:id/assign
 * @desc    Assign driver to order
 * @access  Private (Admin)
 */
router.patch('/:id/assign', authenticate, authorize('ADMIN'), assignDriver);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Cancel order
 * @access  Private (Customer, Admin)
 */
router.delete('/:id', authenticate, authorize('CUSTOMER', 'ADMIN'), cancelOrder);

export default router;
