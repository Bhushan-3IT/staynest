const User = require('../models/User');
const Property = require('../models/Property');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');
const Booking = require('../models/Booking');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

// ============================================
// LANDLORD VERIFICATION
// ============================================

// @desc    Get all pending landlords
// @route   GET /api/admin/landlords/pending
const getPendingLandlords = async (req, res) => {
  try {
    const landlords = await User.find({
      role: 'landlord',
      'landlordVerification.status': 'pending',
    }).select('-password -otp -otpExpiry');

    return successResponse(res, 200, 'Pending landlords fetched', landlords);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch pending landlords', error);
  }
};

// @desc    Get all landlords
// @route   GET /api/admin/landlords/all
const getAllLandlords = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { role: 'landlord' };
    if (status) {
      filter['landlordVerification.status'] = status;
    }

    const landlords = await User.find(filter)
      .select('-password -otp -otpExpiry')
      .populate('landlordVerification.verifiedBy', 'name email');

    return successResponse(res, 200, 'All landlords fetched', landlords);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch landlords', error);
  }
};

// @desc    Verify landlord
// @route   PUT /api/admin/landlords/:id/verify
const verifyLandlord = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const landlord = await User.findById(req.params.id);

    if (!landlord || landlord.role !== 'landlord') {
      return errorResponse(res, 404, 'Landlord not found');
    }

    landlord.landlordVerification = {
      isVerified: status === 'approved',
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      status: status,
      remarks: remarks || '',
    };

    await landlord.save();

    // Send email notification
    try {
      await sendEmail({
        email: landlord.email,
        subject: `SGGS Landlord Verification - ${status.toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: ${status === 'approved' ? '#22c55e' : '#ef4444'}">
              Landlord Verification ${status.toUpperCase()}
            </h2>
            <p>Dear ${landlord.name},</p>
            <p>Your landlord verification has been <strong>${status}</strong>.</p>
            ${remarks ? `<p><strong>Admin Remarks:</strong> ${remarks}</p>` : ''}
            <p>Thank you for choosing SGGS StayNest.</p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">SGGS StayNest - Nanded</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    return successResponse(res, 200, `Landlord ${status} successfully`, landlord);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to verify landlord', error);
  }
};

// ============================================
// PROPERTY VERIFICATION
// ============================================

// @desc    Get pending properties
// @route   GET /api/admin/properties/pending
const getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      isVerified: false,
      isActive: true,
    }).populate('landlordId', 'name email phone');

    return successResponse(res, 200, 'Pending properties fetched', properties);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch pending properties', error);
  }
};

// @desc    Verify property with inspection details
// @route   PUT /api/admin/properties/:id/verify
const verifyProperty = async (req, res) => {
  try {
    const { 
      isVerified, 
      safetyRating, 
      cleanlinessRating, 
      inspectionReport,
      notes,
      safetyFeatures 
    } = req.body;

    const property = await Property.findById(req.params.id);
    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }

    // Update property
    property.isVerified = isVerified;
    property.verificationDetails = {
      isVerified: isVerified,
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      inspectionDate: new Date(),
      safetyRating: safetyRating || 0,
      cleanlinessRating: cleanlinessRating || 0,
      inspectionReport: inspectionReport || '',
      notes: notes || '',
    };
    
    if (safetyFeatures) {
      property.safetyFeatures = safetyFeatures;
    }

    await property.save();

    // Notify landlord
    try {
      const landlord = await User.findById(property.landlordId);
      await sendEmail({
        email: landlord.email,
        subject: `Property Verification ${isVerified ? 'Approved' : 'Rejected'}`,
        html: `
          <div>
            <h2>Property ${isVerified ? 'Verified ✅' : 'Rejected ❌'}</h2>
            <p>Your property "${property.name}" has been ${isVerified ? 'verified' : 'rejected'}.</p>
            ${inspectionReport ? `<p><strong>Report:</strong> ${inspectionReport}</p>` : ''}
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    return successResponse(res, 200, 'Property verification updated', property);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to verify property', error);
  }
};

// ============================================
// STUDENT SAFETY
// ============================================

// @desc    Get all off-campus students
// @route   GET /api/admin/students/off-campus
const getOffCampusStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: 'student',
      'currentAddress.isCurrentlyStaying': true,
    })
      .select('-password -otp -otpExpiry')
      .populate('currentAddress.propertyId', 'name address phone');

    return successResponse(res, 200, 'Off-campus students fetched', students);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch students', error);
  }
};

