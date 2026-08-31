import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyService, bookingService } from '../services/api';
import { 
  MapPinIcon, 
  WifiIcon, 
  UserGroupIcon, 
  StarIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon,
  HomeModernIcon,
  FireIcon,
  TvIcon,
  CloudIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import Loader from '../components/common/Loader';

// ✅ NEW: Google Maps Components - Import ONCE
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStudent, isLandlord, isAdmin } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [moveInDate, setMoveInDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // ✅ NEW: Map state
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    console.log('🔍 Property ID from URL:', id);
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('📡 Fetching property with ID:', id);
      const response = await propertyService.getById(id);
      console.log('✅ Property fetched:', response.data);
      
      if (response.data && response.data.data) {
        setProperty(response.data.data);
        if (response.data.data.roomTypes && response.data.data.roomTypes.length > 0) {
          setSelectedRoomType(response.data.data.roomTypes[0]);
        }
        // Calculate route after property is loaded
        if (response.data.data.location && mapLoaded) {
          calculateRoute(response.data.data.location);
        }
      } else {
        setError('Property not found');
      }
    } catch (error) {
      console.error('❌ Failed to fetch property:', error);
      setError(error.response?.data?.message || 'Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Calculate route from SGGS to property
  const calculateRoute = (location) => {
    if (!location || !location.lat || !location.lng || !window.google) return;
    
    setMapLoading(true);
    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      // SGGS College Coordinates: 19.145, 77.310
      const origin = new window.google.maps.LatLng(19.145, 77.310);
      const destination = new window.google.maps.LatLng(location.lat, location.lng);
      
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            
            // Extract route info
            const route = result.routes[0];
            const leg = route.legs[0];
            setRouteInfo({
              distance: leg.distance.text,
              distanceValue: leg.distance.value / 1000, // in km
              duration: leg.duration.text,
              durationValue: leg.duration.value / 60, // in minutes
              startAddress: leg.start_address,
              endAddress: leg.end_address,
            });
          } else {
            console.log('Route calculation failed:', status);
          }
          setMapLoading(false);
        }
      );
    } catch (error) {
      console.error('Route calculation error:', error);
      setMapLoading(false);
    }
  };

  // ✅ NEW: Calculate walking time
  const getWalkingTime = (distanceKm) => {
    if (!distanceKm) return 'N/A';
    const walkingSpeed = 5; // km/h
    const timeHours = distanceKm / walkingSpeed;
    const timeMinutes = Math.round(timeHours * 60);
    if (timeMinutes < 60) {
      return `${timeMinutes} min`;
    } else {
      const hours = Math.floor(timeMinutes / 60);
      const mins = timeMinutes % 60;
      return `${hours}h ${mins}m`;
    }
  };

  // ✅ NEW: Handle map load
  const onMapLoad = () => {
    setMapLoaded(true);
    if (property && property.location) {
      calculateRoute(property.location);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isStudent) {
      setBookingError('Only students can book properties');
      return;
    }

    if (!selectedRoomType) {
      setBookingError('Please select a room type');
      return;
    }

    if (!moveInDate) {
      setBookingError('Please select a move-in date');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      const bookingData = {
        propertyId: property._id,
        roomType: selectedRoomType.type,
        moveInDate,
      };

      const response = await bookingService.create(bookingData);
      setBookingSuccess('✅ Booking request sent successfully! Please wait for landlord confirmation.');
      
      setMoveInDate('');
      setSelectedRoomType(null);
      
      await fetchProperty();
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return 'https://via.placeholder.com/800x400?text=No+Image';
    if (photoPath.startsWith('http')) return photoPath;
    return `http://localhost:5000${photoPath}`;
  };

  const getSafetyColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
        <p className="text-gray-600 mb-6">{error || "The property you're looking for doesn't exist."}</p>
        <button
          onClick={() => navigate('/properties')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Browse Properties
        </button>
      </div>
    );
  }

  const amenityIcons = {
    WiFi: WifiIcon,
    AC: CloudIcon,
    'TV': TvIcon,
    Parking: BuildingOffice2Icon,
    'Food': HomeModernIcon,
    'Heater': FireIcon,
  };

  const safetyScore = property.location?.safetyScore || 0;
  const safetyLevel = property.location?.safetyLevel || 'Moderate';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Properties
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Details */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-96">
              <img
                src={property.photos && property.photos.length > 0 
                  ? getPhotoUrl(property.photos[currentImageIndex]) 
                  : 'https://via.placeholder.com/800x400?text=No+Image'
                }
                alt={property.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
                }}
              />
              {property.photos && property.photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {property.photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            {property.photos && property.photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2 p-4">
                {property.photos.slice(0, 8).map((photo, index) => (
                  <img
                    key={index}
                    src={getPhotoUrl(photo)}
                    alt={`${property.name} ${index + 1}`}
                    className="h-20 w-full object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => setCurrentImageIndex(index)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ✅ FIXED: Map & Route Section - NO nested LoadScript */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-6">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Location & Route from SGGS
              </h3>
            </div>
            
            <div className="h-80">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ 
                  lat: property.location?.lat || 19.145, 
                  lng: property.location?.lng || 77.310 
                }}
                zoom={14}
                onLoad={onMapLoad}
                options={{
                  styles: [
                    {
                      featureType: 'poi',
                      elementType: 'labels',
                      stylers: [{ visibility: 'off' }]
                    }
                  ]
                }}
              >
                {/* SGGS Marker */}
                <Marker
                  position={{ lat: 19.145, lng: 77.310 }}
                  label={{ text: '🏫 SGGS', color: '#ffffff', fontSize: '10px' }}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  }}
                />
                
                {/* Property Marker */}
                {property && property.location && (
                  <Marker
                    position={{ 
                      lat: property.location.lat, 
                      lng: property.location.lng 
                    }}
                    label={{ text: '🏠', color: '#ffffff', fontSize: '10px' }}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    }}
                  />
                )}
                
                {/* Route */}
                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            </div>

            {/* Route Info & Safety Score */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">🛡️ Safety Score</p>
                  <p className={`text-2xl font-bold ${getSafetyColor(safetyScore)}`}>
                    {safetyScore || 'N/A'}/10
                  </p>
                  <p className="text-xs text-gray-500">{safetyLevel}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">📏 Distance from SGGS</p>
                  <p className="text-xl font-bold text-gray-900">
                    {routeInfo?.distanceValue?.toFixed(2) || 'N/A'} km
                  </p>
                  <p className="text-xs text-gray-500">Walking distance</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">🚶 Walking Time</p>
                  <p className="text-xl font-bold text-gray-900">
                    {getWalkingTime(routeInfo?.distanceValue)}
                  </p>
                  <p className="text-xs text-gray-500">~5 km/h speed</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">📍 Area</p>
                  <p className="text-xl font-bold text-gray-900">
                    {property.location?.safetyDetails?.areaType || 'Vishnupuri'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Near SGGS Nanded
                  </p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <a
                  href={`https://www.google.com/maps/dir/SGGS+Nanded/${property.location?.lat || 19.145},${property.location?.lng || 77.310}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center"
                >
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  Get Directions on Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Property Details - Rest remains same */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            {/* ... existing property details ... */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-1" />
                    <span>{property.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <AcademicCapIcon className="h-5 w-5 mr-1" />
                    <span>{property.distanceFromCollege} from college</span>
                  </div>
                </div>
              </div>
              {property.isVerified && (
                <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Verified
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center mt-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarSolidIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(property.averageRating || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                {(property.averageRating || 0).toFixed(1)} ({property.totalReviews || 0} reviews)
              </span>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-3">
                {property.amenities && property.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || BuildingOffice2Icon;
                  return (
                    <span
                      key={amenity}
                      className="flex items-center bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-700"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {amenity}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Rules */}
            {property.rules && property.rules.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rules</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {property.rules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Landlord Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Listed By</h3>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-lg">
                    {property.landlordId?.name?.charAt(0).toUpperCase() || 'L'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{property.landlordId?.name || 'Landlord'}</p>
                  <p className="text-sm text-gray-600">
                    {property.landlordId?.totalProperties || 0} properties listed
                    {property.landlordId?.rating > 0 && ` • ⭐ ${property.landlordId.rating.toFixed(1)}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

              {/* Right Column - Role-Based View */}
        <div className="lg:col-span-1">
          {isAdmin ? (
            // ✅ ADMIN VIEW - View only, no booking
            <div className="...">Admin View...</div>
          ) : isLandlord ? (
            // ✅ LANDLORD VIEW - View only, no booking
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Property Details</h3>
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg">
                <p className="font-medium">📋 Property Information</p>
                <p className="text-sm mt-1">As a landlord, you can view property details but cannot book.</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listed By:</span>
                    <span className="font-medium">{property.landlordId?.name || 'You'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Rooms:</span>
                    <span className="font-medium">{property.roomTypes?.reduce((sum, r) => sum + r.totalRooms, 0) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Rooms:</span>
                    <span className="font-medium">{property.roomTypes?.reduce((sum, r) => sum + r.availableRooms, 0) || 0}</span>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm w-full"
                >
                  📊 Go to Dashboard
                </button>
              </div>
              {/* Safety Score for Landlord */}
              {property.location?.safetyScore && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">🛡️ Safety Score</p>
                  <p className={`text-xl font-bold ${
                    property.location.safetyScore >= 8 ? 'text-green-600' :
                    property.location.safetyScore >= 6 ? 'text-blue-600' :
                    property.location.safetyScore >= 4 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {property.location.safetyScore}/10
                  </p>
                  <p className="text-xs text-gray-500">{property.location.safetyLevel || 'Moderate'}</p>
                </div>
              )}
            </div>
          ) : isStudent ? (
            // ✅ STUDENT VIEW - Can Book (keep existing booking form)
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Book Now</h3>
              <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Room Type
                        </label>
                        <div className="space-y-2">
                          {property.roomTypes && property.roomTypes.map((room) => (
                            <button
                              key={room.type}
                              onClick={() => setSelectedRoomType(room)}
                              className={`w-full p-3 border-2 rounded-lg text-left transition-colors ${
                                selectedRoomType?.type === room.type
                                  ? 'border-indigo-600 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900">{room.type}</p>
                                  <p className="text-sm text-gray-600">
                                    {room.availableRooms} rooms available
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-indigo-600">₹{room.price}/month</p>
                                  {room.isFoodIncluded && (
                                    <p className="text-xs text-green-600">Food Included</p>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="moveInDate" className="block text-sm font-medium text-gray-700 mb-2">
                          Move-in Date
                        </label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="date"
                            id="moveInDate"
                            value={moveInDate}
                            onChange={(e) => setMoveInDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {selectedRoomType && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Room Type</span>
                              <span className="font-medium">{selectedRoomType.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Monthly Rent</span>
                              <span className="font-medium">₹{selectedRoomType.price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Booking Amount (50%)</span>
                              <span className="font-medium">₹{selectedRoomType.price * 0.5}</span>
                            </div>
                            {moveInDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Move-in Date</span>
                                <span className="font-medium">{new Date(moveInDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {bookingError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                          {bookingError}
                        </div>
                      )}
                      {bookingSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                          {bookingSuccess}
                        </div>
                      )}

                      <button
                        onClick={handleBooking}
                        disabled={!selectedRoomType || !moveInDate || bookingLoading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bookingLoading ? 'Processing...' : 'Book Now'}
                      </button>

                      {!isAuthenticated && (
                        <p className="text-center text-sm text-gray-600 mt-3">
                          Please <a href="/login" className="text-indigo-600 hover:underline">login</a> to book
                        </p>
                      )}
                    
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;