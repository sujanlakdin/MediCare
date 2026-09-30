const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

// In-memory fallback user store when MongoDB is disconnected
const inMemoryUsers = [];

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medicare_jwt_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userRole = role && ['caregiver', 'patient'].includes(role.toLowerCase()) ? role.toLowerCase() : 'caregiver';

    // If MongoDB is connected, use Mongoose model
    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const user = await User.create({
        name,
        email: cleanEmail,
        password,
        role: userRole,
        phone: phone || '',
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token: generateToken(user._id),
      });
    } else {
      // Fallback: In-memory store when MongoDB is offline
      console.log('[Auth] MongoDB offline: Registering user in local fallback store');
      const existingUser = inMemoryUsers.find((u) => u.email === cleanEmail);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: 'mem_' + Date.now(),
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: userRole,
        phone: phone || '',
      };

      inMemoryUsers.push(newUser);

      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        token: generateToken(newUser._id),
      });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail });

      if (user && (await user.matchPassword(password))) {
        if (role && user.role !== role.toLowerCase()) {
          return res.status(400).json({
            message: `This account is registered as a ${user.role}. Please select ${user.role} to log in.`,
          });
        }

        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          token: generateToken(user._id),
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      // Fallback: In-memory store when MongoDB is offline
      console.log('[Auth] MongoDB offline: Logging in user from local fallback store');
      const user = inMemoryUsers.find((u) => u.email === cleanEmail);

      if (user && (await bcrypt.compare(password, user.password))) {
        if (role && user.role !== role.toLowerCase()) {
          return res.status(400).json({
            message: `This account is registered as a ${user.role}. Please select ${user.role} to log in.`,
          });
        }

        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          token: generateToken(user._id),
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id).select('-password');
      if (user) {
        return res.json(user);
      }
    } else {
      const user = inMemoryUsers.find((u) => u._id === req.user._id);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      }
    }
    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching user profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
