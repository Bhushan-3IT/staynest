const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const razorpay = require('../config/razorpay');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

// @desc    Create a booking (Student)
// @route   POST /api/bookings
// @access  Private (Student only)
const createBooking = async (req, res) => {
  try {
    const { propertyId, roomType, moveInDate } = req.body;

    // Check if user is student
    if (req.user.role !== 'student') {
      return errorResponse(res, 403, 'Only students can create bookings');
    }

    // Check if user is verified
    if (!req.user.isVerified) {
      return errorResponse(res, 403, 'Please verify your email before booking');
    }

    // Get property
    const property = await Property.findById(propertyId);
    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }

    // Check if property is active
    if (!property.isActive) {
      return errorResponse(res, 400, 'Property is not available');
    }

    // Find room type
    const roomTypeData = property.roomTypes.find(rt => rt.type === roomType);
    if (!roomTypeData) {
      return errorResponse(res, 404, 'Room type not found');
    }

    // Check availability
    if (roomTypeData.availableRooms < 1) {
      return errorResponse(res, 400, 'No rooms available for this room type');
    }

    // Calculate booking amount (50% of monthly rent)
    const bookingAmount = roomTypeData.price * 0.5;
    const totalRent = roomTypeData.price;

    // Check if student already has a pending booking for this property
    const existingBooking = await Booking.findOne({
      studentId: req.user._id,
      propertyId,
      status: 'pending',
    });

    if (existingBooking) {
      return errorResponse(res, 400, 'You already have a pending booking for this property');
    }

    // ✅ FIX: Create booking WITHOUT paymentId (we'll add later)
    const booking = await Booking.create({
      studentId: req.user._id,
      propertyId,
      roomType,
      moveInDate: new Date(moveInDate),
      bookingAmount,
      totalRent,
      paymentId: 'pending_' + Date.now(), // Temporary
      paymentOrderId: 'order_' + Date.now(), // Temporary
      status: 'pending',
    });

    // ✅ FIX: Update room availability
    await Property.findByIdAndUpdate(propertyId, {
      $inc: { 'roomTypes.$[elem].availableRooms': -1 }
    }, {
      arrayFilters: [{ 'elem.type': roomType }]
    });

    // Send email notification to landlord
    try {
      const landlord = await User.findById(property.landlordId);
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4F46E5;">New Booking Request! 📋</h2>
          <p>You have received a new booking request for your property.</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Student:</strong> ${req.user.name}</p>
            <p><strong>Email:</strong> ${req.user.email}</p>
            <p><strong>Phone:</strong> ${req.user.phone}</p>
            <p><strong>Property:</strong> ${property.name}</p>
            <p><strong>Room Type:</strong> ${roomType}</p>
            <p><strong>Move-in Date:</strong> ${new Date(moveInDate).toLocaleDateString()}</p>
          </div>
          <p>Please login to your dashboard to accept or reject this booking.</p>
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">StayNest - SGGS Nanded</p>
        </div>
      `;
      
      await sendEmail({
        email: landlord.email,
        subject: 'New Booking Request - StayNest',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    return successResponse(res, 201, 'Booking created successfully. Waiting for landlord confirmation.', booking);
  } catch (error) {
    console.error('Create booking error:', error);
    return errorResponse(res, 500, 'Server error while creating booking', error);
  }
};

// @desc    Get student's bookings
// @route   GET /api/bookings/student
// @access  Private (Student only)
const getStudentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user._id })
      .populate('propertyId', 'name address photos averageRating')
      .sort('-createdAt');

    return successResponse(res, 200, 'Your bookings fetched successfully', bookings);
  } catch (error) {
    console.error('Get student bookings error:', error);
    return errorResponse(res, 500, 'Server error while fetching bookings', error);
  }
};

// @desc    Get landlord's bookings
// @route   GET /api/bookings/landlord
// @access  Private (Landlord only)
const getLandlordBookings = async (req, res) => {
  try {
    // Get all properties owned by landlord
    const properties = await Property.find({ landlordId: req.user._id });
    const propertyIds = properties.map(p => p._id);

    const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
      .populate('studentId', 'name email phone collegeName')
      .populate('propertyId', 'name address')
      .sort('-createdAt');

    return successResponse(res, 200, 'Booking requests fetched successfully', bookings);
  } catch (error) {
    console.error('Get landlord bookings error:', error);
    return errorResponse(res, 500, 'Server error while fetching bookings', error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/admin
// @access  Private (Admin only)
const getAllBookings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Only admin can view all bookings');
    }

    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .populate('studentId', 'name email phone')
      .populate('propertyId', 'name address landlordId')
      .populate({
        path: 'propertyId',
        populate: {
          path: 'landlordId',
          select: 'name email',
        },
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(total / parseInt(limit));

    return successResponse(res, 200, 'All bookings fetched', {
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    return errorResponse(res, 500, 'Server error while fetching bookings', error);
  }
};

// @desc    Update booking status (Landlord/Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private (Landlord/Admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('propertyId', 'name address landlordId');

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    // Check if user is the landlord of this property or admin
    if (booking.propertyId.landlordId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'You are not authorized to update this booking');
    }

    // Check if booking is already processed
    if (booking.status !== 'pending') {
      return errorResponse(res, 400, `Booking is already ${booking.status}`);
    }

    // Validate status transition
    const validStatuses = ['confirmed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, 'Invalid status');
    }

    // Update booking
    booking.status = status;
    booking.landlordResponseDate = new Date();
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }
    await booking.save();

    // ✅ FIX: If rejected, restore room availability
    if (status === 'rejected') {
      await Property.findByIdAndUpdate(booking.propertyId._id, {
        $inc: { 'roomTypes.$[elem].availableRooms': 1 }
      }, {
        arrayFilters: [{ 'elem.type': booking.roomType }]
      });
    }

    // Send email notification to student
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: ${status === 'confirmed' ? '#22c55e' : '#ef4444'};">
            Booking ${status === 'confirmed' ? 'Confirmed' : 'Rejected'} 🎉
          </h2>
          <p>Dear ${booking.studentId.name},</p>
          <p>Your booking at <strong>${booking.propertyId.name}</strong> has been ${status}.</p>
          ${cancellationReason ? `<p><strong>Reason:</strong> ${cancellationReason}</p>` : ''}
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">StayNest - SGGS Nanded</p>
        </div>
      `;
      
      await sendEmail({
        email: booking.studentId.email,
        subject: `Booking ${status} - StayNest`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    return successResponse(res, 200, `Booking ${status} successfully`, booking);
  } catch (error) {
    console.error('Update booking status error:', error);
    return errorResponse(res, 500, 'Server error while updating booking', error);
  }
};

// @desc    Cancel booking (Student)
// @route   DELETE /api/bookings/:id/cancel
// @access  Private (Student only)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('propertyId', 'name address landlordId');

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    // Check if user is the student who made the booking
    if (booking.studentId._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'You are not authorized to cancel this booking');
    }

    // Check if booking can be cancelled
    if (booking.status === 'confirmed') {
      return errorResponse(res, 400, 'Confirmed bookings cannot be cancelled. Please contact the landlord.');
    }

    if (booking.status === 'completed') {
      return errorResponse(res, 400, 'Completed bookings cannot be cancelled');
    }

    if (booking.status === 'cancelled' || booking.status === 'rejected') {
      return errorResponse(res, 400, `Booking is already ${booking.status}`);
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancellationReason = 'Cancelled by student';
    await booking.save();

    // Process refund
    try {
      booking.refundStatus = 'processed';
      await booking.save();
    } catch (refundError) {
      console.error('Refund processing failed:', refundError);
      booking.refundStatus = 'failed';
      await booking.save();
    }

    return successResponse(res, 200, 'Booking cancelled successfully', booking);
  } catch (error) {
    console.error('Cancel booking error:', error);
    return errorResponse(res, 500, 'Server error while cancelling booking', error);
  }
};




