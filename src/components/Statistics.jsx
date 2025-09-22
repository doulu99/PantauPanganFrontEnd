// src/components/Statistics.jsx
import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';
import config from '../config/config.js';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topExpensive, setTopExpensive] = useState([]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${config.API_URL}/market-prices/statistics`);
      const data = await res.json();
      
      if (data.success) {
        setStats(data.data);
      }

      // Fetch sample data for top expensive products
      const pricesRes = await fetch(`${config.PUBLIC_API_URL}/market-prices?limit=100`);
      const pricesData = await pricesRes.json();
      
      if (pricesData.success) {
        const sortedByPrice = pricesData.data
          .sort((a, b) => b.price - a.price)
          .slice(0, 5);
        setTopExpensive(sortedByPrice);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading statistics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averagePrice ? formatCurrency(stats.averagePrice) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Max Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.maxPrice ? formatCurrency(stats.maxPrice) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Min Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.minPrice ? formatCurrency(stats.minPrice) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Expensive Products */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 ml-2">
              Top 5 Most Expensive Products
            </h3>
          </div>
        </div>
        <div className="p-6">
          {topExpensive.length > 0 ? (
            <div className="space-y-4">
              {topExpensive.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{item.commodity_name}</p>
                      <p className="text-sm text-gray-500">{item.market_name} - {item.province_name}</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;