// ==========================================
// 2. src/components/SembakoCard.jsx
// ==========================================
import React from 'react';
import { MapPin, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

const SembakoCard = ({ data, showAllPrices = true }) => {
  // Format harga ke rupiah
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format tanggal
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Daftar komoditas dengan icon dan warna
  const commodities = [
    { key: 'harga_beras', name: 'Beras', icon: '🌾', color: 'text-yellow-600' },
    { key: 'harga_gula', name: 'Gula', icon: '🍯', color: 'text-amber-600' },
    { key: 'harga_minyak', name: 'Minyak', icon: '🛢️', color: 'text-orange-600' },
    { key: 'harga_daging', name: 'Daging', icon: '🥩', color: 'text-red-600' },
    { key: 'harga_ayam', name: 'Ayam', icon: '🐔', color: 'text-yellow-500' },
    { key: 'harga_telur', name: 'Telur', icon: '🥚', color: 'text-yellow-400' },
    { key: 'harga_bawang_merah', name: 'B. Merah', icon: '🧅', color: 'text-red-500' },
    { key: 'harga_bawang_putih', name: 'B. Putih', icon: '🧄', color: 'text-gray-500' },
    { key: 'harga_gas', name: 'Gas LPG', icon: '🫗', color: 'text-blue-600' },
    { key: 'harga_garam', name: 'Garam', icon: '🧂', color: 'text-gray-400' },
    { key: 'harga_susu', name: 'Susu', icon: '🥛', color: 'text-blue-400' },
  ];

  // Filter komoditas yang ada harganya atau tampilkan semua
  const displayedCommodities = showAllPrices 
    ? commodities 
    : commodities.filter(c => data[c.key] && data[c.key] > 0);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{data.market_name}</h3>
            <div className="flex items-center text-blue-100 text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{data.province_name}</span>
            </div>
            <div className="flex items-center text-blue-100 text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(data.survey_date)}</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              data.source === 'google_form' ? 'bg-green-100 text-green-800' :
              data.source === 'import_csv' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {data.source === 'google_form' ? 'Google Form' :
               data.source === 'import_csv' ? 'CSV Import' : 
               data.source || 'Manual'}
            </span>
          </div>
        </div>
      </div>

      {/* Body - Daftar Harga */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {displayedCommodities.map((commodity) => (
            <div 
              key={commodity.key} 
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <span className="text-lg mr-2">{commodity.icon}</span>
                <span className={`text-sm font-medium ${commodity.color}`}>
                  {commodity.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-800">
                  {data[commodity.key] ? formatPrice(data[commodity.key]) : 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>ID: {data.id}</span>
          <span className={`px-2 py-1 rounded-full ${
            data.status === 'published' ? 'bg-green-100 text-green-600' :
            data.status === 'draft' ? 'bg-yellow-100 text-yellow-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {data.status?.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SembakoCard;