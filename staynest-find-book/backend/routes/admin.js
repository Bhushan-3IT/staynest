const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  // Landlord Verification
  verifyLandlord,
  getPendingLandlords,
  getAllLandlords,
  
  // Property Verification
  verifyProperty,
  getPendingProperties,
  
  // Student Safety
  getOffCampusStudents,
  sendEmergencyAlert,
  getStudentDetails,
  
  // Payments & Escrow
  getEscrowTransactions,
  releasePayment,
  getDisputes,
  resolveDispute,
  
  // Complaints
  getComplaints,
  resolveComplaint,
  
  // Dashboard Stats
  getAdminStats,
  getRecentActivity,
} = require('../controllers/adminController');

// All routes require admin authentication
router.use(protect, authorize('admin'));

// ============================================
// LANDLORD VERIFICATION
// ============================================
router.get('/landlords/pending', getPendingLandlords);
router.get('/landlords/all', getAllLandlords);
router.put('/landlords/:id/verify', verifyLandlord);

// ============================================
// PROPERTY VERIFICATION
// ============================================
router.get('/properties/pending', getPendingProperties);
router.put('/properties/:id/verify', verifyProperty);

// ============================================
// STUDENT SAFETY
// ============================================
router.get('/students/off-campus', getOffCampusStudents);
router.get('/students/:id', getStudentDetails);
router.post('/students/emergency-alert', sendEmergencyAlert);

// ============================================
// PAYMENTS & ESCROW
// ============================================
router.get('/payments/escrow', getEscrowTransactions);
router.put('/payments/:id/release', releasePayment);
router.get('/payments/disputes', getDisputes);
router.put('/payments/:id/resolve', resolveDispute);

// ============================================
// COMPLAINTS
// ============================================
router.get('/complaints', getComplaints);
router.put('/complaints/:id/resolve', resolveComplaint);

// ============================================
// DASHBOARD STATS
// ============================================
router.get('/stats', getAdminStats);
router.get('/activity', getRecentActivity);

module.exports = router;