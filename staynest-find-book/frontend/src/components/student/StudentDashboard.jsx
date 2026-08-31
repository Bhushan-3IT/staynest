import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/api';
import { 
  CalendarIcon, 
  HomeIcon, 
  StarIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getStudentBookings();
      const bookingsData = response.data.data || [];
      setBookings(bookingsData);

      // Calculate stats
      setStats({
        total: bookingsData.length,
        pending: bookingsData.filter(b => b.status === 'pending').length,
        confirmed: bookingsData.filter(b => b.status === 'confirmed').length,
        completed: bookingsData.filter(b => b.status === 'completed').length,
      });
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Confirmed' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Rejected' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon, label: 'Cancelled' },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon, label: 'Completed' },
    };
    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancel(bookingId);
      fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}! 👋
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600">
                {user?.collegeName && `Student at ${user.collegeName}`}
              </p>
              {user?.isSGGSVerified && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                  ✅ SGGS Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <HomeIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <StarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* My Bookings */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
        </div>
        <div className="p-6">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-4">Start your search for the perfect PG near SGGS</p>
              <Link
                to="/properties"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse Properties Near SGGS
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {booking.propertyId?.name || 'Property'}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {booking.propertyId?.address || 'Address not available'}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span>
                          <CalendarIcon className="h-4 w-4 inline mr-1" />
                          Move-in: {new Date(booking.moveInDate).toLocaleDateString()}
                        </span>
                        <span>
                          <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                          {booking.roomType}
                        </span>
                        <span>
                          <CurrencyRupeeIcon className="h-4 w-4 inline mr-1" />
                          ₹{booking.totalRent}/month
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Cancel Request
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <Link
                          to={`/properties/${booking.propertyId?._id}`}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          View Property
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;