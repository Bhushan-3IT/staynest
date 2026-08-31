const Property = require('../models/Property');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ============================================
// CALCULATE SAFETY SCORE FOR A LOCATION
// ============================================
const calculateSafetyScore = async (lat, lng) => {
  // 🔮 AI/ML Safety Score Calculation
  // In production, you'd use Google Maps APIs, crime data, etc.
  // For demo, we use smart scoring logic
  
  const factors = {
    // 1. Distance from SGGS College (SGGS location: 19.145, 77.310)
    distanceFromSGGS: getDistanceFromSGGS(lat, lng),
    
    // 2. Area Type (based on known SGGS areas)
    areaType: getAreaType(lat, lng),
    
    // 3. Simulated historical safety data
    historicalSafety: getHistoricalSafety(lat, lng),
    
    // 4. Population density (simulated)
    populationDensity: getPopulationDensity(lat, lng),
  };
  
  // Calculate score (0-10)
  let safetyScore = 0;
  
  // Distance from SGGS (closer = safer for students)
  if (factors.distanceFromSGGS < 1) safetyScore += 3;
  else if (factors.distanceFromSGGS < 2) safetyScore += 2.5;
  else if (factors.distanceFromSGGS < 3) safetyScore += 2;
  else if (factors.distanceFromSGGS < 5) safetyScore += 1;
  else safetyScore += 0.5;
  
  // Area Type
  const areaScores = {
    'Vishnupuri': 3,
    'CIDCO': 2.5,
    'Taramandal': 2,
    'Kailash Nagar': 2,
    'Basti Bazar': 1.5,
    'Other': 1,
  };
  safetyScore += areaScores[factors.areaType] || 1;
  
  // Historical Safety
  safetyScore += factors.historicalSafety * 0.3;
  
  // Population Density (moderate density is safest)
  if (factors.populationDensity > 500 && factors.populationDensity < 2000) safetyScore += 1.5;
  else if (factors.populationDensity >= 2000) safetyScore += 0.5;
  else safetyScore += 1;
  
  // Cap at 10
  safetyScore = Math.min(safetyScore, 10);
  
  // Determine safety level
  let safetyLevel = 'Moderate';
  if (safetyScore >= 8) safetyLevel = 'Very Safe';
  else if (safetyScore >= 6) safetyLevel = 'Safe';
  else if (safetyScore >= 4) safetyLevel = 'Moderate';
  else safetyLevel = 'Exercise Caution';
  
  return {
    safetyScore: parseFloat(safetyScore.toFixed(1)),
    safetyLevel,
    details: {
      distanceFromSGGS: factors.distanceFromSGGS,
      areaType: factors.areaType,
      populationDensity: factors.populationDensity,
      historicalSafety: factors.historicalSafety,
    },
  };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// SGGS College Coordinates
const SGGS_COORDS = { lat: 19.145, lng: 77.310 };

// Calculate distance from SGGS (in km)
const getDistanceFromSGGS = (lat, lng) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat - SGGS_COORDS.lat) * Math.PI / 180;
  const dLng = (lng - SGGS_COORDS.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(SGGS_COORDS.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Determine area based on coordinates
const getAreaType = (lat, lng) => {
  // Known areas around SGGS
  const areas = {
    'Vishnupuri': { lat: 19.145, lng: 77.310, radius: 0.5 },
    'CIDCO': { lat: 19.135, lng: 77.325, radius: 0.8 },
    'Taramandal': { lat: 19.125, lng: 77.315, radius: 0.6 },
    'Kailash Nagar': { lat: 19.155, lng: 77.295, radius: 0.5 },
    'Basti Bazar': { lat: 19.120, lng: 77.320, radius: 0.7 },
  };
  
  for (const [area, coords] of Object.entries(areas)) {
    const distance = getDistanceFromSGGS(lat, lng);
    if (distance < coords.radius) return area;
  }
  return 'Other';
};

// Simulate historical safety data
const getHistoricalSafety = (lat, lng) => {
  // In production, use real crime data APIs
  return Math.random() * 5 + 3; // 3-8 range
};

// Simulate population density
const getPopulationDensity = (lat, lng) => {
  // In production, use real population data
  return Math.floor(Math.random() * 2000) + 200; // 200-2200 per km²
};

// ============================================
// API CONTROLLERS
// ============================================

// @desc    Calculate safety score for a property
// @route   POST /api/safety/calculate
// @access  Private
const calculatePropertySafety = async (req, res) => {
  try {
    const { lat, lng, propertyId } = req.body;
    
    if (!lat || !lng) {
      return errorResponse(res, 400, 'Latitude and longitude required');
    }
    
    const safetyData = await calculateSafetyScore(lat, lng);
    
    // If propertyId is provided, update the property
    if (propertyId) {
      await Property.findByIdAndUpdate(propertyId, {
        'location.safetyScore': safetyData.safetyScore,
        'location.safetyLevel': safetyData.safetyLevel,
        'location.safetyDetails': safetyData.details,
      });
    }
    
    return successResponse(res, 200, 'Safety score calculated', safetyData);
  } catch (error) {
    return errorResponse(res, 500, 'Safety calculation failed', error);
  }
};

// @desc    Get route from SGGS to property
// @route   POST /api/safety/route
// @access  Public
const getRouteToProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }
    
    // SGGS College coordinates
    const origin = 'SGGS Nanded, Vishnupuri, Nanded';
    const destination = property.address || 
                       `${property.location.lat},${property.location.lng}`;
    
    // Distance calculation
    const distance = getDistanceFromSGGS(
      property.location.lat,
      property.location.lng
    );
    
    // Estimate travel time (assuming walking speed 5km/h)
    const walkingTime = (distance / 5) * 60; // minutes
    const drivingTime = (distance / 20) * 60; // minutes
    const cyclingTime = (distance / 12) * 60; // minutes
    
    return successResponse(res, 200, 'Route information', {
      propertyId: property._id,
      propertyName: property.name,
      propertyAddress: property.address,
      distance: parseFloat(distance.toFixed(2)),
      travelTime: {
        walking: Math.round(walkingTime),
        cycling: Math.round(cyclingTime),
        driving: Math.round(drivingTime),
      },
      origin: 'SGGS Nanded, Vishnupuri, Nanded',
      destination: property.address,
      googleMapsLink: `https://www.google.com/maps/dir/SGGS+Nanded/${property.location.lat},${property.location.lng}`,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Route calculation failed', error);
  }
};

module.exports = {
  calculateSafetyScore,
  calculatePropertySafety,
  getRouteToProperty,
};