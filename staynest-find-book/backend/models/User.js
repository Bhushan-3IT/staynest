const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add your name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please add your email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email',
        ],
        // ✅ REMOVED the strict SGGS validation from model level
        // We handle it in the controller based on role
      },
      
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Please add your phone number'],
      match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number'],
    },
    role: {
      type: String,
      enum: ['student', 'landlord', 'admin'],
      default: 'student',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // ✅ NEW: Track if student is SGGS verified
    isSGGSVerified: {
      type: Boolean,
      default: false,
    },
    collegeName: {
      type: String,
      required: function () {
        return this.role === 'student';
      },
      default: 'SGGS Nanded',
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    // Landlord fields
    totalProperties: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    // Student fields
    savedProperties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
    // Landlord Verification
    landlordVerification: {
      isVerified: { 
        type: Boolean, 
        default: false 
      },
      verifiedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      },
      verifiedAt: { 
        type: Date 
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      remarks: { 
        type: String 
      },
    },
    // Student Safety Fields
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
    currentAddress: {
      propertyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Property' 
      },
      roomNumber: { type: String },
      moveInDate: { type: Date },
      isCurrentlyStaying: { 
        type: Boolean, 
        default: false 
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password middleware
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);