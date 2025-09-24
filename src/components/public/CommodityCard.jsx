// ==========================================
// src/components/public/CommodityCard.jsx - Complete Component
// ==========================================
import React, { useState } from 'react';
import { MapPin, Calendar, Package, ArrowUp, ArrowDown, Minus } from 'lucide-react';

// Utility function untuk format harga
const formatPrice = (price) => {
  if (!price || isNaN(price)) return 'N/A';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// ==========================================
// COMMODITY IMAGE COMPONENT
// ==========================================
const CommodityImage = ({ commodityKey, commodity, imageError, onImageError, className = "w-16 h-16" }) => {
  if (imageError) {
    return (
      <div className={`${className} rounded-2xl bg-gradient-to-br ${commodity.gradient} flex items-center justify-center shadow-lg`}>
        <span className="text-2xl">{commodity.icon}</span>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden group-hover:scale-110 transition-transform duration-300 p-2`}>
      <img
        src={commodity.image}
        alt={commodity.name}
        className="w-full h-full object-contain"
        onError={onImageError}
        onLoad={() => {
          // Reset error state if image loads successfully
          console.log(`Image loaded successfully for ${commodity.name}`);
        }}
      />
    </div>
  );
};

// ==========================================
// TREND INDICATOR COMPONENT
// ==========================================
export const TrendIndicator = ({ trend, value, percentage }) => {
  if (trend === 'up') {
    return (
      <div className="flex items-center text-red-600">
        <ArrowUp className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium">+{formatPrice(Math.abs(value))}</span>
        <span className="text-xs ml-1">(+{percentage?.toFixed(2)}%)</span>
      </div>
    );
  } else if (trend === 'down') {
    return (
      <div className="flex items-center text-green-600">
        <ArrowDown className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium">-{formatPrice(Math.abs(value))}</span>
        <span className="text-xs ml-1">(-{Math.abs(percentage)?.toFixed(2)}%)</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center text-gray-600">
        <Minus className="w-4 h-4 mr-1" />
        <span className="text-sm">Stabil</span>
      </div>
    );
  }
};

// ==========================================
// COMMODITY CARD (Internal Data)
// ==========================================
export const CommodityCard = ({ commodityKey, commodity, price, latestData }) => {
  const [imageError, setImageError] = useState(false);

  if (!price) return null;

  return (
    <div className="group">
      <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 transform">
        <div className="flex items-center mb-4">
          <CommodityImage 
            commodityKey={commodityKey}
            commodity={commodity}
            imageError={imageError}
            onImageError={() => setImageError(true)}
            className="w-16 h-16 mr-4"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-800">{commodity.name}</h3>
            <p className="text-sm text-gray-500">Per {commodity.unit.replace('/', '')}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Harga Saat Ini:</span>
            <span className="text-2xl font-bold text-blue-600">{formatPrice(price)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Lokasi:</span>
            <span className="text-sm text-gray-700 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {latestData?.region_name || 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tanggal:</span>
            <span className="text-sm text-gray-700 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {latestData?.tanggal ? new Date(latestData.tanggal).toLocaleDateString('id-ID') : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// BPN CARD COMPONENT
// ==========================================
export const BPNCard = ({ item }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group">
      <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 transform">
        <div className="flex items-center mb-4">
          {!imageError && (item.image_url || item.background) ? (
            <img 
              src={item.image_url || item.background} 
              alt={item.name}
              className="w-16 h-16 rounded-xl mr-4 object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
            <p className="text-sm text-gray-500">Per {item.unit || item.satuan || 'kg'}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Harga Hari Ini:</span>
            <span className="text-2xl font-bold text-orange-600">
              {formatPrice(item.today || item.price || 0)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Perubahan:</span>
            <TrendIndicator 
              trend={item.gap_change || (item.gap > 0 ? 'up' : item.gap < 0 ? 'down' : 'stable')} 
              value={item.gap || 0} 
              percentage={item.gap_percentage || 0}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tanggal Update:</span>
            <span className="text-sm text-gray-700">
              {item.yesterday_date ? new Date(item.yesterday_date).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPARISON CARD COMPONENT
// ==========================================
export const ComparisonCard = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const isHigher = item.trend === 'higher';
  const isLower = item.trend === 'lower';
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {!imageError && item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.commodity_name}
              className="w-12 h-12 rounded-lg mr-3"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <h4 className="font-semibold text-gray-800">{item.commodity_name}</h4>
            <p className="text-xs text-gray-500">{item.unit}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isHigher ? 'bg-red-100 text-red-700' : 
          isLower ? 'bg-green-100 text-green-700' : 
          'bg-gray-100 text-gray-700'
        }`}>
          {isHigher ? 'Lebih Tinggi' : isLower ? 'Lebih Rendah' : 'Sama'}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Data Internal:</span>
          <span className="font-semibold text-blue-600">{formatPrice(item.internal_price)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Data BPN:</span>
          <span className="font-semibold text-orange-600">{formatPrice(item.bpn_price)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Selisih:</span>
          <div className="flex items-center">
            {item.difference > 0 ? (
              <ArrowUp className="w-4 h-4 text-red-500 mr-1" />
            ) : item.difference < 0 ? (
              <ArrowDown className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <Minus className="w-4 h-4 text-gray-500 mr-1" />
            )}
            <span className={`font-semibold ${
              item.difference > 0 ? 'text-red-600' : 
              item.difference < 0 ? 'text-green-600' : 'text-gray-600'
            }`}>
              {formatPrice(Math.abs(item.difference))}
            </span>
            <span className="text-xs text-gray-500 ml-1">
              ({Math.abs(item.percentage_difference).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// DEFAULT EXPORT (if needed)
// ==========================================
export default {
  CommodityCard,
  BPNCard,
  ComparisonCard,
  TrendIndicator
};