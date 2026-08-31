import React from 'react';
import { 
  UserGroupIcon, 
  HomeIcon, 
  ShieldCheckIcon, 
  ExclamationCircleIcon,
  CurrencyRupeeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const AdminStats = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Students',
      value: stats?.students?.total || 0,
      icon: UserGroupIcon,
      color: 'bg-blue-100 text-blue-600',
      subText: `${stats?.students?.offCampus || 0} off-campus`,
    },
    {
      label: 'Properties',
      value: stats?.properties?.total || 0,
      icon: HomeIcon,
      color: 'bg-green-100 text-green-600',
      subText: `${stats?.properties?.pending || 0} pending verification`,
    },
    {
      label: 'Pending Landlords',
      value: stats?.landlords?.pending || 0,
      icon: ShieldCheckIcon,
      color: 'bg-yellow-100 text-yellow-600',
      subText: `${stats?.landlords?.total || 0} total landlords`,
    },
    {
      label: 'Escrow Balance',
      value: `₹${stats?.escrow?.balance || 0}`,
      icon: CurrencyRupeeIcon,
      color: 'bg-purple-100 text-purple-600',
      subText: 'Held in SGGS Escrow',
    },
    {
      label: 'Open Complaints',
      value: stats?.complaints?.open || 0,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-red-100 text-red-600',
      subText: `${stats?.complaints?.total || 0} total complaints`,
    },
    {
      label: 'Active Disputes',
      value: stats?.disputes?.active || 0,
      icon: ExclamationCircleIcon,
      color: 'bg-orange-100 text-orange-600',
      subText: `${stats?.disputes?.total || 0} total disputes`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              {item.subText && (
                <p className="text-xs text-gray-500 mt-1">{item.subText}</p>
              )}
            </div>
            <div className={`h-12 w-12 rounded-lg ${item.color} flex items-center justify-center`}>
              <item.icon className="h-6 w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;