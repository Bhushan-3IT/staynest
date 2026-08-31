const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  createReview,
  getPropertyReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getReviewStats,
} = require('../controllers/reviewController');

// Public routes
router.get('/property/:propertyId', getPropertyReviews);

// Protected routes
router.use(protect);

// Student routes
router.post('/', authorize('student'), createReview);
router.get('/my-reviews', authorize('student'), getMyReviews);
router.put('/:id', authorize('student'), updateReview);
router.delete('/:id', authorize('student', 'admin'), deleteReview);

// Admin routes
router.get('/admin/stats', authorize('admin'), getReviewStats);

module.exports = router;