// @desc    Get student details for safety
// @route   GET /api/admin/students/:id
const getStudentDetails = async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .select('-password -otp -otpExpiry')
      .populate('currentAddress.propertyId', 'name address phone safetyFeatures');

    if (!student || student.role !== 'student') {
      return errorResponse(res, 404, 'Student not found');
    }

    return successResponse(res, 200, 'Student details fetched', student);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch student', error);
  }
};

// @desc    Send emergency alert to all off-campus students
// @route   POST /api/admin/students/emergency-alert
const sendEmergencyAlert = async (req, res) => {
  try {
    const { message, type } = req.body;

    // Get all off-campus students
    const students = await User.find({
      role: 'student',
      'currentAddress.isCurrentlyStaying': true,
    });

    // Send emails/SMS to all students
    for (const student of students) {
      try {
        await sendEmail({
          email: student.email,
          subject: `🚨 EMERGENCY ALERT: ${type || 'SGGS Safety Alert'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #ef4444;">
              <h2 style="color: #ef4444;">🚨 EMERGENCY ALERT</h2>
              <p><strong>Dear SGGS Student,</strong></p>
              <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px;">
                <p style="color: #dc2626;">${message}</p>
              </div>
              <p><strong>Please stay safe and follow instructions.</strong></p>
              <p>Emergency Contact: SGGS Security - 1234567890</p>
              <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
              <p style="color: #666; font-size: 12px;">SGGS StayNest - Nanded</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error(`Failed to send email to ${student.email}:`, emailError);
      }
    }

    // Log the alert
    console.log(`⚠️ Emergency Alert sent to ${students.length} students`);

    return successResponse(res, 200, `Emergency alert sent to ${students.length} students`, {
      totalStudents: students.length,
      message: message,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to send emergency alert', error);
  }
};

// ============================================
// PAYMENTS & ESCROW
// ============================================

// @desc    Get all escrow transactions
// @route   GET /api/admin/payments/escrow
const getEscrowTransactions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.escrowStatus = status;
    }

    const payments = await Payment.find(filter)
      .populate('studentId', 'name email phone')
      .populate('landlordId', 'name email phone')
      .populate('propertyId', 'name address')
      .sort('-createdAt');

    return successResponse(res, 200, 'Escrow transactions fetched', payments);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch transactions', error);
  }
};

// @desc    Release payment from escrow to landlord
// @route   PUT /api/admin/payments/:id/release
const releasePayment = async (req, res) => {
  try {
    const { satisfaction } = req.body;
    const payment = await Payment.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('landlordId', 'name email');

    if (!payment) {
      return errorResponse(res, 404, 'Payment not found');
    }

    if (payment.escrowStatus !== 'held') {
      return errorResponse(res, 400, 'Payment is not in escrow');
    }

    if (satisfaction === true) {
      // Release payment to landlord
      payment.escrowStatus = 'released';
      payment.releaseDate = new Date();
      payment.releasedBy = req.user._id;
      await payment.save();

      // Notify landlord
      try {
        await sendEmail({
          email: payment.landlordId.email,
          subject: `💰 Rent Released - ₹${payment.amount}`,
          html: `
            <div>
              <h2>Payment Released</h2>
              <p>Rent of ₹${payment.amount} has been released to you.</p>
              <p>Student: ${payment.studentId.name}</p>
              <p>Month: ${payment.month}</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      return successResponse(res, 200, 'Payment released successfully', payment);
    } else {
      // Hold payment - create dispute
      payment.paymentStatus = 'disputed';
      payment.dispute.isDisputed = true;
      payment.dispute.reason = req.body.reason || 'Student dissatisfaction reported';
      payment.dispute.raisedBy = req.user._id;
      payment.dispute.raisedAt = new Date();
      await payment.save();

      return successResponse(res, 200, 'Payment held for dispute resolution', payment);
    }
  } catch (error) {
    return errorResponse(res, 500, 'Failed to release payment', error);
  }
};

// @desc    Get all disputes
// @route   GET /api/admin/payments/disputes
const getDisputes = async (req, res) => {
  try {
    const disputes = await Payment.find({
      'dispute.isDisputed': true,
    })
      .populate('studentId', 'name email phone')
      .populate('landlordId', 'name email phone')
      .populate('propertyId', 'name address')
      .sort('-createdAt');

    return successResponse(res, 200, 'Disputes fetched', disputes);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch disputes', error);
  }
};

// @desc    Resolve dispute
// @route   PUT /api/admin/payments/:id/resolve
const resolveDispute = async (req, res) => {
  try {
    const { resolution, action } = req.body; // action: 'release' or 'refund'
    const payment = await Payment.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('landlordId', 'name email');

    if (!payment) {
      return errorResponse(res, 404, 'Payment not found');
    }

    payment.dispute.resolvedBy = req.user._id;
    payment.dispute.resolvedAt = new Date();
    payment.dispute.resolution = resolution;

    if (action === 'release') {
      payment.escrowStatus = 'released';
      payment.paymentStatus = 'released';
      await payment.save();
    } else {
      // refund logic
      payment.paymentStatus = 'refunded';
      payment.escrowStatus = 'released';
      await payment.save();
    }

    return successResponse(res, 200, 'Dispute resolved successfully', payment);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to resolve dispute', error);
  }
};

// ============================================
// COMPLAINTS
// ============================================

// @desc    Get all complaints
// @route   GET /api/admin/complaints
const getComplaints = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const complaints = await Complaint.find(filter)
      .populate('studentId', 'name email phone')
      .populate('landlordId', 'name email')
      .populate('propertyId', 'name address')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    return successResponse(res, 200, 'Complaints fetched', complaints);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch complaints', error);
  }
};

// @desc    Resolve complaint
// @route   PUT /api/admin/complaints/:id/resolve
const resolveComplaint = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return errorResponse(res, 404, 'Complaint not found');
    }

    complaint.status = status || 'resolved';
    complaint.resolution = resolution || '';
    complaint.resolvedAt = new Date();
    complaint.resolvedBy = req.user._id;
    await complaint.save();

    return successResponse(res, 200, 'Complaint resolved', complaint);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to resolve complaint', error);
  }
};

