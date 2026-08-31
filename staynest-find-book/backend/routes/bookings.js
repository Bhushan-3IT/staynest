const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  createBooking,
  getStudentBookings,
  getLandlordBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
  autoCancelPendingBookings,
  createPaymentOrder,
} = require('../controllers/bookingController');

// Protected routes
router.use(protect);

// Student routes
router.post('/', authorize('student'), createBooking);
router.get('/student', authorize('student'), getStudentBookings);
router.post('/create-order', authorize('student'), createPaymentOrder);
router.delete('/:id/cancel', authorize('student'), cancelBooking);

// Landlord routes
router.get('/landlord', authorize('landlord'), getLandlordBookings);
router.put('/:id/status', authorize('landlord', 'admin'), updateBookingStatus);

// Admin routes
router.get('/admin', authorize('admin'), getAllBookings);
router.get('/admin/stats', authorize('admin'), getBookingStats);
router.get('/admin/auto-cancel', authorize('admin'), autoCancelPendingBookings);

module.exports = router;