import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';  // ✅ Named import
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  UserGroupIcon,
  HomeIcon,
  PhoneIcon,
  MapPinIcon,
  BellIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const SafetyDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('general');

  useEffect(() => {
    fetchOffCampusStudents();
  }, []);

  const fetchOffCampusStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/students/off-campus');
      setStudents(response.data.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendEmergencyAlert = async () => {
    if (!alertMessage.trim()) {
      alert('Please enter an emergency message');
      return;
    }

    if (!window.confirm('Are you sure you want to send this emergency alert to all off-campus students?')) {
      return;
    }

    try {
      await api.post('/admin/students/emergency-alert', {
        message: alertMessage,
        type: alertType,
      });
      alert('Emergency alert sent successfully!');
      setAlertMessage('');
    } catch (error) {
      console.error('Failed to send alert:', error);
      alert('Failed to send emergency alert');
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
    <div className="space-y-6">
      {/* Emergency Alert Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-red-600 text-white">
          <h2 className="text-xl font-bold flex items-center">
            <BellIcon className="h-6 w-6 mr-2" />
            Emergency Alert System
          </h2>
          <p className="text-red-100 text-sm">
            Send alerts to all off-campus students in emergency situations
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <input
                type="text"
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Enter emergency message (e.g., Fire alert in Vishnupuri area...)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="general">General</option>
                <option value="fire">🔥 Fire</option>
                <option value="security">🛡️ Security</option>
                <option value="weather">🌧️ Weather</option>
                <option value="other">Other</option>
              </select>
              <button
                onClick={sendEmergencyAlert}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center whitespace-nowrap"
              >
                <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                Send Alert
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            ⚠️ Alert will be sent to <strong>{students.length}</strong> off-campus students via email
          </p>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-indigo-600 text-white">
          <h2 className="text-xl font-bold flex items-center">
            <UserGroupIcon className="h-6 w-6 mr-2" />
            Off-Campus Students ({students.length})
          </h2>
          <p className="text-indigo-100 text-sm">
            Track all off-campus students for safety
          </p>
        </div>

        <div className="p-6">
          {students.length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheckIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">No off-campus students currently</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emergency Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-indigo-600">
                              {student.name?.charAt(0) || 'S'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                            <p className="text-sm text-gray-500"><PhoneIcon className="h-3 w-3 inline mr-1" /> {student.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {student.currentAddress?.roomNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 inline mr-1" />
                        {student.currentAddress?.propertyId?.address || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {student.emergencyContact?.name ? (
                          <>
                            <p className="font-medium">{student.emergencyContact.name}</p>
                            <p className="text-xs">{student.emergencyContact.phone}</p>
                            <p className="text-xs text-gray-400">{student.emergencyContact.relationship}</p>
                          </>
                        ) : (
                          <span className="text-gray-400">Not added</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center w-fit">
                          <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                          Safe
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafetyDashboard;