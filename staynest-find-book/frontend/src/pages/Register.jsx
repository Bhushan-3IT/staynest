import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  PhoneIcon, 
  AcademicCapIcon,
  BuildingOfficeIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

// Rest remains the same...

const Register = () => {
  const navigate = useNavigate();
  const { register, user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student',
    collegeName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role,
    });
  };

const validateStep1 = () => {
  if (!formData.name.trim()) {
    setError('Please enter your full name');
    return false;
  }
  if (!formData.email.trim()) {
    setError('Please enter your email');
    return false;
  }
  
  // ✅ ROLE-BASED EMAIL VALIDATION
  if (formData.role === 'student' && !formData.email.endsWith('@sggs.ac.in')) {
    setError('Only SGGS Nanded students (@sggs.ac.in) can register as students');
    return false;
  }
  
  // Landlord: Any email is allowed (no validation)
  
  if (!formData.password) {
    setError('Please enter a password');
    return false;
  }
  if (formData.password.length < 6) {
    setError('Password must be at least 6 characters');
    return false;
  }
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return false;
  }
  return true;
};

  const validateStep2 = () => {
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    if (formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (formData.role === 'student' && !formData.collegeName.trim()) {
      setError('Please enter your college name');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setError('');
    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">Create Account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join StayNest and find your perfect stay
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
          <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {step === 1 ? (
            // Step 1: Basic Info
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={formData.role === 'student' ? 'yourname@sggs.ac.in' : 'your@email.com'}
                  />
                  </div>
                {formData.role === 'student' && (
                  <p className="text-xs text-indigo-600 mt-1 flex items-center">
                    <AcademicCapIcon className="h-3 w-3 mr-1" />
                    SGGS Nanded students: use your @sggs.ac.in email
                  </p>
                )}
                {formData.role === 'landlord' && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                    Any email is allowed for landlords
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next Step →
              </button>
            </div>
          ) : (
            // Step 2: Additional Info
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter 10-digit phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('student')}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      formData.role === 'student'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <AcademicCapIcon className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-sm font-medium">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('landlord')}
                    className={`p-3 border-2 rounded-lg text-center transition-colors ${
                      formData.role === 'landlord'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <BuildingOfficeIcon className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-sm font-medium">Landlord</span>
                  </button>
                </div>
              </div>
              // Add this near the collegeName input field
<div className="mt-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    College Name *
  </label>
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <AcademicCapIcon className="h-5 w-5 text-gray-400" />
    </div>
    <select
      name="collegeName"
      value={formData.collegeName}
      onChange={handleChange}
      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    >
      <option value="">Select your college</option>
      <option value="SGGS Nanded - Shri Guru Gobind Singhji Institute of Engineering and Technology">SGGS Nanded - SGGSIET</option>
      <option value="Other">Other College</option>
    </select>
  </div>
  {/* Show text input if "Other" is selected */}
  {formData.collegeName === 'Other' && (
    <input
      type="text"
      name="collegeNameCustom"
      placeholder="Enter your college name"
      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      onChange={(e) => {
        setFormData({
          ...formData,
          collegeName: e.target.value,
        });
      }}
    />
  )}
</div>

              {formData.role === 'student' && (
                
                <div>
                  <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700 mb-1">
                    College Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="collegeName"
                      name="collegeName"
                      type="text"
                      required={formData.role === 'student'}
                      value={formData.collegeName}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your college name"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;