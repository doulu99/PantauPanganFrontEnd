// ==========================================
// src/utils/formatters.js - Utility Functions
// ==========================================
export const formatPrice = (price) => {
  if (!price || isNaN(price)) return 'N/A';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('id-ID');
};