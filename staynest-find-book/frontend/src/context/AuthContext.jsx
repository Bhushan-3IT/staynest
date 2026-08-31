import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set auth token in axios headers
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.data);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // Verify OTP
  const verifyOTP = async (otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { otp });
      setUser(response.data.data);
      return { success: true, user: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'OTP verification failed' 
      };
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    try {
      await api.post('/auth/resend-otp');
      return { success: true, message: 'OTP resent successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to resend OTP' 
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Update profile
  const updateProfile = async (data) => {
    try {
      const response = await api.put('/auth/update-profile', data);
      setUser(response.data.data);
      return { success: true, user: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password change failed' 
      };
    }
  };

  // Upload profile photo
  const uploadProfilePhoto = async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      
      const response = await api.post('/auth/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUser({ ...user, profilePhoto: response.data.data.profilePhoto });
      return { success: true, photoUrl: response.data.data.profilePhoto };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Photo upload failed' 
      };
    }
  };

  // Save property
  const saveProperty = async (propertyId) => {
    try {
      await api.post(`/auth/save-property/${propertyId}`);
      const response = await api.get('/auth/me');
      setUser(response.data.data);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to save property' 
      };
    }
  };

  // ✅ FIX: Only ONE const value = { ... }
  const value = {
    user,
    loading,
    token,
    login,
    register,
    verifyOTP,
    resendOTP,
    logout,
    updateProfile,
    changePassword,
    uploadProfilePhoto,
    saveProperty,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isLandlord: user?.role === 'landlord',
    isAdmin: user?.role === 'admin',
    isSGGSVerified: user?.isSGGSVerified || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;