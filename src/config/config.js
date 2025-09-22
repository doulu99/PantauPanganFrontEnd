// src/config/config.js
const config = {
  // Base URL dari environment variable dengan fallback ke localhost untuk development
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  
  // API version
  API_VERSION: import.meta.env.VITE_API_VERSION || 'api',
  
  // Full API URL
  get API_URL() {
    return `${this.API_BASE_URL}/${this.API_VERSION}`;
  },

  // Public API URL (tanpa auth)
  get PUBLIC_API_URL() {
    return `${this.API_BASE_URL}/public`;
  }
};

export default config;