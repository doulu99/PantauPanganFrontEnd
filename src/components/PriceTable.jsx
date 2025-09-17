import React from 'react';
import { TrendingUp, TrendingDown, Minus, Eye, Edit } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const PriceTable = ({ prices, onEditPrice }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold">Harga Komoditas Hari Ini</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Komoditas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Harga
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Perubahan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sumber
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prices.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.commodity?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.commodity?.unit}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {item.commodity?.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.price)}
                  </div>
                  {item.yesterday_price && (
                    <div className="text-xs text-gray-500">
                      Kemarin: {formatCurrency(item.yesterday_price)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {item.gap_change === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                    ) : item.gap_change === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <Minus className="w-4 h-4 text-gray-500 mr-1" />
                    )}
                    <span className={`text-sm ${
                      item.gap_change === 'up' ? 'text-red-500' : 
                      item.gap_change === 'down' ? 'text-green-500' : 
                      'text-gray-500'
                    }`}>
                      {item.gap_percentage || 0}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.is_override ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.is_override ? 'Manual' : 'API'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEditPrice(item)}
                    className="text-orange-600 hover:text-orange-900"
                  >
                    <Edit className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceTable;