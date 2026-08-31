const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Single', 'Double', 'Triple', 'Dormitory'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  totalRooms: {
    type: Number,
    required: true,
    min: 1,
  },
  availableRooms: {
    type: Number,
    required: true,
    min: 0,
  },
  isFoodIncluded: {
    type: Boolean,
    default: false,
  },
});

const propertySchema = new mongoose.Schema(
  {
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add property name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add description'],
    },
    address: {
      type: String,
      required: [true, 'Please add address'],
    },
    
    // ✅ UPDATED: Location with Safety Data
    location: {
      lat: { 
        type: Number, 
        required: true 
      },
      lng: { 
        type: Number, 
        required: true 
      },
      // ✅ NEW: Google Maps Place ID
      placeId: { 
        type: String 
      },
      // ✅ NEW: Formatted address from Google Maps
      formattedAddress: { 
        type: String 
      },
      // ✅ NEW: Safety Score (0-10)
      safetyScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
      },
      // ✅ NEW: Safety Level
      safetyLevel: {
        type: String,
        enum: ['Very Safe', 'Safe', 'Moderate', 'Exercise Caution'],
        default: 'Moderate',
      },
      // ✅ NEW: Safety Details
      safetyDetails: {
        policeStationDistance: { 
          type: Number, 
          default: 0 
        },
        streetLighting: { 
          type: Number, 
          default: 0 
        },
        populationDensity: { 
          type: Number, 
          default: 0 
        },
        historicalSafety: { 
          type: Number, 
          default: 0 
        },
        areaType: { 
          type: String,
          enum: ['Vishnupuri', 'CIDCO', 'Taramandal', 'Kailash Nagar', 'Basti Bazar', 'Other'],
          default: 'Other'
        },
        // ✅ NEW: Distance from SGGS College
        distanceFromSGGS: {
          type: Number,
          default: 0,
        },
        // ✅ NEW: Travel time estimates
        travelTime: {
          walking: { type: Number, default: 0 },
          cycling: { type: Number, default: 0 },
          driving: { type: Number, default: 0 },
        },
      },
    },

    collegeName: {
      type: String,
      required: [true, 'Please add nearby college name'],
    },
    distanceFromCollege: {
      type: String,
      required: true,
    },
    photos: {
      type: [String],
      required: [true, 'Please add at least one photo'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    roomTypes: [roomTypeSchema],
    rules: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },

    verificationDetails: {
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
      inspectionDate: { 
        type: Date 
      },
      inspectionReport: { 
        type: String 
      },
      safetyRating: { 
        type: Number, 
        min: 0,
        max: 5,
        default: 0 
      },
      cleanlinessRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      notes: { 
        type: String 
      },
    },

    safetyFeatures: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ✅ NEW: Method to get safety score
propertySchema.methods.getSafetyInfo = function () {
  return {
    score: this.location.safetyScore || 0,
    level: this.location.safetyLevel || 'Moderate',
    details: this.location.safetyDetails || {},
  };
};

// ✅ NEW: Method to get route info from SGGS
propertySchema.methods.getRouteInfo = function () {
  const details = this.location.safetyDetails || {};
  return {
    distance: details.distanceFromSGGS || 0,
    travelTime: details.travelTime || { walking: 0, cycling: 0, driving: 0 },
  };
};

// Update available rooms method
propertySchema.methods.updateAvailability = async function (roomType, count = 1) {
  const roomTypeIndex = this.roomTypes.findIndex(
    (rt) => rt.type === roomType
  );
  if (roomTypeIndex === -1) {
    throw new Error('Room type not found');
  }
  if (this.roomTypes[roomTypeIndex].availableRooms < count) {
    throw new Error('Not enough rooms available');
  }
  this.roomTypes[roomTypeIndex].availableRooms -= count;
  await this.save();
  return this;
};

module.exports = mongoose.model('Property', propertySchema);