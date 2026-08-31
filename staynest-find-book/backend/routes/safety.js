const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  calculatePropertySafety,
  getRouteToProperty,
} = require('../controllers/safetyController');

// Public routes
router.get('/route/:propertyId', getRouteToProperty);

// Protected routes
router.use(protect);

// Calculate safety score for property
router.post('/calculate', calculatePropertySafety);

module.exports = router;