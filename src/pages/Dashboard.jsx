// ==========================================
// 2. src/pages/Dashboard.jsx - Updated dengan Sembako Integration  
// ==========================================
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, TrendingUp, Users, MapPin, RefreshCw, 
  Plus, Download, Eye, Activity, Calendar, 
  ShoppingCart, Database, Clock, AlertTriangle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { sembakoApi } from "../services/sembakoApi";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sembakoStats, setSembakoStats] = useState(null);
  const [latestData, setLatestData] = useState([]);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch sembako statistics (using public endpoint for now)
      const statsResponse = await sembakoApi.getPublicStatistics();
      setSembakoStats(statsResponse.data.data);

      // Fetch latest data
      const latestResponse = await sembakoApi.getPublicLatest();
      setLatestData(latestResponse.data.data.slice(0, 10) || []);

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">Memuat Dashboard...</h3>
          <p className="text-gray-600">Mengambil data terbaru</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Admin
              </h1>
              <p className="text-gray-600 mt-1">
                Selamat datang, {user?.full_name || user?.username} - Sistem Monitoring Sembako
              </p>
            </div>
            
            <div className="flex gap-3 mt-4 sm:mt-0">
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </button>
              
              <Link
                to="/admin/sembako"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Kelola Sembako
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Data Sembako</p>
                <p className="text-2xl font-bold text-gray-800">
                  {sembakoStats?.summary?.total_records?.toLocaleString('id-ID') || 0}
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
                <p className="text-sm text-gray-600">Provinsi Terdaftar</p>
                <p className="text-2xl font-bold text-gray-800">
                  {sembakoStats?.summary?.total_provinces || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Komoditas Sembako</p>
                <p className="text-2xl font-bold text-gray-800">11</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Update Terakhir</p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date().toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/sembako"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-800">Kelola Data</h3>
                <p className="text-sm text-gray-600">CRUD Sembako</p>
              </div>
            </Link>

            <Link
              to="/admin/sembako"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Plus className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-800">Tambah Data</h3>
                <p className="text-sm text-gray-600">Input Manual</p>
              </div>
            </Link>

            <button
              onClick={() => window.open('/api/sembako/export/csv', '_blank')}
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Download className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-800">Export CSV</h3>
                <p className="text-sm text-gray-600">Download Data</p>
              </div>
            </button>

            <Link
              to="/sembako"
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Eye className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-800">View Public</h3>
                <p className="text-sm text-gray-600">Lihat Publik</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Average Prices Overview */}
        {sembakoStats?.average_prices && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Rata-rata Harga Nasional
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(sembakoStats.average_prices).map(([key, price]) => {
                const commodityInfo = {
                  harga_beras: { name: 'Beras', icon: '🌾', color: 'bg-yellow-50 border-yellow-200' },
                  harga_gula: { name: 'Gula', icon: '🍯', color: 'bg-amber-50 border-amber-200' },
                  harga_minyak: { name: 'Minyak', icon: '🛢️', color: 'bg-orange-50 border-orange-200' },
                  harga_daging: { name: 'Daging', icon: '🥩', color: 'bg-red-50 border-red-200' },
                  harga_ayam: { name: 'Ayam', icon: '🐔', color: 'bg-yellow-50 border-yellow-200' },
                  harga_telur: { name: 'Telur', icon: '🥚', color: 'bg-yellow-50 border-yellow-200' },
                  harga_bawang_merah: { name: 'B. Merah', icon: '🧅', color: 'bg-red-50 border-red-200' },
                  harga_bawang_putih: { name: 'B. Putih', icon: '🧄', color: 'bg-gray-50 border-gray-200' },
                  harga_gas: { name: 'Gas LPG', icon: '🫗', color: 'bg-blue-50 border-blue-200' },
                  harga_garam: { name: 'Garam', icon: '🧂', color: 'bg-gray-50 border-gray-200' },
                  harga_susu: { name: 'Susu', icon: '🥛', color: 'bg-blue-50 border-blue-200' },
                };

                const commodity = commodityInfo[key];
                if (!commodity) return null;

                return (
                  <div key={key} className={`border-2 rounded-lg p-4 ${commodity.color}`}>
                    <div className="text-center">
                      <div className="text-2xl mb-2">{commodity.icon}</div>
                      <h4 className="font-medium text-gray-800 mb-1">{commodity.name}</h4>
                      <p className="text-lg font-bold text-blue-600">
                        {formatPrice(parseFloat(price))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Latest Data Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Data Terbaru ({latestData.length})
            </h2>
          </div>
          
          {latestData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pasar & Lokasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beras
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Minyak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ayam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {latestData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.market_name}
                          </div>
                          <div className="text-sm text-gray-500">{item.province_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.survey_date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.harga_beras ? formatPrice(item.harga_beras) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.harga_gula ? formatPrice(item.harga_gula) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.harga_minyak ? formatPrice(item.harga_minyak) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.harga_ayam ? formatPrice(item.harga_ayam) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status?.toUpperCase() || 'PUBLISHED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Belum ada data</h3>
              <p className="text-gray-600 mb-4">Mulai dengan menambahkan data sembako pertama</p>
              <Link
                to="/admin/sembako"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Data
              </Link>
            </div>
          )}
        </div>

        {/* Province Statistics */}
        {sembakoStats?.province_stats && sembakoStats.province_stats.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Top 10 Provinsi (Berdasarkan Jumlah Data)
            </h2>
            
            <div className="space-y-3">
              {sembakoStats.province_stats.slice(0, 10).map((province, index) => (
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
                    <span className="text-lg font-bold text-gray-800">
                      {province.total_records} data
                    </span>
                    {province.latest_survey && (
                      <p className="text-sm text-gray-500">
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
    </div>
  );
};

export default Dashboard;