// ==========================================
// 5. src/pages/SembakoPage.jsx
// ==========================================
import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Download, Plus, MapPin, Calendar } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'stats'

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
  }, [filters.province_name]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
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
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal export data');
    }
  };

  // Filter data locally based on search
  const filteredData = data.filter(item => {
    const matchMarket = !filters.market_name || 
      item.market_name.toLowerCase().includes(filters.market_name.toLowerCase());
    
    const matchDate = !filters.start_date || !filters.end_date ||
      (new Date(item.survey_date) >= new Date(filters.start_date) &&
       new Date(item.survey_date) <= new Date(filters.end_date));
    
    return matchMarket && matchDate;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Data Sembako - 9 Bahan Pokok
              </h1>
              <p className="text-gray-600 mt-1">
                Pantau harga bahan pokok pangan di seluruh Indonesia
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'cards' ? 'stats' : 'cards')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                {viewMode === 'cards' ? 'Lihat Statistik' : 'Lihat Data'}
              </button>
              
              <Link
                to="/admin/sembako"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Kelola Data
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Mode: Statistics */}
        {viewMode === 'stats' && <SembakoStats />}

        {/* View Mode: Cards */}
        {viewMode === 'cards' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter Data
                </h2>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    {showFilters ? 'Sembunyikan' : 'Tampilkan'} Filter
                  </button>
                  
                  <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                  
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Provinsi
                    </label>
                    <select
                      value={filters.province_name}
                      onChange={(e) => handleFilterChange('province_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Semua Provinsi</option>
                      {provinces.map(province => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Search className="w-4 h-4 inline mr-1" />
                      Nama Pasar
                    </label>
                    <input
                      type="text"
                      value={filters.market_name}
                      onChange={(e) => handleFilterChange('market_name', e.target.value)}
                      placeholder="Cari nama pasar..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={filters.start_date}
                      onChange={(e) => handleFilterChange('start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Tanggal Akhir
                    </label>
                    <input
                      type="date"
                      value={filters.end_date}
                      onChange={(e) => handleFilterChange('end_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Active filters display */}
              {(filters.province_name || filters.market_name || filters.start_date || filters.end_date) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Filter aktif:</span>
                  {filters.province_name && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Provinsi: {filters.province_name}
                    </span>
                  )}
                  {filters.market_name && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Pasar: {filters.market_name}
                    </span>
                  )}
                  {filters.start_date && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      Dari: {filters.start_date}
                    </span>
                  )}
                  {filters.end_date && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      Sampai: {filters.end_date}
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200"
                  >
                    ✕ Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Data Display */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Memuat data...</span>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-red-600 mb-4">{error}</div>
                <button
                  onClick={fetchData}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Coba Lagi
                </button>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Tidak ada data</h3>
                  <p>Tidak ditemukan data dengan filter yang dipilih</p>
                </div>
                {(filters.province_name || filters.market_name || filters.start_date || filters.end_date) && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results Info */}
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-gray-600">
                    Menampilkan {filteredData.length} dari {data.length} data
                  </p>
                  
                  <div className="text-sm text-gray-500">
                    Update terakhir: {new Date().toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredData.map((item) => (
                    <SembakoCard key={item.id} data={item} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SembakoPage;