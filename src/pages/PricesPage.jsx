import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Edit2, Calendar, MapPin, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { priceAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import PriceOverrideModal from '../components/PriceOverrideModal';

const PricesPage = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    region: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState(null);

  useEffect(() => {
    fetchPrices();
  }, [filters, pagination.page]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const response = await priceAPI.getCurrentPrices({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (response.data.success) {
        setPrices(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch prices');
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      const result = await priceAPI.syncPrices({ level_harga_id: 3 });
      if (result.data.success) {
        await fetchPrices();
        toast.success('Data synchronized successfully!');
      }
    } catch (error) {
      toast.error('Sync failed');
    }
  };

  const handleExport = async () => {
    try {
      const response = await priceAPI.exportPrices({ format: 'csv', ...filters });
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prices-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Export successful!');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleEditPrice = (price) => {
    setSelectedCommodity(price);
    setOverrideModalOpen(true);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      region: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Monitor Harga Pangan</h1>
        <p className="text-gray-600 mt-2">Data harga komoditas pangan terkini dari seluruh Indonesia</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari komoditas..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            <option value="beras">Beras</option>
            <option value="sayuran">Sayuran</option>
            <option value="daging">Daging</option>
            <option value="bumbu">Bumbu</option>
            <option value="lainnya">Lainnya</option>
          </select>

          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Provinsi</option>
            <option value="1">DKI Jakarta</option>
            <option value="2">Jawa Barat</option>
            <option value="3">Jawa Tengah</option>
            <option value="4">Jawa Timur</option>
          </select>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button onClick={resetFilters} className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            Reset Filter
          </button>
          <div className="flex gap-2">
            <button onClick={handleExport} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </button>
            <button onClick={handleSync} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Data
            </button>
          </div>
        </div>
      </div>

      {/* Price Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading data...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Komoditas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Hari Ini</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Kemarin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perubahan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sumber</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prices.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.commodity?.name}</div>
                        <div className="text-xs text-gray-500">{item.commodity?.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.commodity?.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.yesterday_price ? formatCurrency(item.yesterday_price) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.gap_change === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                          ) : item.gap_change === 'down' ? (
                            <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                          ) : null}
                          <span className={`text-sm font-medium ${
                            item.gap_change === 'up' ? 'text-red-500' : 
                            item.gap_change === 'down' ? 'text-green-500' : 
                            'text-gray-500'
                          }`}>
                            {Math.abs(item.gap_percentage || 0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.is_override ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.is_override ? 'Manual' : 'API'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleEditPrice(item)} className="text-blue-600 hover:text-blue-900">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Price Override Modal */}
      <PriceOverrideModal
        isOpen={overrideModalOpen}
        onClose={() => {
          setOverrideModalOpen(false);
          setSelectedCommodity(null);
        }}
        commodity={selectedCommodity}
        onSuccess={fetchPrices}
      />
    </div>
  );
};

export default PricesPage;