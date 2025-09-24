// ==========================================
// 1. src/services/sembakoApi.js
// ==========================================
import axios from 'axios';

// Konfigurasi API base dari environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}/sembako`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor untuk handle errors
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

// API methods
export const sembakoApi = {
  // Public APIs (no auth required)
  getPublicStatistics: () => 
    axios.get(`${API_BASE_URL}/${API_VERSION}/sembako/public/statistics`),
  
  getPublicLatest: (province = '') => 
    axios.get(`${API_BASE_URL}/${API_VERSION}/sembako/public/latest${province ? `?province=${province}` : ''}`),

  // Private APIs (auth required)
  getAll: (params = {}) => api.get('/', { params }),
  getById: (id) => api.get(`/${id}`),
  create: (data) => api.post('/', data),
  update: (id, data) => api.put(`/${id}`, data),
  delete: (id) => api.delete(`/${id}`),
  
  // Special endpoints
  getStatistics: () => api.get('/statistics'),
  getLatest: (province = '') => api.get(`/latest${province ? `?province=${province}` : ''}`),
  getTrends: (commodity, province = '', days = 30) => 
    api.get(`/analysis/trends?commodity=${commodity}&province=${province}&days=${days}`),
  
  // Import/Export
  importCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  exportCSV: (params = {}) => api.get('/export/csv', { 
    params, 
    responseType: 'blob' 
  }),
  
  // Search
  getProvinces: () => api.get('/search/province'),
  getMarkets: (province = '') => api.get(`/search/markets${province ? `?province=${province}` : ''}`),
  
  // Bulk operations
  bulkDelete: (ids) => api.post('/bulk/delete', { ids }),
};