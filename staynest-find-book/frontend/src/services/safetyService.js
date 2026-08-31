import api from './api';

export const safetyService = {
  // Calculate safety score for a location
  calculateSafety: (data) => api.post('/safety/calculate', data),
  
  // Get route from SGGS to property
  getRoute: (propertyId) => api.get(`/safety/route/${propertyId}`),
};