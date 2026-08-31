import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propertyService, bookingService } from '../../services/api';
import { 
  PlusIcon, 
  HomeIcon, 
  UsersIcon, 
  CurrencyRupeeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const LandlordDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propertiesRes, bookingsRes] = await Promise.all([
        propertyService.getMyProperties(),
        bookingService.getLandlordBookings(),
      ]);
      setProperties(propertiesRes.data.data || []);
      setBookings(bookingsRes.data.data || []);

      // Calculate stats
      const allBookings = bookingsRes.data.data || [];
      const confirmedBookings = allBookings.filter(b => b.status === 'confirmed');
      const totalEarnings = confirmedBookings.reduce((sum, b) => sum + b.totalRent, 0);

      setStats({
        totalProperties: propertiesRes.data.data?.length || 0,
        totalBookings: allBookings.length,
        pendingBookings: allBookings.filter(b => b.status === 'pending').length,
        totalEarnings,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      await bookingService.updateStatus(bookingId, status);
      fetchData();
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { color: 'bg-green-100 text-green-800' },
      rejected: { color: 'bg-red-100 text-red-800' },
      cancelled: { color: 'bg-gray-100 text-gray-800' },
      completed: { color: 'bg-blue-100 text-blue-800' },
    };
    const config = statusMap[status] || statusMap.pending;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}! 🏠
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your properties and bookings
            </p>
          </div>
          <Link
            to="/add-property"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Property
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <HomeIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.totalEarnings}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

              // Booking Requests Section
        {bookings.filter(b => b.status === 'pending').length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Pending Booking Requests ({bookings.filter(b => b.status === 'pending').length})
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {bookings
                  .filter(b => b.status === 'pending')
                  .map((booking) => (
                    <div
                      key={booking._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-gray-900">
                              {booking.studentId?.name || 'Student'}
                            </h3>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              <ClockIcon className="h-3 w-3 inline mr-1" />
                              Pending
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {booking.propertyId?.name || 'Property'} • {booking.roomType}
                          </p>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span>📅 {new Date(booking.moveInDate).toLocaleDateString()}</span>
                            <span>📞 {booking.studentId?.phone || 'No phone'}</span>
                            <span>📧 {booking.studentId?.email || 'No email'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await bookingService.updateStatus(booking._id, 'confirmed');
                                fetchData();
                              } catch (error) {
                                console.error('Failed to accept booking:', error);
                                alert('Failed to accept booking. Please try again.');
                              }
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                          >
                            <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={async () => {
                              const reason = prompt('Please enter reason for rejection (optional):');
                              try {
                                await bookingService.updateStatus(booking._id, 'rejected', { cancellationReason: reason });
                                fetchData();
                              } catch (error) {
                                console.error('Failed to reject booking:', error);
                                alert('Failed to reject booking. Please try again.');
                              }
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                          >
                            <XCircleIcon className="h-4 w-4 inline mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

      {/* My Properties */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">My Properties</h2>
          <Link
            to="/add-property"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            + Add New
          </Link>
        </div>
        <div className="p-6">
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties listed</h3>
              <p className="text-gray-600 mb-4">Start by adding your first property</p>
              <Link
                to="/add-property"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Property
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((property) => (
                <div
                  key={property._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{property.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{property.address}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {property.roomTypes.map((room) => (
                          <span
                            key={room.type}
                            className="bg-gray-100 text-xs px-2 py-1 rounded"
                          >
                            {room.type}: ₹{room.price}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link
                      to={`/properties/${property._id}`}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Requests */}
      {bookings.filter(b => b.status === 'pending').length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Booking Requests ({bookings.filter(b => b.status === 'pending').length})
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {bookings
                .filter(b => b.status === 'pending')
                .map((booking) => (
                  <div
                    key={booking._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {booking.studentId?.name || 'Student'}
                          </h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {booking.propertyId?.name || 'Property'} • {booking.roomType}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                          <span>
                            📅 {new Date(booking.moveInDate).toLocaleDateString()}
                          </span>
                          <span>
                            📞 {booking.studentId?.phone || 'No phone'}
                          </span>
                          <span>
                            📧 {booking.studentId?.email || 'No email'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBookingStatus(booking._id, 'confirmed')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleBookingStatus(booking._id, 'rejected')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordDashboard;