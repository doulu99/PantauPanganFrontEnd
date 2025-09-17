// src/services/api.js - Updated version
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor untuk token
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

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Existing APIs
export const priceAPI = {
  getCurrentPrices: (params) => api.get('/prices/current', { params }),
  getPriceHistory: (commodityId) => api.get(`/prices/history/${commodityId}`),
  getStatistics: (params) => api.get('/prices/statistics', { params }),
  syncPrices: (data) => api.post('/prices/sync', data),
  exportPrices: (params) => api.get('/prices/export', { params })
};

export const overrideAPI = {
  getOverrides: (params) => api.get('/overrides', { params }),
  createOverride: (data) => api.post('/overrides', data),
  updateStatus: (id, data) => api.patch(`/overrides/${id}/status`, data),
  deleteOverride: (id) => api.delete(`/overrides/${id}`)
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile')
};

export const regionAPI = {
  getProvinces: () => api.get('/regions/provinces'),
  getCities: (provinceId) => api.get(`/regions/cities/${provinceId}`),
  getAllRegions: () => api.get('/regions/all')
};

// Updated Market Price API
export const marketPriceAPI = {
  // Basic CRUD operations
  getMarketPrices: (params) => api.get('/market-prices', { params }),
  addMarketPrice: (data) => api.post('/market-prices', data),
  updateMarketPrice: (id, data) => api.put(`/market-prices/${id}`, data),
  deleteMarketPrice: (id) => api.delete(`/market-prices/${id}`),
  
  // Market price specific endpoints
  getMarketStats: (params) => api.get('/market-prices/stats', { params }),
  comparePrices: (params) => api.get('/market-prices/compare', { params }),
  getPriceTrends: (params) => api.get('/market-prices/trends', { params }),
  getMarketComparison: (params) => api.get('/market-prices/market-comparison', { params }),
  
  // Analytics - create endpoint jika belum ada
  getPriceAnalytics: (params) => {
    // Fallback jika endpoint analytics belum ada
    return api.get('/market-prices/stats', { params }).catch(() => ({
      data: {
        success: true,
        data: {
          total_records: 0,
          average_price: 0,
          unique_markets: 0,
          active_commodities: 0,
          price_trends: [],
          top_markets: []
        }
      }
    }));
  },
  
  // Import/Export functions
  downloadImportTemplate: () => api.get('/market-prices/template', { 
    responseType: 'blob' 
  }).catch(() => {
    // Fallback jika endpoint belum ada
    console.warn('Import template endpoint not available');
    return Promise.reject(new Error('Import template not available'));
  }),
  
  validateImportData: (formData, config = {}) => api.post('/market-prices/validate-import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config
  }).catch(() => {
    console.warn('Import validation endpoint not available');
    return Promise.reject(new Error('Import validation not available'));
  }),
  
  importMarketPrices: (formData, config = {}) => api.post('/market-prices/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config
  }).catch(() => {
    console.warn('Import endpoint not available');
    return Promise.reject(new Error('Import feature not available'));
  }),
  
  exportMarketPrices: (params) => api.get('/market-prices/export', { 
    params, 
    responseType: 'blob' 
  }).catch(() => {
    console.warn('Export endpoint not available');
    return Promise.reject(new Error('Export feature not available'));
  }),
  
  // Bulk operations
  bulkUpdatePrices: (data) => api.post('/market-prices/bulk-update', data),
  bulkDeletePrices: (ids) => api.post('/market-prices/bulk-delete', { ids }),
  
  // Helper functions
  getMarketList: (params) => api.get('/market-prices/markets', { params }),
  getLocationList: (params) => api.get('/market-prices/locations', { params })
};

// Custom Commodity API
export const customCommodityAPI = {
  getCustomCommodities: (params) => api.get('/commodities/custom', { params }),
  createCustomCommodity: (data) => api.post('/commodities/custom', data),
  updateCustomCommodity: (id, data) => api.put(`/commodities/custom/${id}`, data),
  deleteCustomCommodity: (id) => api.delete(`/commodities/custom/${id}`),
  getCustomCommodityById: (id) => api.get(`/commodities/custom/${id}`),
  getCustomCommodityStats: (params) => api.get('/commodities/custom/stats', { params })
};

// Add compatibility functions untuk komponen yang sudah ada
marketPriceAPI.getCustomCommodities = customCommodityAPI.getCustomCommodities;
marketPriceAPI.createCustomCommodity = customCommodityAPI.createCustomCommodity;

export default api;