const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'upi', 'cash'],
      default: 'razorpay',
    },
    paymentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'held', 'released', 'disputed'],
      default: 'pending',
    },
    escrowStatus: {
      type: String,
      enum: ['pending', 'held', 'released'],
      default: 'pending',
    },
    releaseDate: {
      type: Date,
    },
    releasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    receiptUrl: {
      type: String,
    },
    dispute: {
      isDisputed: { type: Boolean, default: false },
      reason: { type: String },
      raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      raisedAt: { type: Date },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      resolvedAt: { type: Date },
      resolution: { type: String },
      adminNotes: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);