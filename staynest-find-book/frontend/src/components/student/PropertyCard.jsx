import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const PropertyCard = ({ property }) => {
  const { _id, name, address, photos, averageRating, totalReviews, roomTypes, amenities, isVerified } = property;

  // Get lowest price
  const lowestPrice = roomTypes?.length > 0 
    ? Math.min(...roomTypes.map(rt => parseInt(rt.price) || 0))
    : 0;

  // Get total available rooms
  const totalAvailable = roomTypes?.reduce((sum, rt) => sum + (parseInt(rt.availableRooms) || 0), 0) || 0;

  // ✅ FIX: Get the first photo URL
  const photoUrl = photos && photos.length > 0 
    ? `http://localhost:5000${photos[0]}` 
    : '/placeholder.jpg';

  return (
    <Link to={`/properties/${_id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Image */}
        <div className="relative h-48">
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
          {isVerified && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Verified
            </div>
          )}
          {totalAvailable > 0 && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              {totalAvailable} rooms left
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {name}
          </h3>
          
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{address}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarSolidIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(averageRating || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-1 text-sm text-gray-600">
              {averageRating?.toFixed(1) || 0} ({totalReviews || 0})
            </span>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1 mb-3">
            {amenities?.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
              >
                {amenity}
              </span>
            ))}
            {amenities?.length > 4 && (
              <span className="text-gray-500 text-xs px-2 py-1">
                +{amenities.length - 4}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex justify-between items-center border-t border-gray-100 pt-3">
            <div>
              <span className="text-xl font-bold text-indigo-600">
                ₹{lowestPrice}
              </span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              <span>{roomTypes?.length || 0} room types</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;