// ============================================
// DASHBOARD STATS
// ============================================

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalLandlords,
      pendingLandlords,
      totalProperties,
      pendingProperties,
      verifiedProperties,
      offCampusStudents,
      escrowBalance,
      totalComplaints,
      openComplaints,
      totalDisputes,
      activeDisputes,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'landlord' }),
      User.countDocuments({ role: 'landlord', 'landlordVerification.status': 'pending' }),
      Property.countDocuments(),
      Property.countDocuments({ isVerified: false }),
      Property.countDocuments({ isVerified: true }),
      User.countDocuments({ role: 'student', 'currentAddress.isCurrentlyStaying': true }),
      Payment.aggregate([
        { $match: { escrowStatus: 'held' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'open' }),
      Payment.countDocuments({ 'dispute.isDisputed': true }),
      Payment.countDocuments({ 'dispute.isDisputed': true, paymentStatus: 'disputed' }),
    ]);

    return successResponse(res, 200, 'Admin stats fetched', {
      students: {
        total: totalStudents,
        offCampus: offCampusStudents,
      },
      landlords: {
        total: totalLandlords,
        pending: pendingLandlords,
      },
      properties: {
        total: totalProperties,
        pending: pendingProperties,
        verified: verifiedProperties,
      },
      escrow: {
        balance: escrowBalance[0]?.total || 0,
      },
      complaints: {
        total: totalComplaints,
        open: openComplaints,
      },
      disputes: {
        total: totalDisputes,
        active: activeDisputes,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch stats', error);
  }
};

// @desc    Get recent activity
// @route   GET /api/admin/activity
const getRecentActivity = async (req, res) => {
  try {
    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort('-createdAt')
      .limit(10)
      .populate('studentId', 'name')
      .populate('propertyId', 'name');

    // Get recent complaints
    const recentComplaints = await Complaint.find()
      .sort('-createdAt')
      .limit(10)
      .populate('studentId', 'name');

    // Get recent property listings
    const recentProperties = await Property.find()
      .sort('-createdAt')
      .limit(10)
      .populate('landlordId', 'name');

    return successResponse(res, 200, 'Recent activity fetched', {
      bookings: recentBookings,
      complaints: recentComplaints,
      properties: recentProperties,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch activity', error);
  }
};

module.exports = {
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
};