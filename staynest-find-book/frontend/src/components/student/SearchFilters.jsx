import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  AcademicCapIcon,
  CurrencyRupeeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

// Rest remains the same...

const SearchFilters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setLocalFilters({
      ...localFilters,
      [name]: newValue,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      collegeName: '',
      minPrice: '',
      maxPrice: '',
      roomType: '',
      isVerified: 'true',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
        <span>Filters</span>
        <button
          onClick={handleReset}
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
        >
          <XMarkIcon className="h-4 w-4 mr-1" />
          Reset
        </button>
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="search"
              value={localFilters.search}
              onChange={handleChange}
              placeholder="Search properties..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* College Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <AcademicCapIcon className="h-4 w-4 inline mr-1" />
            College Name
          </label>
          <input
            type="text"
            name="collegeName"
            value={localFilters.collegeName}
            onChange={handleChange}
            placeholder="Enter college name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <CurrencyRupeeIcon className="h-4 w-4 inline mr-1" />
            Price Range (per month)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              name="minPrice"
              value={localFilters.minPrice}
              onChange={handleChange}
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <input
              type="number"
              name="maxPrice"
              value={localFilters.maxPrice}
              onChange={handleChange}
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Room Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
            Room Type
          </label>
          <select
            name="roomType"
            value={localFilters.roomType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="">All Types</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Triple">Triple</option>
            <option value="Dormitory">Dormitory</option>
          </select>
        </div>

        {/* Verified Only */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isVerified"
            checked={localFilters.isVerified === 'true'}
            onChange={(e) => {
              setLocalFilters({
                ...localFilters,
                isVerified: e.target.checked ? 'true' : '',
              });
            }}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Verified properties only
          </label>
        </div>

        {/* Apply Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Apply Filters
        </button>
      </form>
    </div>
  );
};

export default SearchFilters;