const Property = require('../models/Property');
const User = require('../models/User');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

// @desc    Create a property listing
// @route   POST /api/properties
// @access  Private (Landlord only)
const createProperty = async (req, res) => {
  try {
    console.log('📝 Creating property...');
    console.log('📸 Files received:', req.files ? req.files.length : 0);
    console.log('📦 Body:', req.body);

    const {
      name,
      description,
      address,
      location,
      collegeName,
      distanceFromCollege,
      amenities,
      roomTypes,
      rules,
    } = req.body;

    // Check if user is landlord
    if (req.user.role !== 'landlord' && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Only landlords can create property listings');
    }

    // ✅ FIX: Check if photos were uploaded
    if (!req.files || req.files.length === 0) {
      console.log('❌ No files uploaded');
      return errorResponse(res, 400, 'Please upload at least one photo');
    }

    console.log(`✅ ${req.files.length} photos uploaded`);

    // Parse roomTypes if it's a string
    let parsedRoomTypes = roomTypes;
    if (typeof roomTypes === 'string') {
      parsedRoomTypes = JSON.parse(roomTypes);
    }

    // Validate roomTypes
    if (!parsedRoomTypes || !Array.isArray(parsedRoomTypes) || parsedRoomTypes.length === 0) {
      return errorResponse(res, 400, 'Please add at least one room type');
    }

    // Parse location if it's a string
    let parsedLocation = location;
    if (typeof location === 'string') {
      parsedLocation = JSON.parse(location);
    }

    // Parse amenities if it's a string
    let parsedAmenities = amenities;
    if (typeof amenities === 'string') {
      parsedAmenities = JSON.parse(amenities);
    }

    // Parse rules if it's a string
    let parsedRules = rules;
    if (typeof rules === 'string') {
      parsedRules = JSON.parse(rules);
    }

    // Get photos from uploaded files
    const photos = req.files.map(file => `/uploads/properties/${file.filename}`);
    console.log('📸 Photo URLs:', photos);

    // Create property
    const property = await Property.create({
      landlordId: req.user._id,
      name,
      description,
      address,
      location: parsedLocation,
      collegeName,
      distanceFromCollege,
      photos,
      amenities: parsedAmenities || [],
      roomTypes: parsedRoomTypes,
      rules: parsedRules || [],
    });

    // Update landlord's total properties count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalProperties: 1 },
    });

    console.log('✅ Property created:', property._id);
    return successResponse(res, 201, 'Property created successfully', property);
  } catch (error) {
    console.error('❌ Create property error:', error);
    return errorResponse(res, 500, 'Server error while creating property', error);
  }
};

