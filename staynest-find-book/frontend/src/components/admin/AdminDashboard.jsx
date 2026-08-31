import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';  // ✅ Named import
import AdminStats from './AdminStats';
import VerifyLandlords from './VerifyLandlords';
import SafetyDashboard from './SafetyDashboard';
import VerifyProperties from './VerifyProperties';
import { 
  HomeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  BellIcon,
  BuildingOfficeIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: HomeIcon },
    { id: 'landlords', label: 'Verify Landlords', icon: UserGroupIcon },
    { id: 'properties', label: 'Verify Properties', icon: BuildingOfficeIcon },
    { id: 'safety', label: 'Safety Dashboard', icon: ShieldCheckIcon },
    { id: 'disputes', label: 'Disputes', icon: ExclamationCircleIcon },
    { id: 'escrow', label: 'Escrow', icon: CurrencyRupeeIcon },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
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
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ShieldCheckIcon className="h-8 w-8 text-indigo-600 mr-3" />
          SGGS Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Manage landlords, verify properties, and ensure student safety
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'overview' && (
          <>
            <AdminStats stats={stats} />
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800">Pending Verifications</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.landlords?.pending || 0} Landlords
                </p>
                <p className="text-sm text-yellow-600">
                  {stats?.properties?.pending || 0} Properties
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800">Off-Campus Students</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.students?.offCampus || 0}
                </p>
                <p className="text-sm text-blue-600">Total Students: {stats?.students?.total || 0}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800">Escrow Balance</h3>
                <p className="text-2xl font-bold text-green-600">
                  ₹{stats?.escrow?.balance || 0}
                </p>
                <p className="text-sm text-green-600">Held securely</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'landlords' && <VerifyLandlords />}
        {activeTab === 'properties' && <VerifyProperties />}
        {activeTab === 'safety' && <SafetyDashboard />}
        
        {activeTab === 'disputes' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Disputes</h2>
            <p className="text-gray-600">Dispute resolution system coming soon...</p>
          </div>
        )}
        
        {activeTab === 'escrow' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Escrow Management</h2>
            <p className="text-gray-600">Escrow management system coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;