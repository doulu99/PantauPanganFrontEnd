import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

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

export const marketPriceAPI = {
  getMarketPrices: (params) => api.get('/market-prices', { params }),
  addMarketPrice: (data) => api.post('/market-prices', data),
  comparePrices: (params) => api.get('/market-prices/compare', { params }),
  getPriceTrends: (params) => api.get('/market-prices/trends', { params })
};

export default api;