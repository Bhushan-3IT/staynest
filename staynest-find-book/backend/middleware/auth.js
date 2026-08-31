const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password -otp -otpExpiry');

      if (!req.user) {
        return errorResponse(res, 401, 'User not found');
      }

      next();
    } catch (error) {
      console.error('Auth Error:', error);
      if (error.name === 'JsonWebTokenError') {
        return errorResponse(res, 401, 'Invalid token');
      }
      if (error.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Token expired');
      }
      return errorResponse(res, 401, 'Not authorized');
    }
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized, no token');
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Not authorized');
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 403, `Role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};

// Check if user is verified (email/OTP verified)
const isVerified = async (req, res, next) => {
  if (!req.user.isVerified) {
    return errorResponse(res, 403, 'Please verify your email first');
  }
  next();
};

module.exports = { protect, authorize, isVerified };