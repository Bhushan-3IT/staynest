
import React, { useState, useEffect } from 'react';
import { propertyService } from '../../services/api';  // ✅ Use propertyService
import { CheckCircleIcon, XCircleIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const VerifyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unverified');

  useEffect(() => {
    fetchProperties();
  }, [filter]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await propertyService.getAll({
        isVerified: filter === 'unverified' ? 'false' : '',
        limit: 50,
      });
      setProperties(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await propertyService.verify(id);
      fetchProperties();
    } catch (error) {
      console.error('Failed to verify property:', error);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const unverifiedCount = properties.filter(p => !p.isVerified).length;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Verify Properties
          {unverifiedCount > 0 && (
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              {unverifiedCount} pending
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('unverified')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unverified'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
        </div>
      </div>
      <div className="p-6">
        {properties.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">No properties to verify</p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div
                key={property._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {property.name}
                      </h3>
                      {property.isVerified ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{property.address}</p>
                    <p className="text-sm text-gray-600">
                      {property.collegeName} • {property.distanceFromCollege}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {property.roomTypes?.map((room) => (
                        <span
                          key={room.type}
                          className="bg-gray-100 text-xs px-2 py-1 rounded"
                        >
                          {room.type}: ₹{room.price}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/properties/${property._id}`}
                      target="_blank"
                      className="p-2 text-gray-600 hover:text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    {!property.isVerified && (
                      <button
                        onClick={() => handleVerify(property._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ... rest of the component remains the same
};

export default VerifyProperties;