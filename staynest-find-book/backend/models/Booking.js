const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    roomType: {
      type: String,
      enum: ['Single', 'Double', 'Triple', 'Dormitory'],
      required: true,
    },
    moveInDate: {
      type: Date,
      required: true,
    },
    moveOutDate: {
      type: Date,
    },
    bookingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalRent: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentId: {
      type: String,
      required: true,
    },
    paymentOrderId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    landlordResponseDate: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed', 'not_applicable'],
      default: 'not_applicable',
    },
    refundId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically cancel booking if landlord doesn't respond in 24 hours
bookingSchema.methods.autoCancel = async function () {
  if (this.status === 'pending') {
    const timeElapsed = Date.now() - this.createdAt.getTime();
    const hoursElapsed = timeElapsed / (1000 * 60 * 60);
    if (hoursElapsed >= 24) {
      this.status = 'cancelled';
      this.cancellationReason = 'Auto-cancelled - Landlord did not respond within 24 hours';
      await this.save();
      return true;
    }
  }
  return false;
};

module.exports = mongoose.model('Booking', bookingSchema);