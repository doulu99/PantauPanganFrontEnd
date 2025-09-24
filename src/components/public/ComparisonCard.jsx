// ==========================================
// src/components/public/ComparisonCard.jsx
// ==========================================
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const ComparisonCard = ({ item }) => {
  const isHigher = item.trend === 'higher';
  const isLower = item.trend === 'lower';
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.commodity_name}
              className="w-12 h-12 rounded-lg mr-3"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <div style={{ display: 'none' }} className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
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