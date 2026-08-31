const crypto = require('crypto');

const generateOTP = () => {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

const generateOTPExpiry = () => {
  // OTP expires in 10 minutes
  return new Date(Date.now() + 10 * 60 * 1000);
};

const generateToken = () => {
  // Generate secure random token for password reset etc.
  return crypto.randomBytes(32).toString('hex');
};

module.exports = { generateOTP, generateOTPExpiry, generateToken };