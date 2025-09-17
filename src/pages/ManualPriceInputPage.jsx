import React, { useState, useEffect } from 'react';
import { Plus, Store, MapPin, Calendar, TrendingUp, TrendingDown, Edit2, Trash2, Filter, RefreshCw, Download, Upload, Search } from 'lucide-react';
import { marketPriceAPI, priceAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import AddMarketPriceModal from '../components/AddMarketPriceModal';
import EditMarketPriceModal from '../components/EditMarketPriceModal';
import ImportMarketPriceModal from '../components/ImportMarketPriceModal';

const ManualPriceInputPage = () => {
  const [marketPrices, setMarketPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
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

  useEffect(() => {
    fetchMarketPrices();
    fetchStats();
  }, [pagination.page, pagination.limit, selectedPeriod, selectedCategory, selectedMarket, searchTerm, filters]);

  const fetchMarketPrices = async () => {
    setLoading(true);
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
        setMarketPrices(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Error fetching market prices:', error);
      toast.error('Gagal memuat data harga pasar');
    } finally {
      setLoading(false);
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
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeletePrice = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data harga ini?')) {
      return;
    }

    try {
      await marketPriceAPI.deleteMarketPrice(id);
      toast.success('Data harga berhasil dihapus');
      fetchMarketPrices();
      fetchStats();
    } catch (error) {
      toast.error('Gagal menghapus data harga');
      console.error(error);
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
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `market-prices-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Data berhasil diekspor');
    } catch (error) {
      toast.error('Gagal mengekspor data');
      console.error(error);
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

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const PriceCard = ({ price }) => {
    const isRecent = new Date(price.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{price.commodity?.name}</h3>
            <p className="text-sm text-gray-500">{price.commodity?.unit}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditPrice(price)}
              className="p-1 text-gray-400 hover:text-blue-600"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeletePrice(price.id)}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Harga:</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(price.price)}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Store className="w-4 h-4 mr-2" />
            <span>{price.market_name}</span>
          </div>

          {price.market_location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{price.market_location}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{new Date(price.date).toLocaleDateString('id-ID')}</span>
          </div>

          {price.quality_grade && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Kualitas:</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                price.quality_grade === 'premium' ? 'bg-green-100 text-green-800' :
                price.quality_grade === 'standard' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {price.quality_grade.charAt(0).toUpperCase() + price.quality_grade.slice(1)}
              </span>
            </div>
          )}

          {isRecent && (
            <div className="flex items-center text-xs text-green-600">
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Input Manual Harga Pasar</h1>
            <p className="text-gray-600 mt-2">
              Kelola data harga pasar lokal secara manual untuk perbandingan dengan harga nasional
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Entri"
          value={stats.total_entries.toLocaleString('id-ID')}
          icon={Store}
          color="blue"
        />
        <StatCard
          title="Jumlah Pasar"
          value={stats.markets_count}
          icon={MapPin}
          color="green"
        />
        <StatCard
          title="Rata-rata Harga"
          value={formatCurrency(stats.avg_price)}
          icon={TrendingUp}
          color="orange"
        />
        <StatCard
          title="Rentang Harga"
          value={`${formatCurrency(stats.price_range.min)} - ${formatCurrency(stats.price_range.max)}`}
          icon={TrendingDown}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filter & Pencarian</h3>
          <button
            onClick={resetFilters}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Reset Filter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Periode
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Hari Ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="custom">Kustom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kategori</option>
              <option value="beras">Beras</option>
              <option value="sayuran">Sayuran</option>
              <option value="daging">Daging</option>
              <option value="bumbu">Bumbu</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Pasar
            </label>
            <input
              type="text"
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              placeholder="Filter berdasarkan pasar..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Komoditas
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama komoditas..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {selectedPeriod === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Data Display */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : marketPrices.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {marketPrices.map((price) => (
              <PriceCard key={price.id} price={price} />
            ))}
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} hingga {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-2 text-sm">
                  Halaman {pagination.page} dari {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-2">Belum Ada Data Harga Pasar</p>
          <p className="text-gray-500 mb-6">
            Mulai tambahkan data harga pasar manual untuk membandingkan dengan harga nasional
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tambah Harga Pertama
          </button>
        </div>
      )}

      {/* Modals */}
      <AddMarketPriceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchMarketPrices();
          fetchStats();
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
          fetchMarketPrices();
          fetchStats();
        }}
      />

      <ImportMarketPriceModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          setShowImportModal(false);
          fetchMarketPrices();
          fetchStats();
        }}
      />
    </div>
  );
};

export default ManualPriceInputPage;