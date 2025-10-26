import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!email || !phone || !password || !firstName || !lastName) {
      throw new AppError('All fields are required', 400);
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'CUSTOMER',
      },
    });

    // Create associated profile
    if (user.role === 'CUSTOMER') {
      await prisma.customer.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        customer: true,
        driver: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`User logged in: ${user.email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        customerId: user.customer?.id,
        driverId: user.driver?.id,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customer: {
          include: {
            addresses: true,
          },
        },
        driver: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        customer: user.customer,
        driver: user.driver,
      },
    });
  } catch (error) {
    throw error;
  }
};
