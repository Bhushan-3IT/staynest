const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');

const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getPropertiesByLandlord,
  getMyProperties,
  verifyProperty,
  getPropertyStats,
} = require('../controllers/propertyController');

// ✅ Specific routes FIRST (no :id parameter)
router.get('/', getProperties);
router.get('/my-properties', protect, authorize('landlord', 'admin'), getMyProperties);
router.get('/landlord/:landlordId', getPropertiesByLandlord);
router.get('/stats', protect, authorize('admin'), getPropertyStats);

// ✅ THEN the dynamic route with :id
router.get('/:id', getPropertyById);

// ✅ Protected routes
router.use(protect);

router.post(
  '/',
  authorize('landlord', 'admin'),
  uploadMultiple('propertyPhotos', 5),
  handleUploadError,
  createProperty
);

router.put('/:id', authorize('landlord', 'admin'), uploadMultiple('propertyPhotos', 5), handleUploadError, updateProperty);
router.delete('/:id', authorize('landlord', 'admin'), deleteProperty);

// Admin routes
router.put('/:id/verify', authorize('admin'), verifyProperty);

module.exports = router;