// @desc    Get booking stats (Admin)
// @route   GET /api/bookings/stats
// @access  Private (Admin only)
const getBookingStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Only admin can view stats');
    }

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Calculate total revenue (confirmed bookings only)
    const confirmedBookingsData = await Booking.find({ status: 'confirmed' });
    const totalRevenue = confirmedBookingsData.reduce(
      (sum, booking) => sum + booking.totalRent,
      0
    );

    // Get monthly bookings (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalRent' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return successResponse(res, 200, 'Booking stats fetched', {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      monthlyData,
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    return errorResponse(res, 500, 'Server error while fetching stats', error);
  }
};

// @desc    Auto-cancel pending bookings (Cron job)
// @route   GET /api/bookings/auto-cancel
// @access  Private (Admin only)
const autoCancelPendingBookings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Only admin can trigger auto-cancel');
    }

    const pendingBookings = await Booking.find({
      status: 'pending',
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).populate('studentId', 'name email propertyId');

    let cancelledCount = 0;

    for (const booking of pendingBookings) {
      booking.status = 'cancelled';
      booking.cancellationReason = 'Auto-cancelled - Landlord did not respond within 24 hours';
      await booking.save();

      // Restore room availability
      await Property.findByIdAndUpdate(booking.propertyId, {
        $inc: { 'roomTypes.$[elem].availableRooms': 1 }
      }, {
        arrayFilters: [{ 'elem.type': booking.roomType }]
      });

      cancelledCount++;
    }

    return successResponse(res, 200, `Auto-cancelled ${cancelledCount} bookings`, {
      totalProcessed: pendingBookings.length,
      cancelledCount,
    });
  } catch (error) {
    console.error('Auto-cancel bookings error:', error);
    return errorResponse(res, 500, 'Server error while auto-cancelling bookings', error);
  }
};


// @desc    Create Razorpay order
// @route   POST /api/bookings/create-order
// @access  Private (Student only)
const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount || amount < 1) {
      return errorResponse(res, 400, 'Please provide a valid amount');
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    return successResponse(res, 201, 'Payment order created', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    return errorResponse(res, 500, 'Server error while creating payment order', error);
  }
};

module.exports = {
  createBooking,
  getStudentBookings,
  getLandlordBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
  autoCancelPendingBookings,
  createPaymentOrder,
};