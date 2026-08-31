const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create a review (Student only)
// @route   POST /api/reviews
// @access  Private (Student only)
const createReview = async (req, res) => {
  try {
    const { propertyId, bookingId, rating, comment } = req.body;

    // Check if user is student
    if (req.user.role !== 'student') {
      return errorResponse(res, 403, 'Only students can write reviews');
    }

    // Check if booking exists and belongs to this student
    const booking = await Booking.findOne({
      _id: bookingId,
      studentId: req.user._id,
    });

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found or you are not authorized');
    }

    // Check if booking is completed
    if (booking.status !== 'completed' && booking.status !== 'confirmed') {
      return errorResponse(res, 400, 'You can only review completed or confirmed bookings');
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return errorResponse(res, 400, 'You have already reviewed this booking');
    }

    // Create review
    const review = await Review.create({
      studentId: req.user._id,
      propertyId,
      bookingId,
      rating,
      comment,
      isVerified: booking.status === 'completed',
    });

    // Update property average rating
    const allReviews = await Review.find({ propertyId });
    const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await Property.findByIdAndUpdate(propertyId, {
      averageRating: averageRating.toFixed(1),
      totalReviews: allReviews.length,
    });

    // Update landlord rating
    const property = await Property.findById(propertyId);
    const landlordReviews = await Review.find({ propertyId })
      .populate('propertyId', 'landlordId');
    
    const landlordProperties = await Property.find({ landlordId: property.landlordId });
    const landlordPropertyIds = landlordProperties.map(p => p._id);
    
    const allLandlordReviews = await Review.find({
      propertyId: { $in: landlordPropertyIds },
    });
    
    const landlordTotalRating = allLandlordReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const landlordAverageRating = landlordTotalRating / (allLandlordReviews.length || 1);
    
    await User.findByIdAndUpdate(property.landlordId, {
      rating: landlordAverageRating.toFixed(1),
    });

    return successResponse(res, 201, 'Review submitted successfully', review);
  } catch (error) {
    console.error('Create review error:', error);
    return errorResponse(res, 500, 'Server error while creating review', error);
  }
};

// @desc    Get reviews for a property
// @route   GET /api/reviews/property/:propertyId
// @access  Public
const getPropertyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Review.countDocuments({
      propertyId: req.params.propertyId,
    });

    const reviews = await Review.find({
      propertyId: req.params.propertyId,
    })
      .populate('studentId', 'name profilePhoto')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(total / parseInt(limit));

    return successResponse(res, 200, 'Reviews fetched successfully', {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get property reviews error:', error);
    return errorResponse(res, 500, 'Server error while fetching reviews', error);
  }
};

// @desc    Get student's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private (Student only)
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ studentId: req.user._id })
      .populate('propertyId', 'name address photos')
      .sort('-createdAt');

    return successResponse(res, 200, 'Your reviews fetched successfully', reviews);
  } catch (error) {
    console.error('Get my reviews error:', error);
    return errorResponse(res, 500, 'Server error while fetching reviews', error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Student only)
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return errorResponse(res, 404, 'Review not found');
    }

    // Check if user owns this review
    if (review.studentId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'You are not authorized to update this review');
    }

    // Update review
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    // Recalculate property average rating
    const allReviews = await Review.find({ propertyId: review.propertyId });
    const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await Property.findByIdAndUpdate(review.propertyId, {
      averageRating: averageRating.toFixed(1),
    });

    return successResponse(res, 200, 'Review updated successfully', review);
  } catch (error) {
    console.error('Update review error:', error);
    return errorResponse(res, 500, 'Server error while updating review', error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Student/Admin)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return errorResponse(res, 404, 'Review not found');
    }

    // Check authorization
    if (review.studentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'You are not authorized to delete this review');
    }

    const propertyId = review.propertyId;
    await review.remove();

    // Recalculate property average rating
    const allReviews = await Review.find({ propertyId });
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
      const averageRating = totalRating / allReviews.length;
      await Property.findByIdAndUpdate(propertyId, {
        averageRating: averageRating.toFixed(1),
        totalReviews: allReviews.length,
      });
    } else {
      await Property.findByIdAndUpdate(propertyId, {
        averageRating: 0,
        totalReviews: 0,
      });
    }

    return successResponse(res, 200, 'Review deleted successfully');
  } catch (error) {
    console.error('Delete review error:', error);
    return errorResponse(res, 500, 'Server error while deleting review', error);
  }
};

// @desc    Get review stats for admin
// @route   GET /api/reviews/stats
// @access  Private (Admin only)
const getReviewStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Only admin can view stats');
    }

    const totalReviews = await Review.countDocuments();
    const averageRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    // Rating distribution
    const ratingDistribution = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return successResponse(res, 200, 'Review stats fetched', {
      totalReviews,
      averageRating: averageRating[0]?.avgRating || 0,
      ratingDistribution,
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    return errorResponse(res, 500, 'Server error while fetching stats', error);
  }
};

module.exports = {
  createReview,
  getPropertyReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getReviewStats,
};