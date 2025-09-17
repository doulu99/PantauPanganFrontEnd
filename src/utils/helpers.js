export const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getCategoryColor = (category) => {
  const colors = {
    beras: 'blue',
    sayuran: 'green',
    daging: 'red',
    bumbu: 'orange',
    lainnya: 'gray'
  };
  return colors[category] || 'gray';
};

export const getPriceChangeIcon = (change) => {
  if (change > 0) return '↑';
  if (change < 0) return '↓';
  return '→';
};