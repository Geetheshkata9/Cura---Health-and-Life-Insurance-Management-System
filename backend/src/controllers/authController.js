import { auth } from "../config/auth.js";
import User from "../models/User.js";

// @desc    Register a new user (via Better Auth)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    const response = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        role: role || 'customer',
        phone,
        address,
      },
      asResponse: true,
      returnHeaders: true,
    });

    // Copy cookies to the Express response to preserve session on client
    const setCookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
    if (setCookies.length > 0) {
      res.setHeader('Set-Cookie', setCookies);
    }

    const data = await response.json();
    
    if (!response.ok) {
      res.status(response.status || 400);
      throw new Error(data.message || 'Registration failed');
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user (via Better Auth)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      asResponse: true,
      returnHeaders: true,
    });

    // Copy cookies to the Express response
    const setCookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
    if (setCookies.length > 0) {
      res.setHeader('Set-Cookie', setCookies);
    }

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status || 401);
      throw new Error(data.message || 'Login failed');
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile data
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with customer role
// @route   GET /api/auth/customers
// @access  Private
export const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('name email _id');
    res.status(200).json(customers);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, image } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (image !== undefined) user.image = image;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

