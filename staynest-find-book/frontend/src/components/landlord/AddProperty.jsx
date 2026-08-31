import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propertyService } from '../../services/api';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  AcademicCapIcon,
  CurrencyRupeeIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  InformationCircleIcon,
  HomeModernIcon,
  WifiIcon,
  TvIcon,
  CloudIcon,
  FireIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';

const AddProperty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [mapCenter, setMapCenter] = useState({ lat: 19.145, lng: 77.310 });
  const [markerPosition, setMarkerPosition] = useState(null);
  const autocompleteRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',  // ← Make sure this exists
    location: {
      lat: '',
      lng: '',
    },
    collegeName: '',
    distanceFromCollege: '',
    amenities: [],
    roomTypes: [],
    rules: [],
  });

  const [currentRoomType, setCurrentRoomType] = useState({
    type: 'Single',
    price: '',
    totalRooms: '',
    availableRooms: '',
    isFoodIncluded: false,
  });

  const [currentRule, setCurrentRule] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const amenityOptions = [
    'WiFi', 'AC', 'TV', 'Parking', 'Food', 'Heater', 'Gym', 'Garden',
    'Security', 'Elevator', 'Balcony', 'Kitchen', 'Washing Machine',
    'Water Purifier', 'Power Backup', 'Study Table'
  ];

  const roomTypeOptions = ['Single', 'Double', 'Triple', 'Dormitory'];

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarkerPosition({ lat, lng });
        setMapCenter({ lat, lng });
        setFormData({
          ...formData,
          location: { lat, lng },
          address: place.formatted_address || formData.address,
        });
      }
    }
  };

  const handleMapClick = (e) => {
    if (e && e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      setFormData({
        ...formData,
        location: { lat, lng },
      });
    }
  };

  const onMapLoad = () => {
    setMapLoaded(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleRoomTypeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentRoomType({
      ...currentRoomType,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const addRoomType = () => {
    if (!currentRoomType.price || !currentRoomType.totalRooms || !currentRoomType.availableRooms) {
      setError('Please fill all room type fields');
      return;
    }

    if (parseInt(currentRoomType.availableRooms) > parseInt(currentRoomType.totalRooms)) {
      setError('Available rooms cannot exceed total rooms');
      return;
    }

    setFormData({
      ...formData,
      roomTypes: [...formData.roomTypes, { ...currentRoomType }],
    });

    setCurrentRoomType({
      type: 'Single',
      price: '',
      totalRooms: '',
      availableRooms: '',
      isFoodIncluded: false,
    });
    setError('');
  };

  const removeRoomType = (index) => {
    setFormData({
      ...formData,
      roomTypes: formData.roomTypes.filter((_, i) => i !== index),
    });
  };

  const toggleAmenity = (amenity) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
  };

  const addRule = () => {
    if (currentRule.trim()) {
      setFormData({
        ...formData,
        rules: [...formData.rules, currentRule.trim()],
      });
      setCurrentRule('');
    }
  };

  const removeRule = (index) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((_, i) => i !== index),
    });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }

    setPhotos([...photos, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
    setError('');
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // ✅ Check address
    if (!formData.address.trim()) {
      setError('Please enter property address');
      setLoading(false);
      return;
    }

    if (photos.length === 0) {
      setError('Please upload at least one photo of the property');
      setLoading(false);
      return;
    }

    if (formData.roomTypes.length === 0) {
      setError('Please add at least one room type');
      setLoading(false);
      return;
    }

    if (!formData.location.lat || !formData.location.lng) {
      setError('Please select property location on the map');
      setLoading(false);
      return;
    }

    if (!formData.name.trim()) {
      setError('Please enter property name');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Please enter property description');
      setLoading(false);
      return;
    }

    if (!formData.collegeName.trim()) {
      setError('Please enter college name');
      setLoading(false);
      return;
    }

    if (!formData.distanceFromCollege.trim()) {
      setError('Please enter distance from college');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('address', formData.address.trim());
      formDataToSend.append('location', JSON.stringify(formData.location));
      formDataToSend.append('collegeName', formData.collegeName.trim());
      formDataToSend.append('distanceFromCollege', formData.distanceFromCollege.trim());
      formDataToSend.append('amenities', JSON.stringify(formData.amenities));
      formDataToSend.append('roomTypes', JSON.stringify(formData.roomTypes));
      formDataToSend.append('rules', JSON.stringify(formData.rules));

      photos.forEach((photo) => {
        formDataToSend.append('propertyPhotos', photo);
      });

      const response = await propertyService.create(formDataToSend);
      
      setSuccess('Property listed successfully! 🎉');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Failed to create property:', error);
      setError(error.response?.data?.message || 'Failed to create property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-indigo-600 text-white">
          <h1 className="text-2xl font-bold flex items-center">
            <BuildingOfficeIcon className="h-6 w-6 mr-2" />
            List Your Property
          </h1>
          <p className="text-indigo-100 text-sm mt-1">
            Fill in the details below to list your property on StayNest
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              ✅ {success}
            </div>
          )}

          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <InformationCircleIcon className="h-5 w-5 mr-2 text-indigo-600" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Property Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Sunshine PG, Green Valley Hostel"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your property, facilities, nearby attractions..."
                />
              </div>

              {/* ✅ ADDRESS FIELD - This is what was missing */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPinIcon className="h-4 w-4 inline mr-1" />
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Full address of the property (e.g., Plot No. 12, Vishnupuri Colony, Nanded)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 You can search above and it will auto-fill, or type manually
                </p>
              </div>
            </div>
          </div>

          {/* Location with Map */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-indigo-600" />
              Select Location on Map *
            </h2>
            
            <div className="space-y-4">
              <div className="relative">
                <Autocomplete
                  onLoad={(ref) => (autocompleteRef.current = ref)}
                  onPlaceChanged={handlePlaceSelect}
                >
                  <input
                    type="text"
                    placeholder="Search for your property location..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </Autocomplete>
              </div>

              <div className="h-80 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                {!mapLoaded && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <p className="text-lg">🗺️ Loading map...</p>
                      <p className="text-sm mt-2 text-gray-400">Please wait or check your API key</p>
                    </div>
                  </div>
                )}
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={15}
                  onClick={handleMapClick}
                  onLoad={onMapLoad}
                >
                  {markerPosition && <Marker position={markerPosition} />}
                </GoogleMap>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    name="location.lat"
                    value={formData.location.lat}
                    onChange={handleChange}
                    required
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 19.145"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    name="location.lng"
                    value={formData.location.lng}
                    onChange={handleChange}
                    required
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 77.310"
                    readOnly
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>📍 Click on the map to select your property location</p>
                {markerPosition && (
                  <p className="text-green-600 mt-1">
                    ✅ Location selected: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* College Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2 text-indigo-600" />
              College Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Name *
                </label>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., SGGS Nanded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance from College *
                </label>
                <input
                  type="text"
                  name="distanceFromCollege"
                  value={formData.distanceFromCollege}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 500m, 1.5km, 10 mins walk"
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PhotoIcon className="h-5 w-5 mr-2 text-indigo-600" />
              Photos (Max 5) *
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors">
                <PlusIcon className="h-8 w-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={preview}
                    alt={`Property ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Upload clear photos of rooms, bathroom, common areas, and exterior
            </p>
            {photos.length > 0 && (
              <p className="text-sm text-green-600 mt-2">
                ✅ {photos.length} photo(s) uploaded
              </p>
            )}
          </div>

          {/* Room Types */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HomeModernIcon className="h-5 w-5 mr-2 text-indigo-600" />
              Room Types *
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={currentRoomType.type}
                    onChange={handleRoomTypeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {roomTypeOptions.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <CurrencyRupeeIcon className="h-4 w-4 inline" />
                    Price (per month) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={currentRoomType.price}
                    onChange={handleRoomTypeChange}
                    placeholder="e.g., 5000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Rooms *
                  </label>
                  <input
                    type="number"
                    name="totalRooms"
                    value={currentRoomType.totalRooms}
                    onChange={handleRoomTypeChange}
                    placeholder="e.g., 10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Rooms *
                  </label>
                  <input
                    type="number"
                    name="availableRooms"
                    value={currentRoomType.availableRooms}
                    onChange={handleRoomTypeChange}
                    placeholder="e.g., 5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFoodIncluded"
                    checked={currentRoomType.isFoodIncluded}
                    onChange={handleRoomTypeChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Food Included</span>
                </label>
                <button
                  type="button"
                  onClick={addRoomType}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Room Type
                </button>
              </div>
            </div>

            {formData.roomTypes.length > 0 && (
              <div className="space-y-2">
                {formData.roomTypes.map((room, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="font-medium text-gray-900">{room.type}</span>
                      <span className="text-gray-600">₹{room.price}/month</span>
                      <span className="text-gray-600">{room.totalRooms} rooms</span>
                      <span className="text-gray-600">{room.availableRooms} available</span>
                      {room.isFoodIncluded && (
                        <span className="text-green-600">✓ Food Included</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRoomType(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <WifiIcon className="h-5 w-5 mr-2 text-indigo-600" />
              Amenities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {amenityOptions.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.amenities.includes(amenity)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
            {formData.amenities.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {formData.amenities.join(', ')}
              </p>
            )}
          </div>

          {/* Rules */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2 text-indigo-600" />
              House Rules
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentRule}
                onChange={(e) => setCurrentRule(e.target.value)}
                placeholder="Add a rule (e.g., No smoking, 10 PM curfew)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRule();
                  }
                }}
              />
              <button
                type="button"
                onClick={addRule}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.rules.length > 0 && (
              <div className="mt-3 space-y-1">
                {formData.rules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{rule}</span>
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Listing Property...' : 'List Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;