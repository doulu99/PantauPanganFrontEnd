// pages/ManualPriceInputPage.jsx - ENHANCED WITH IMAGE SUPPORT
import React, { useState, useEffect } from 'react';
import { Plus, Store, MapPin, Calendar, TrendingUp, TrendingDown, Edit2, Trash2, Filter, RefreshCw, Download, Upload, Search, AlertTriangle, Image as ImageIcon, Eye, X } from 'lucide-react';
import { marketPriceAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import AddMarketPriceModal from '../components/AddMarketPriceModal';
import EditMarketPriceModal from '../components/EditMarketPriceModal';
import ImportMarketPriceModal from '../components/ImportMarketPriceModal';

const ManualPriceInputPage = () => {
  // State management
  const [marketPrices, setMarketPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [stats, setStats] = useState({
    total_entries: 0,
    markets_count: 0,
    avg_price: 0,
    price_range: { min: 0, max: 0 }
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState({
    commodity_id: '',
    market_name: '',
    date_from: '',
    date_to: '',
    quality_grade: ''
  });

  // Enhanced fetch function
  const fetchMarketPrices = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        period: selectedPeriod,
        category: selectedCategory,
        market: selectedMarket,
        search: searchTerm,
        ...filters
      };

      const response = await marketPriceAPI.getMarketPrices(params);
      
      if (response.data.success) {
        setMarketPrices(response.data.data || []);
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.data.pagination.total || 0,
            totalPages: response.data.pagination.totalPages || 0
          }));
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch market prices');
      }
    } catch (error) {
      console.error('❌ Error fetching market prices:', error);
      
      let errorMessage = 'Gagal memuat data harga pasar';
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.error;
        
        if (status === 500) {
          errorMessage = `Server error: ${serverMessage || 'Database connection issue'}`;
        } else if (status === 404) {
          errorMessage = 'API endpoint tidak ditemukan';
        } else if (status === 403) {
          errorMessage = 'Akses ditolak';
        } else {
          errorMessage = serverMessage || `HTTP ${status} error`;
        }
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else {
        errorMessage = error.message || 'Terjadi kesalahan tidak dikenal';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      setMarketPrices([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = {
        period: selectedPeriod,
        category: selectedCategory,
        market: selectedMarket
      };
      
      const response = await marketPriceAPI.getMarketStats(params);
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      setStats({
        total_entries: 0,
        markets_count: 0,
        avg_price: 0,
        price_range: { min: 0, max: 0 }
      });
    }
  };

  // Effects
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchMarketPrices(),
        fetchStats()
      ]);
    };
    
    loadData();
  }, [pagination.page, pagination.limit, selectedPeriod, selectedCategory, selectedMarket, searchTerm, filters]);

  // Event handlers
  const handleDeletePrice = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data harga ini?')) {
      return;
    }

    try {
      await marketPriceAPI.deleteMarketPrice(id);
      toast.success('Data harga berhasil dihapus');
      await Promise.all([
        fetchMarketPrices(false),
        fetchStats()
      ]);
    } catch (error) {
      console.error('❌ Error deleting price:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menghapus data harga';
      toast.error(errorMessage);
    }
  };

  const handleEditPrice = (price) => {
    setSelectedPrice(price);
    setShowEditModal(true);
  };

  const handleExportData = async () => {
    try {
      const params = {
        period: selectedPeriod,
        category: selectedCategory,
        market: selectedMarket,
        format: 'excel'
      };
      
      const response = await marketPriceAPI.exportMarketPrices(params);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `market-prices-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Data berhasil diekspor');
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      const errorMessage = error.response?.data?.message || 'Gagal mengekspor data';
      toast.error(errorMessage);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const resetFilters = () => {
    setFilters({
      commodity_id: '',
      market_name: '',
      date_from: '',
      date_to: '',
      quality_grade: ''
    });
    setSelectedCategory('');
    setSelectedMarket('');
    setSearchTerm('');
    setSelectedPeriod('today');
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchMarketPrices(),
      fetchStats()
    ]);
    toast.success('Data berhasil diperbarui');
  };

  const handleModalSuccess = async () => {
    await Promise.all([
      fetchMarketPrices(false),
      fetchStats()
    ]);
  };

  // Image handling functions
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Enhanced Price Card Component with Image Support
  const PriceCard = ({ price }) => {
    const isRecent = new Date(price.date) >= new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">{price.market_name}</h3>
            </div>
            
            {price.market_location && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="w-3 h-3" />
                <span>{price.market_location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Calendar className="w-3 h-3" />
              <span>{new Date(price.date).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => handleEditPrice(price)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeletePrice(price.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Images Section */}
        {price.images && price.images.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {price.images.length} foto
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {price.images.slice(0, 3).map((image, index) => (
                <div key={index} className="relative group cursor-pointer">
                  <img
                    src={image.url}
                    alt={`${price.market_name} - ${index + 1}`}
                    className="w-full h-16 object-cover rounded-lg bg-gray-100"
                    onClick={() => handleImageClick(image)}
                  />
                  {image.type === 'evidence' && (
                    <div className="absolute top-1 left-1 bg-blue-500 text-white px-1 py-0.5 rounded text-xs">
                      Utama
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {index === 2 && price.images.length > 3 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        +{price.images.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-gray-600">
                {price.commodity?.name || 'Unknown Commodity'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(price.price)}
              </p>
              <p className="text-sm text-gray-500">
                per {price.commodity?.unit || 'kg'}
              </p>
            </div>
            
            {price.commodity?.source && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                price.commodity.source === 'custom' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {price.commodity.source === 'custom' ? 'Custom' : 'National'}
              </span>
            )}
          </div>

          {price.quality_grade && (
            <div className="mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                price.quality_grade === 'premium' ? 'bg-green-100 text-green-800' :
                price.quality_grade === 'standard' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {price.quality_grade.charAt(0).toUpperCase() + price.quality_grade.slice(1)}
              </span>
            </div>
          )}

          {isRecent && (
            <div className="flex items-center text-xs text-green-600 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Baru ditambahkan
            </div>
          )}

          {price.notes && (
            <div className="text-sm text-gray-600 italic">
              "{price.notes}"
            </div>
          )}
        </div>
      </div>
    );
  };

  // Error state
  if (error && marketPrices.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Coba Lagi
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Data Manual
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Input Manual Harga Pasar</h1>
            <p className="text-gray-600 mt-2">
              Kelola data harga pasar lokal secara manual dengan dukungan foto untuk verifikasi
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </button>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Harga
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Entri</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_entries}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Jumlah Pasar</p>
              <p className="text-2xl font-bold text-gray-900">{stats.markets_count}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Rata-rata Harga</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avg_price)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Rentang Harga</p>
              <p className="text-sm text-gray-900">
                {formatCurrency(stats.price_range.min)} - {formatCurrency(stats.price_range.max)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter Data
          </h3>
          <button
            onClick={resetFilters}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Reset Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periode
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Hari Ini</option>
              <option value="week">1 Minggu Terakhir</option>
              <option value="month">1 Bulan Terakhir</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Kategori</option>
              <option value="beras">Beras</option>
              <option value="sayuran">Sayuran</option>
              <option value="buah">Buah</option>
              <option value="daging">Daging</option>
              <option value="ikan">Ikan</option>
              <option value="bumbu">Bumbu</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pasar
            </label>
            <input
              type="text"
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              placeholder="Nama pasar..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pencarian
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari harga..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data harga pasar...</p>
        </div>
      )}

      {/* Market Prices Grid */}
      {!loading && marketPrices.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {marketPrices.map((price) => (
              <PriceCard key={price.id} price={price} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
              <div className="flex items-center text-sm text-gray-600">
                <span>
                  Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sebelumnya
                </button>
                
                <span className="px-3 py-1 text-sm font-medium">
                  {pagination.page} / {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && marketPrices.length === 0 && !error && (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Belum Ada Data Harga</h3>
          <p className="text-gray-600 mb-6">
            Mulai tambahkan data harga pasar lokal dengan foto untuk verifikasi yang lebih akurat.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tambah Harga Pertama
          </button>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-full p-4">
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Foto Harga Pasar
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedImage.type === 'evidence' ? 'Foto Utama' : 'Foto Tambahan'}
                  </p>
                </div>
                <button
                  onClick={closeImageModal}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <img
                  src={selectedImage.url}
                  alt="Foto harga pasar"
                  className="max-w-full max-h-96 mx-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddMarketPriceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          handleModalSuccess();
        }}
      />

      <EditMarketPriceModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPrice(null);
        }}
        price={selectedPrice}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedPrice(null);
          handleModalSuccess();
        }}
      />

      <ImportMarketPriceModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          setShowImportModal(false);
          handleModalSuccess();
        }}
      />
    </div>
  );
};

export default ManualPriceInputPage;