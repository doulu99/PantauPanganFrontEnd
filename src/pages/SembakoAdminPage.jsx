// ==========================================
// 6. src/pages/SembakoAdminPage.jsx
// ==========================================
import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, Filter, Download, Upload, 
  RefreshCw, Eye, MoreHorizontal, AlertTriangle 
} from 'lucide-react';
import { sembakoApi } from '../services/sembakoApi';
import SembakoImport from '../components/SembakoImport';
import SembakoCard from '../components/SembakoCard';

const SembakoAdminPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    province_name: '',
    market_name: '',
    start_date: '',
    end_date: '',
    status: 'published'
  });
  const [pagination, setPagination] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [showImport, setShowImport] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Fetch data dengan auth
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await sembakoApi.getAll(filters);
      setData(response.data.data || []);
      setPagination(response.data.pagination || {});
      setError(null);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Gagal memuat data. Pastikan Anda sudah login.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (!confirm(`Hapus ${selectedItems.length} item yang dipilih?`)) return;

    try {
      await sembakoApi.bulkDelete(selectedItems);
      setSelectedItems([]);
      fetchData();
      alert('Data berhasil dihapus');
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Gagal menghapus data');
    }
  };

  // Handle single delete
  const handleDelete = async (id) => {
    if (!confirm('Hapus data ini?')) return;

    try {
      await sembakoApi.delete(id);
      fetchData();
      alert('Data berhasil dihapus');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus data');
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await sembakoApi.exportCSV(filters);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sembako-admin-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal export data');
    }
  };

  // Toggle item selection
  const toggleSelect = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Select all items
  const toggleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === data.length 
        ? [] 
        : data.map(item => item.id)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Kelola Data Sembako
              </h1>
              <p className="text-gray-600 mt-1">
                Manajemen data 9 bahan pokok pangan
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowImport(!showImport)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </button>
              
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Import Section */}
        {showImport && (
          <div className="mb-8">
            <SembakoImport onImportSuccess={fetchData} />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provinsi
              </label>
              <input
                type="text"
                value={filters.province_name}
                onChange={(e) => handleFilterChange('province_name', e.target.value)}
                placeholder="Nama provinsi..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pasar
              </label>
              <input
                type="text"
                value={filters.market_name}
                onChange={(e) => handleFilterChange('market_name', e.target.value)}
                placeholder="Nama pasar..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">
                {selectedItems.length} item dipilih
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Terpilih
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Table/Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Tidak ada data</h3>
            <p className="text-gray-600 mb-4">
              Belum ada data sembako yang tersedia
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tambah Data Pertama
            </button>
          </div>
        ) : (
          <>
            {/* Results Info & Select All */}
            <div className="bg-white rounded-t-xl p-4 flex justify-between items-center border-b">
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === data.length}
                    onChange={toggleSelectAll}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">
                    Pilih Semua ({data.length} item)
                  </span>
                </label>
              </div>
              
              <p className="text-sm text-gray-600">
                Halaman {pagination.page || 1} dari {pagination.totalPages || 1} 
                ({pagination.total || 0} total)
              </p>
            </div>

            {/* Cards Grid */}
            <div className="bg-white rounded-b-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((item) => (
                  <div key={item.id} className="relative">
                    {/* Checkbox Overlay */}
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4"
                      />
                    </div>

                    {/* Action Menu */}
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-white rounded-full shadow-lg p-1">
                        <button className="text-gray-600 hover:text-gray-800">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <SembakoCard data={item} />

                    {/* Admin Actions */}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white rounded-xl shadow-lg p-4 mt-6">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 bg-gray-200 text-gray-600 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-3 py-1 rounded ${
                        pagination.page === index + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 bg-gray-200 text-gray-600 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SembakoAdminPage;