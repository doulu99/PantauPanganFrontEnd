// ==========================================
// src/components/SembakoCard.jsx - KODE LENGKAP dengan Assets Lokal
// ==========================================
import React, { useState } from 'react';
import { MapPin, Calendar, TrendingUp, TrendingDown, Package, AlertCircle, Edit, Trash2 } from 'lucide-react';

const SembakoCard = ({ data, showAllPrices = true, enableEdit = false, onEdit, onDelete }) => {
  const [imageErrors, setImageErrors] = useState(new Set());

  // Format harga ke rupiah
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return 'N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format tanggal
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Handle image error
  const handleImageError = (commodityKey) => {
    setImageErrors(prev => new Set([...prev, commodityKey]));
  };

  // Daftar komoditas dengan icon, warna dan gambar lokal
  const commodities = [
    { 
      key: 'harga_beras', 
      name: 'Beras', 
      icon: '🌾', 
      color: 'text-yellow-600',
      image: '/assets/images/komoditas/beras.png',
      unit: '/kg'
    },
    { 
      key: 'harga_gula', 
      name: 'Gula', 
      icon: '🍯', 
      color: 'text-amber-600',
      image: '/assets/images/komoditas/gula.png',
      unit: '/kg'
    },
    { 
      key: 'harga_minyak', 
      name: 'Minyak', 
      icon: '🛢️', 
      color: 'text-orange-600',
      image: '/assets/images/komoditas/minyak.png',
      unit: '/liter'
    },
    { 
      key: 'harga_daging', 
      name: 'Daging', 
      icon: '🥩', 
      color: 'text-red-600',
      image: '/assets/images/komoditas/daging-sapi.png',
      unit: '/kg'
    },
    { 
      key: 'harga_ayam', 
      name: 'Ayam', 
      icon: '🐔', 
      color: 'text-yellow-500',
      image: '/assets/images/komoditas/daging-ayam.png',
      unit: '/kg'
    },
    { 
      key: 'harga_telur', 
      name: 'Telur', 
      icon: '🥚', 
      color: 'text-yellow-400',
      image: '/assets/images/komoditas/telur.png',
      unit: '/kg'
    },
    { 
      key: 'harga_bawang_merah', 
      name: 'B. Merah', 
      icon: '🧅', 
      color: 'text-red-500',
      image: '/assets/images/komoditas/bawang-merah.png',
      unit: '/kg'
    },
    { 
      key: 'harga_bawang_putih', 
      name: 'B. Putih', 
      icon: '🧄', 
      color: 'text-gray-500',
      image: '/assets/images/komoditas/bawang-putih.png',
      unit: '/kg'
    },
    { 
      key: 'harga_gas', 
      name: 'Gas LPG', 
      icon: '🫗', 
      color: 'text-blue-600',
      image: '/assets/images/komoditas/gas-lpg.png',
      unit: '/tabung'
    },
    { 
      key: 'harga_garam', 
      name: 'Garam', 
      icon: '🧂', 
      color: 'text-gray-400',
      image: '/assets/images/komoditas/garam.png',
      unit: '/kg'
    },
    { 
      key: 'harga_susu', 
      name: 'Susu', 
      icon: '🥛', 
      color: 'text-blue-400',
      image: '/assets/images/komoditas/susu.png',
      unit: '/liter'
    },
  ];

  // Filter komoditas yang ada harganya atau tampilkan semua
  const displayedCommodities = showAllPrices 
    ? commodities 
    : commodities.filter(c => data[c.key] && data[c.key] > 0);

  // Komponen untuk menampilkan gambar komoditas
  const CommodityImage = ({ commodity }) => {
    const hasError = imageErrors.has(commodity.key);
    
    if (hasError) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-lg">{commodity.icon}</span>
        </div>
      );
    }

    return (
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          src={commodity.image}
          alt={commodity.name}
          className="w-full h-full object-cover"
          onError={() => handleImageError(commodity.key)}
          onLoad={() => {
            // Remove from error set if it loads successfully
            setImageErrors(prev => {
              const newSet = new Set(prev);
              newSet.delete(commodity.key);
              return newSet;
            });
          }}
        />
      </div>
    );
  };

  // Calculate price statistics for the card
  const getPriceStats = () => {
    const prices = commodities
      .map(c => data[c.key])
      .filter(price => price && price > 0);
    
    if (prices.length === 0) return null;
    
    const total = prices.reduce((sum, price) => sum + price, 0);
    const average = total / prices.length;
    const highest = Math.max(...prices);
    const lowest = Math.min(...prices);
    
    return { total, average, highest, lowest, count: prices.length };
  };

  const priceStats = getPriceStats();

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1 group-hover:text-blue-100 transition-colors">
              {data.market_name || 'Unknown Market'}
            </h3>
            <div className="flex items-center text-blue-100 text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{data.province_name || 'Unknown Province'}</span>
            </div>
            <div className="flex items-center text-blue-100 text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(data.survey_date)}</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              data.source === 'google_sheet' ? 'bg-green-100 text-green-800' :
              data.source === 'google_form' ? 'bg-green-100 text-green-800' :
              data.source === 'import_csv' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {data.source === 'google_sheet' ? 'Google Sheets' :
               data.source === 'google_form' ? 'Google Form' :
               data.source === 'import_csv' ? 'CSV Import' : 
               data.source || 'Manual'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar (jika ada data harga) */}
      {priceStats && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 border-b border-blue-200">
          <div className="flex justify-between text-xs text-blue-700">
            <span>Data: {priceStats.count}/11</span>
            <span>Rata-rata: {formatPrice(priceStats.average)}</span>
            <span>Range: {formatPrice(priceStats.lowest)} - {formatPrice(priceStats.highest)}</span>
          </div>
        </div>
      )}

      {/* Body - Daftar Harga dengan Gambar */}
      <div className="p-4">
        <div className="grid grid-cols-1 gap-3">
          {displayedCommodities.map((commodity) => {
            const price = data[commodity.key];
            const hasPrice = price && price > 0;
            
            return (
              <div 
                key={commodity.key} 
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 group/item ${
                  hasPrice 
                    ? 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100' 
                    : 'bg-gradient-to-r from-gray-50 to-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CommodityImage commodity={commodity} />
                  <div>
                    <span className={`text-sm font-semibold transition-colors ${
                      hasPrice 
                        ? `${commodity.color} group-hover/item:text-blue-600` 
                        : 'text-gray-400'
                    }`}>
                      {commodity.name}
                    </span>
                    <p className="text-xs text-gray-500">{commodity.unit}</p>
                  </div>
                </div>
                <div className="text-right">
                  {hasPrice ? (
                    <span className="text-sm font-bold text-gray-800 group-hover/item:text-blue-700 transition-colors">
                      {formatPrice(price)}
                    </span>
                  ) : (
                    <span className="text-gray-400 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      N/A
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Actions */}
        {enableEdit && (onEdit || onDelete) && (
          <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(data)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center group/btn"
              >
                <Edit className="w-3 h-3 mr-1 group-hover/btn:scale-110 transition-transform" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(data.id)}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center justify-center group/btn"
              >
                <Trash2 className="w-3 h-3 mr-1 group-hover/btn:scale-110 transition-transform" />
                Hapus
              </button>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>ID: {data.id}</span>
          <div className="flex items-center space-x-2">
            {data.updated_at && (
              <span>Updated: {new Date(data.updated_at).toLocaleDateString('id-ID')}</span>
            )}
            <span className={`px-2 py-1 rounded-full font-medium ${
              data.status === 'published' ? 'bg-green-100 text-green-600' :
              data.status === 'draft' ? 'bg-yellow-100 text-yellow-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {data.status?.toUpperCase() || 'ACTIVE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SembakoCard;