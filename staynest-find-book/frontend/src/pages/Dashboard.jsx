import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/student/StudentDashboard';
import LandlordDashboard from '../components/landlord/LandlordDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';
import Loader from '../components/common/Loader';

const Dashboard = () => {
  const { user, loading, isStudent, isLandlord, isAdmin } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isStudent && <StudentDashboard />}
      {isLandlord && <LandlordDashboard />}
      {isAdmin && <AdminDashboard />}
    </div>
  );
};

export default Dashboard;