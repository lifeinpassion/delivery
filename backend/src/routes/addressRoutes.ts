import { Router } from 'express';
import {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from '../controllers/addressController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/addresses
 * @desc    Create a new address
 * @access  Private (Customer)
 */
router.post('/', authenticate, authorize('CUSTOMER', 'ADMIN'), createAddress);

/**
 * @route   GET /api/addresses
 * @desc    Get all addresses for customer
 * @access  Private (Customer)
 */
router.get('/', authenticate, authorize('CUSTOMER', 'ADMIN'), getAddresses);

/**
 * @route   PATCH /api/addresses/:id
 * @desc    Update address
 * @access  Private (Customer)
 */
router.patch('/:id', authenticate, authorize('CUSTOMER', 'ADMIN'), updateAddress);

/**
 * @route   DELETE /api/addresses/:id
 * @desc    Delete address
 * @access  Private (Customer)
 */
router.delete('/:id', authenticate, authorize('CUSTOMER', 'ADMIN'), deleteAddress);

export default router;
