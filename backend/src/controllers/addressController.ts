import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * Create a new address
 */
export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const {
      label,
      street,
      city,
      state,
      postalCode,
      latitude,
      longitude,
      contactName,
      contactPhone,
      isDefault,
    } = req.body;

    if (!street || !city || !latitude || !longitude) {
      throw new AppError('Required fields: street, city, latitude, longitude', 400);
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!customer) {
      throw new AppError('Customer profile not found', 404);
    }

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        customerId: customer.id,
        label,
        street,
        city,
        state,
        postalCode,
        latitude,
        longitude,
        contactName,
        contactPhone,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json({
      message: 'Address created successfully',
      address,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get all addresses for customer
 */
export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!customer) {
      throw new AppError('Customer profile not found', 404);
    }

    const addresses = await prisma.address.findMany({
      where: { customerId: customer.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ addresses });
  } catch (error) {
    throw error;
  }
};

/**
 * Update address
 */
export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const customer = await prisma.customer.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!customer) {
      throw new AppError('Customer profile not found', 404);
    }

    // Verify address belongs to customer
    const address = await prisma.address.findFirst({
      where: { id, customerId: customer.id },
    });

    if (!address) {
      throw new AppError('Address not found', 404);
    }

    // If setting as default, remove default from others
    if (updateData.isDefault) {
      await prisma.address.updateMany({
        where: { customerId: customer.id, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'Address updated successfully',
      address: updatedAddress,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Delete address
 */
export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!customer) {
      throw new AppError('Customer profile not found', 404);
    }

    // Verify address belongs to customer
    const address = await prisma.address.findFirst({
      where: { id, customerId: customer.id },
    });

    if (!address) {
      throw new AppError('Address not found', 404);
    }

    await prisma.address.delete({
      where: { id },
    });

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    throw error;
  }
};
