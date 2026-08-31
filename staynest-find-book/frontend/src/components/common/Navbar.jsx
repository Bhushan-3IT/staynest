import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  PlusIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { 
    user, 
    logout, 
    isAuthenticated, 
    isStudent, 
    isLandlord, 
    isAdmin,
    isSGGSVerified 
  } = useAuth();
  
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  // ============================================
  // ✅ NAVIGATION LINKS - Role Based
  // ============================================
  const navLinks = [
  { path: '/', label: 'Home', icon: HomeIcon },
];

// ✅ FIX: Show "Find PG" ONLY for students and guests (NOT landlords)
// Landlords should NOT see "Find PG"
if (!isLandlord && !isAdmin) {
  navLinks.push({ path: '/properties', label: 'Find PG', icon: BuildingOfficeIcon });
}

// ✅ Show "Add Property" ONLY for landlords (NOT admin)
if (isLandlord) {
  navLinks.push({ 
    path: '/add-property', 
    label: 'Add Property', 
    icon: PlusIcon 
  });
}

// Show "Dashboard" for authenticated users
if (isAuthenticated) {
  navLinks.push({ 
    path: '/dashboard', 
    label: 'Dashboard', 
    icon: UserCircleIcon 
  });
}

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* ============================================
              LOGO
              ============================================ */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BuildingOfficeIcon className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">StayNest</span>
              {isAuthenticated && isSGGSVerified && (
                <span className="hidden md:inline-flex bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full items-center">
                  <AcademicCapIcon className="h-3 w-3 mr-1" />
                  SGGS
                </span>
              )}
            </Link>
          </div>

          {/* ============================================
              DESKTOP NAVIGATION
              ============================================ */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </div>
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* ============================================
                    USER PROFILE
                    ============================================ */}
                <div className="flex items-center space-x-2">
                  {/* Profile Photo */}
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* User Name */}
                  <span className="text-sm text-gray-700">{user?.name}</span>
                  
                  {/* ✅ SGGS Badge */}
                  {isSGGSVerified && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                      <AcademicCapIcon className="h-3 w-3 mr-1" />
                      SGGS
                    </span>
                  )}
                  
                  {/* Role Badges */}
                  {isAdmin && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                      <ShieldCheckIcon className="h-3 w-3 mr-1" />
                      Admin
                    </span>
                  )}
                  {isLandlord && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      Landlord
                    </span>
                  )}
                  {isStudent && !isSGGSVerified && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                      <ShieldCheckIcon className="h-3 w-3 mr-1" />
                      Pending
                    </span>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              // ============================================
              // NOT AUTHENTICATED - Login/Register Buttons
              // ============================================
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* ============================================
              MOBILE MENU TOGGLE
              ============================================ */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-indigo-600 p-2 rounded-md"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================
          MOBILE MENU
          ============================================ */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 max-h-[80vh] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                {/* ============================================
                    MOBILE USER PROFILE
                    ============================================ */}
                <div className="flex flex-col space-y-2 px-3 py-3 border-t border-gray-200 mt-2">
                  <div className="flex items-center space-x-3">
                    {user?.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-lg">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {isSGGSVerified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                            <AcademicCapIcon className="h-3 w-3 mr-1" />
                            SGGS
                          </span>
                        )}
                        {isAdmin && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                            <ShieldCheckIcon className="h-3 w-3 mr-1" />
                            Admin
                          </span>
                        )}
                        {isLandlord && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                            Landlord
                          </span>
                        )}
                        {isStudent && !isSGGSVerified && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* SGGS Info */}
                  {isSGGSVerified && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-green-700 flex items-center">
                        <AcademicCapIcon className="h-4 w-4 mr-1" />
                        Verified SGGS Nanded Student
                      </p>
                    </div>
                  )}
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md text-base font-medium w-full mt-2"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              // ============================================
              // MOBILE - NOT AUTHENTICATED
              // ============================================
              <div className="border-t border-gray-200 pt-3 mt-2 space-y-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center space-x-2 bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserGroupIcon className="h-5 w-5" />
                  <span>Register as SGGS Student</span>
                </Link>
                
                {/* SGGS Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2">
                  <p className="text-xs text-green-700 flex items-center">
                    <AcademicCapIcon className="h-4 w-4 mr-1" />
                    🎓 Only SGGS Nanded students can register
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;