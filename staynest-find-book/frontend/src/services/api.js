import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ✅ FIX: Export BOTH default AND named exports
export default api;        // ← For AuthContext
export { api };            // ← For admin components

// API service methods
export const propertyService = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => {
    console.log('🔍 API call: GET /properties/' + id);
    return api.get(`/properties/${id}`);
  },
  create: (data) => {
    return api.post('/properties', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/properties/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.put(`/properties/${id}`, data);
  },
  delete: (id) => api.delete(`/properties/${id}`),
  getMyProperties: () => api.get('/properties/my-properties'),
  verify: (id) => api.put(`/properties/${id}/verify`),
  getStats: () => api.get('/properties/admin/stats'),
};

export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getStudentBookings: () => api.get('/bookings/student'),
  getLandlordBookings: () => api.get('/bookings/landlord'),
  getAllBookings: (params) => api.get('/bookings/admin', { params }),
  updateStatus: (id, status, data) => api.put(`/bookings/${id}/status`, { status, ...data }),
  cancel: (id) => api.delete(`/bookings/${id}/cancel`),
  getStats: () => api.get('/bookings/admin/stats'),
  autoCancel: () => api.get('/bookings/admin/auto-cancel'),
};

export const reviewService = {
  create: (data) => api.post('/reviews', data),
  getPropertyReviews: (propertyId, params) => 
    api.get(`/reviews/property/${propertyId}`, { params }),
  getMyReviews: () => api.get('/reviews/my-reviews'),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getStats: () => api.get('/reviews/admin/stats'),
};