// @desc    Get all properties with filters
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res) => {
  try {
    const {
      collegeName,
      minPrice,
      maxPrice,
      roomType,
      amenities,
      isVerified,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    // Search by college name
    if (collegeName) {
      filter.collegeName = { $regex: collegeName, $options: 'i' };
    }

    // Search by property name or address
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { collegeName: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by verification status
    if (isVerified === 'true') {
      filter.isVerified = true;
    }

    // Filter by amenities
    if (amenities) {
      const amenitiesArray = amenities.split(',');
      filter.amenities = { $all: amenitiesArray };
    }

    // Filter by room type and price
    if (roomType || minPrice || maxPrice) {
      filter['roomTypes'] = { $elemMatch: {} };
      
      if (roomType) {
        filter['roomTypes'].$elemMatch.type = roomType;
      }
      
      if (minPrice) {
        filter['roomTypes'].$elemMatch.price = { $gte: parseInt(minPrice) };
      }
      
      if (maxPrice) {
        filter['roomTypes'].$elemMatch.price = { $lte: parseInt(maxPrice) };
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Property.countDocuments(filter);

    // Get properties
    const properties = await Property.find(filter)
      .populate('landlordId', 'name email phone rating')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate total pages
    const totalPages = Math.ceil(total / parseInt(limit));

    return paginatedResponse(res, 200, 'Properties fetched successfully', properties, {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
    });
  } catch (error) {
    console.error('Get properties error:', error);
    return errorResponse(res, 500, 'Server error while fetching properties', error);
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res) => {
  try {
    console.log('🔍 Getting property with ID:', req.params.id);
    
    const property = await Property.findById(req.params.id)
      .populate('landlordId', 'name email phone rating totalProperties');

    if (!property) {
      console.log('❌ Property not found:', req.params.id);
      return errorResponse(res, 404, 'Property not found');
    }

    console.log('✅ Property found:', property._id);
    return successResponse(res, 200, 'Property fetched successfully', property);
  } catch (error) {
    console.error('Get property error:', error);
    if (error.kind === 'ObjectId') {
      return errorResponse(res, 404, 'Property not found');
    }
    return errorResponse(res, 500, 'Server error while fetching property', error);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Landlord/Admin)
const updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }

    // Check ownership
    if (property.landlordId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'You are not authorized to update this property');
    }

    // Parse JSON fields if they are strings
    const updateData = { ...req.body };
    if (updateData.roomTypes && typeof updateData.roomTypes === 'string') {
      updateData.roomTypes = JSON.parse(updateData.roomTypes);
    }
    if (updateData.location && typeof updateData.location === 'string') {
      updateData.location = JSON.parse(updateData.location);
    }
    if (updateData.amenities && typeof updateData.amenities === 'string') {
      updateData.amenities = JSON.parse(updateData.amenities);
    }
    if (updateData.rules && typeof updateData.rules === 'string') {
      updateData.rules = JSON.parse(updateData.rules);
    }

    // If new photos uploaded, add them
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => `/uploads/properties/${file.filename}`);
      if (updateData.photos) {
        updateData.photos = [...updateData.photos, ...newPhotos];
      } else {
        updateData.photos = newPhotos;
      }
    }

    // Update property
    property = await Property.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, 200, 'Property updated successfully', property);
  } catch (error) {
    console.error('Update property error:', error);
    return errorResponse(res, 500, 'Server error while updating property', error);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Landlord/Admin)
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }

    // Check ownership
    if (property.landlordId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'You are not authorized to delete this property');
    }

    // Soft delete - just mark as inactive
    property.isActive = false;
    await property.save();

    // Update landlord's total properties count
    await User.findByIdAndUpdate(property.landlordId, {
      $inc: { totalProperties: -1 },
    });

    return successResponse(res, 200, 'Property deleted successfully');
  } catch (error) {
    console.error('Delete property error:', error);
    return errorResponse(res, 500, 'Server error while deleting property', error);
  }
};

// @desc    Get properties by landlord
// @route   GET /api/properties/landlord/:landlordId
// @access  Public
const getPropertiesByLandlord = async (req, res) => {
  try {
    const properties = await Property.find({
      landlordId: req.params.landlordId,
      isActive: true,
    });

    return successResponse(res, 200, 'Properties fetched successfully', properties);
  } catch (error) {
    console.error('Get landlord properties error:', error);
    return errorResponse(res, 500, 'Server error while fetching properties', error);
  }
};

// @desc    Get my properties (landlord's own properties)
// @route   GET /api/properties/my-properties
// @access  Private (Landlord only)
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      landlordId: req.user._id,
    }).sort('-createdAt');

    return successResponse(res, 200, 'Your properties fetched successfully', properties);
  } catch (error) {
    console.error('Get my properties error:', error);
    return errorResponse(res, 500, 'Server error while fetching properties', error);
  }
};

// @desc    Admin verify property
// @route   PUT /api/properties/:id/verify
// @access  Private (Admin only)
const verifyProperty = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Only admin can verify properties');
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }

    property.isVerified = true;
    await property.save();

    return successResponse(res, 200, 'Property verified successfully', property);
  } catch (error) {
    console.error('Verify property error:', error);
    return errorResponse(res, 500, 'Server error while verifying property', error);
  }
};

// @desc    Get property stats for admin
// @route   GET /api/properties/stats
// @access  Private (Admin only)
const getPropertyStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Only admin can view stats');
    }

    const totalProperties = await Property.countDocuments();
    const verifiedProperties = await Property.countDocuments({ isVerified: true });
    const unverifiedProperties = await Property.countDocuments({ isVerified: false });
    const activeProperties = await Property.countDocuments({ isActive: true });

    return successResponse(res, 200, 'Property stats fetched', {
      totalProperties,
      verifiedProperties,
      unverifiedProperties,
      activeProperties,
    });
  } catch (error) {
    console.error('Get property stats error:', error);
    return errorResponse(res, 500, 'Server error while fetching stats', error);
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getPropertiesByLandlord,
  getMyProperties,
  verifyProperty,
  getPropertyStats,
};