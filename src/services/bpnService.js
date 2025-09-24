// ==========================================
// 3. services/bpnService.js - NEW FILE untuk Frontend
// ==========================================

// Frontend service untuk BPN API
const BPN_BASE_URL = '/api/bpn';

export const bpnApi = {
  // Get BPN price data
  getPrices: async () => {
    try {
      const response = await fetch(`${BPN_BASE_URL}/prices`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching BPN prices:', error);
      throw error;
    }
  },

  // Get comparison data
  getComparison: async () => {
    try {
      const response = await fetch(`${BPN_BASE_URL}/comparison`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      throw error;
    }
  },

  // Get trends analysis
  getTrends: async () => {
    try {
      const response = await fetch(`${BPN_BASE_URL}/trends`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching trends:', error);
      throw error;
    }
  },

  // Get cache status
  getCacheStatus: async () => {
    try {
      const response = await fetch(`${BPN_BASE_URL}/cache/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching cache status:', error);
      throw error;
    }
  },

  // Clear cache
  clearCache: async () => {
    try {
      const response = await fetch(`${BPN_BASE_URL}/cache/clear`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }
};