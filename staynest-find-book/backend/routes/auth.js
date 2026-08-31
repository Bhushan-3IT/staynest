const express = require('express');
const router = express.Router();
const { protect, authorize, isVerified } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

const {
  register,
  verifyOTP,
  resendOTP,
  login,
  getMe,
  updateProfile,
  uploadProfilePhoto,
  changePassword,
  saveProperty,
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect);

router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/me', getMe);
router.put('/update-profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/upload-photo', uploadSingle('profilePhoto'), handleUploadError, uploadProfilePhoto);
router.post('/save-property/:propertyId', saveProperty);

module.exports = router;