// ==========================================
// 3. src/components/SembakoStats.jsx
// ==========================================
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MapPin, Calendar, RefreshCw } from 'lucide-react';
import { sembakoApi } from '../services/sembakoApi';

const SembakoStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await sembakoApi.getPublicStatistics();
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Data</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats?.summary?.total_records?.toLocaleString('id-ID') || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Provinsi</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats?.summary?.total_provinces || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Update Terakhir</p>
              <p className="text-sm font-medium text-gray-800">
                {stats?.summary?.latest_update ? 
                  new Date(stats.summary.latest_update).toLocaleDateString('id-ID') : 
                  'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Average Prices */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Rata-rata Harga Nasional
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stats?.average_prices && Object.entries(stats.average_prices).map(([key, price]) => {
            const commodityNames = {
              harga_beras: { name: 'Beras', icon: '🌾' },
              harga_gula: { name: 'Gula', icon: '🍯' },
              harga_minyak: { name: 'Minyak', icon: '🛢️' },
              harga_daging: { name: 'Daging', icon: '🥩' },
              harga_ayam: { name: 'Ayam', icon: '🐔' },
              harga_telur: { name: 'Telur', icon: '🥚' },
              harga_bawang_merah: { name: 'Bawang Merah', icon: '🧅' },
              harga_bawang_putih: { name: 'Bawang Putih', icon: '🧄' },
              harga_gas: { name: 'Gas LPG', icon: '🫗' },
              harga_garam: { name: 'Garam', icon: '🧂' },
              harga_susu: { name: 'Susu', icon: '🥛' },
            };

            const commodity = commodityNames[key];
            if (!commodity) return null;

            return (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">{commodity.icon}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {commodity.name}
                  </span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {formatPrice(parseFloat(price))}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Provinces */}
      {stats?.province_stats && stats.province_stats.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Data per Provinsi
          </h3>
          
          <div className="space-y-3">
            {stats.province_stats.slice(0, 10).map((province, index) => (
              <div key={province.province} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                    index < 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-800">{province.province}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-800">
                    {province.total_records} data
                  </span>
                  {province.latest_survey && (
                    <p className="text-xs text-gray-500">
                      Terakhir: {new Date(province.latest_survey).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SembakoStats;