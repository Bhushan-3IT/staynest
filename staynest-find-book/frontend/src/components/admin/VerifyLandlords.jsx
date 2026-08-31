import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';  // ✅ Named import
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon,
  ClockIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const VerifyLandlords = () => {
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchPendingLandlords();
  }, []);

  const fetchPendingLandlords = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/landlords/pending');
      setLandlords(response.data.data);
    } catch (error) {
      console.error('Failed to fetch landlords:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (landlordId, status) => {
    try {
      await api.put(`/admin/landlords/${landlordId}/verify`, {
        status,
        remarks,
      });
      alert(`Landlord ${status} successfully!`);
      fetchPendingLandlords();
      setRemarks('');
      setSelectedLandlord(null);
    } catch (error) {
      console.error('Failed to verify landlord:', error);
      alert('Failed to verify landlord. Please try again.');
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-indigo-600 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <ShieldCheckIcon className="h-6 w-6 mr-2" />
          Landlord Verification
        </h2>
        <p className="text-indigo-100 text-sm">
          Verify landlords before they can list properties
        </p>
      </div>

      <div className="p-6">
        {landlords.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">No pending landlord verifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {landlords.map((landlord) => (
              <div
                key={landlord._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{landlord.name}</h3>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        <ClockIcon className="h-3 w-3 inline mr-1" />
                        Pending
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p><EnvelopeIcon className="h-4 w-4 inline mr-1" /> {landlord.email}</p>
                      <p><PhoneIcon className="h-4 w-4 inline mr-1" /> {landlord.phone}</p>
                      <p><BuildingOfficeIcon className="h-4 w-4 inline mr-1" /> {landlord.totalProperties || 0} properties listed</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedLandlord(selectedLandlord === landlord._id ? null : landlord._id)}
                      className="p-2 text-gray-600 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleVerification(landlord._id, 'approved')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerification(landlord._id, 'rejected')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                    >
                      <XCircleIcon className="h-4 w-4 inline mr-1" />
                      Reject
                    </button>
                  </div>
                </div>

                {/* Remarks Input */}
                {selectedLandlord === landlord._id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Remarks
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add verification notes..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        onClick={() => setSelectedLandlord(null)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyLandlords;