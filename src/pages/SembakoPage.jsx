// ==========================================
// src/pages/SembakoPage.jsx - Menggunakan Assets Lokal (LENGKAP)
// ==========================================
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, RefreshCw, Download, MapPin, Calendar,
  TrendingUp, BarChart3, AlertCircle, Package, Grid, List,
  ChevronDown, Globe, Activity, ArrowRight
} from 'lucide-react';
import { sembakoApi } from '../services/sembakoApi';
import SembakoCard from '../components/SembakoCard';
import SembakoStats from '../components/SembakoStats';
import { Link } from 'react-router-dom';

const SembakoPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    province_name: '',
    market_name: '',
    start_date: '',
    end_date: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [stats, setStats] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());

  // Data komoditas dengan gambar lokal
  const commoditiesWithImages = {
    harga_beras: { 
      name: 'Beras', 
      icon: '🌾', 
      unit: '/kg',
      image: '/assets/images/komoditas/beras.png',
      gradient: 'from-yellow-400 to-amber-500'
    },
    harga_gula: { 
      name: 'Gula', 
      icon: '🍯', 
      unit: '/kg',
      image: '/assets/images/komoditas/gula.png',
      gradient: 'from-amber-400 to-orange-500'
    },
    harga_minyak: { 
      name: 'Minyak', 
      icon: '🛢️', 
      unit: '/liter',
      image: '/assets/images/komoditas/minyak.png',
      gradient: 'from-orange-400 to-red-500'
    },
    harga_daging: { 
      name: 'Daging Sapi', 
      icon: '🥩', 
      unit: '/kg',
      image: '/assets/images/komoditas/daging-sapi.png',
      gradient: 'from-red-400 to-pink-500'
    },
    harga_ayam: { 
      name: 'Ayam', 
      icon: '🐔', 
      unit: '/kg',
      image: '/assets/images/komoditas/daging-ayam.png',
      gradient: 'from-yellow-400 to-yellow-500'
    },
    harga_telur: { 
      name: 'Telur', 
      icon: '🥚', 
      unit: '/kg',
      image: '/assets/images/komoditas/telur.png',
      gradient: 'from-yellow-300 to-amber-400'
    },
    harga_bawang_merah: { 
      name: 'Bawang Merah', 
      icon: '🧅', 
      unit: '/kg',
      image: '/assets/images/komoditas/bawang-merah.png',
      gradient: 'from-red-400 to-red-600'
    },
    harga_bawang_putih: { 
      name: 'Bawang Putih', 
      icon: '🧄', 
      unit: '/kg',
      image: '/assets/images/komoditas/bawang-putih.png',
      gradient: 'from-gray-300 to-gray-500'
    },
    harga_gas: { 
      name: 'Gas LPG', 
      icon: '🫗', 
      unit: '/tabung',
      image: '/assets/images/komoditas/gas-lpg.png',
      gradient: 'from-blue-400 to-blue-600'
    },
    harga_garam: { 
      name: 'Garam', 
      icon: '🧂', 
      unit: '/kg',
      image: '/assets/images/komoditas/garam.png',
      gradient: 'from-gray-200 to-gray-400'
    },
    harga_susu: { 
      name: 'Susu', 
      icon: '🥛', 
      unit: '/liter',
      image: '/assets/images/komoditas/susu.png',
      gradient: 'from-blue-300 to-blue-500'
    },
  };

  // Handle image error
  const handleImageError = (commodityKey) => {
    setImageErrors(prev => new Set([...prev, commodityKey]));
  };

  // Komponen untuk menampilkan gambar komoditas
  const CommodityImage = ({ commodityKey, commodity, className = "w-6 h-6" }) => {
    const hasError = imageErrors.has(commodityKey);
    
    if (hasError) {
      return (
        <div className={`${className} rounded-lg bg-gradient-to-br ${commodity.gradient} flex items-center justify-center shadow-sm`}>
          <span className="text-sm">{commodity.icon}</span>
        </div>
      );
    }

    return (
      <div className={`${className} rounded-lg bg-white flex items-center justify-center shadow-sm overflow-hidden p-1`}>
        <img
          src={commodity.image}
          alt={commodity.name}
          className="w-full h-full object-contain"
          onError={() => handleImageError(commodityKey)}
          onLoad={() => {
            setImageErrors(prev => {
              const newSet = new Set(prev);
              newSet.delete(commodityKey);
              return newSet;
            });
          }}
        />
      </div>
    );
  };

  // Fetch data utama
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await sembakoApi.getPublicLatest(filters.province_name);
      setData(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching sembako data:', err);
      setError('Gagal memuat data sembako');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await sembakoApi.getPublicStatistics();
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch provinces untuk filter
  const fetchProvinces = async () => {
    try {
      const response = await sembakoApi.getPublicLatest();
      const uniqueProvinces = [...new Set(response.data.data.map(item => item.province_name))];
      setProvinces(uniqueProvinces.sort());
    } catch (err) {
      console.error('Error fetching provinces:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchProvinces();
    fetchStats();
  }, [filters.province_name]);

  // Format harga
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return 'N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      province_name: '',
      market_name: '',
      start_date: '',
      end_date: '',
      page: 1,
      limit: 12
    });
  };

  // Export data
  const handleExport = async () => {
    try {
      const response = await sembakoApi.exportCSV(filters);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sembako-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Gagal mengekspor data');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Data Sembako Indonesia
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Pantau harga 9 bahan pokok pangan dari seluruh Indonesia secara real-time
            </p>
            
            {/* Quick Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">{stats.summary?.total_provinces || 34}</div>
                  <div className="text-sm text-blue-100">Provinsi</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">{stats.summary?.total_records?.toLocaleString('id-ID') || '0'}</div>
                  <div className="text-sm text-blue-100">Data Harga</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">11</div>
                  <div className="text-sm text-blue-100">Komoditas</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">Real-time</div>
                  <div className="text-sm text-blue-100">Update</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Average Prices Section dengan Gambar */}
      {stats?.average_prices && (
        <div className="container mx-auto px-4 py-16 -mt-8 relative z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Harga Rata-rata Nasional</h2>
              <p className="text-gray-600">Update terbaru dari seluruh Indonesia</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {Object.entries(stats.average_prices).map(([key, price]) => {
                const commodity = commoditiesWithImages[key];
                if (!commodity) return null;

                return (
                  <div key={key} className="group bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100">
                    <div className="text-center">
                      <div className="mb-3 flex justify-center">
                        <CommodityImage 
                          commodityKey={key} 
                          commodity={commodity} 
                          className="w-12 h-12" 
                        />
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                        {commodity.name}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">{commodity.unit}</p>
                      <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                        {formatPrice(parseFloat(price))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          {/* Top Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari pasar atau lokasi..."
                    value={filters.market_name}
                    onChange={(e) => handleFilterChange('market_name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-6 py-3 rounded-lg flex items-center font-medium transition-colors ${
                    showFilters ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center font-medium"
                >
                  {viewMode === 'cards' ? <List className="w-4 h-4 mr-2" /> : <Grid className="w-4 h-4 mr-2" />}
                  {viewMode === 'cards' ? 'List View' : 'Card View'}
                </button>

                <button
                  onClick={fetchData}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-medium"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>

                <button
                  onClick={handleExport}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <select
                  value={filters.province_name}
                  onChange={(e) => handleFilterChange('province_name', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Semua Provinsi</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={clearFilters}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Data Display */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Memuat data sembako...</h3>
            <p className="text-gray-600">Mengambil data terbaru dari server</p>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Tidak ada data</h3>
            <p className="text-gray-600 mb-6">Tidak ditemukan data sembako sesuai filter yang dipilih</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            {/* Cards Display */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Data Harga Sembako ({data.length} hasil)
                  </h2>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Diperbarui: {new Date().toLocaleDateString('id-ID')}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.map((item) => (
                    <SembakoCard key={item.id} data={item} showAllPrices={true} />
                  ))}
                </div>
              </div>
            </div>

            {/* Pagination Info (jika ada) */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white rounded-xl shadow-lg p-4 mt-6">
                <div className="text-center text-gray-600">
                  Menampilkan {data.length} dari {pagination.total} data sembako
                  {pagination.totalPages > 1 && (
                    <span className="ml-2">
                      (Halaman {pagination.page} dari {pagination.totalPages})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Back to Top dan Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link 
                to="/" 
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Kembali ke Beranda
              </Link>
              
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-90 transform scale-y-[-1]" />
                Ke Atas
              </button>
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-6 mt-8">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Informasi Data Sembako
                </h3>
                <p className="text-gray-600 mb-4">
                  Data harga sembako ini dikumpulkan dari berbagai sumber terpercaya di seluruh Indonesia 
                  dan diperbarui secara berkala untuk memastikan keakuratan informasi.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Globe className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Cakupan Nasional</h4>
                    <p className="text-sm text-gray-600">Data dari 34 provinsi di Indonesia</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-center mb-2">
                      <BarChart3 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Update Berkala</h4>
                    <p className="text-sm text-gray-600">Pembaruan data secara real-time</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Package className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">9 Komoditas Utama</h4>
                    <p className="text-sm text-gray-600">Sembako bahan pokok pangan</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SembakoPage;