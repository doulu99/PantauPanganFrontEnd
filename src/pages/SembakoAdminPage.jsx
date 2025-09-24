// ==========================================
// src/pages/SembakoAdminPage.jsx - FIXED Syntax Errors
// ==========================================
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, RefreshCw, Download, 
  Upload, MoreHorizontal, Edit, Trash2,
  AlertTriangle, CheckCircle, Package,
  Grid, List, Calendar, MapPin, Users,
  TrendingUp, Database, Eye, Settings
} from 'lucide-react';
import { sembakoApi } from '../services/sembakoApi';
import SembakoCard from '../components/SembakoCard';
import SembakoForm from '../components/SembakoForm';
import SembakoStats from '../components/SembakoStats';

const SembakoAdminPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  
  // Form & Modal States
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showStats, setShowStats] = useState(false);
  
  // Filter & Pagination
  const [filters, setFilters] = useState({
    province_name: '',
    market_name: '',
    start_date: '',
    end_date: '',
    status: '',
    source: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Selection & Bulk Actions
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('cards');
  const [quickStats, setQuickStats] = useState(null);

  // Fetch main data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await sembakoApi.getAll(filters);
      setData(response.data.data || []);
      setPagination(response.data.pagination || {});
      
    } catch (err) {
      console.error('Fetch data error:', err);
      setError(err.response?.data?.message || 'Gagal memuat data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch provinces for filter
  const fetchProvinces = async () => {
    try {
      const response = await sembakoApi.getPublicLatest();
      const uniqueProvinces = [...new Set(response.data.data.map(item => item.province_name))];
      setProvinces(uniqueProvinces.sort());
    } catch (err) {
      console.error('Error fetching provinces:', err);
    }
  };

  // Fetch quick statistics
  const fetchQuickStats = async () => {
    try {
      const response = await sembakoApi.getPublicStatistics();
      setQuickStats(response.data.data);
    } catch (err) {
      console.error('Error fetching quick stats:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchProvinces();
    fetchQuickStats();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters.page, filters.limit]);

  // Handle create new
  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  // Handle edit - FIXED FUNCTION
  const handleEdit = (item) => {
    console.log('✅ Editing item:', item);
    setEditingItem(item);
    setShowForm(true);
  };

  // Handle delete with confirmation
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) {
      return;
    }

    try {
      await sembakoApi.delete(id);
      setSuccess('Data berhasil dihapus');
      fetchData();
      fetchQuickStats();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      setError('Pilih data yang ingin dihapus');
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus ${selectedItems.length} data?`)) {
      return;
    }

    try {
      await Promise.all(selectedItems.map(id => sembakoApi.delete(id)));
      setSuccess(`${selectedItems.length} data berhasil dihapus`);
      setSelectedItems([]);
      fetchData();
      fetchQuickStats();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Bulk delete error:', err);
      setError('Gagal menghapus beberapa data');
    }
  };

  // Handle form save
  const handleFormSave = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchData();
    fetchQuickStats();
    setSuccess(editingItem ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      market_name: searchTerm,
      page: 1
    }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      province_name: '',
      market_name: '',
      start_date: '',
      end_date: '',
      status: '',
      source: '',
      page: 1,
      limit: 12
    });
    setSelectedItems([]);
  };

  // Selection handlers
  const toggleSelect = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === data.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(data.map(item => item.id));
    }
  };

  // Export data
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
      setSuccess('Data berhasil diekspor');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Export error:', err);
      setError('Gagal mengekspor data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Sembako
              </h1>
              <p className="text-gray-600 mt-1">
                Kelola data harga 9 bahan pokok pangan
              </p>
            </div>
            
            <div className="flex gap-3 mt-4 sm:mt-0 flex-wrap">
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {showStats ? 'Sembunyikan' : 'Tampilkan'} Statistik
              </button>
              
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Data
              </button>
              
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
            <button 
              onClick={() => setSuccess('')}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Quick Stats Dashboard */}
        {quickStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Data</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {quickStats.summary?.total_records?.toLocaleString('id-ID') || 0}
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
                    {quickStats.summary?.total_provinces || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Data Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {data.filter(item => {
                      const today = new Date().toDateString();
                      const itemDate = new Date(item.survey_date).toDateString();
                      return today === itemDate;
                    }).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Terpilih</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {selectedItems.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Component */}
        {showStats && (
          <div className="mb-8">
            <SembakoStats />
          </div>
        )}

        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          {/* Top Controls */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari pasar atau lokasi..."
                    value={filters.market_name}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    showFilters ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>

                <button
                  onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
                >
                  {viewMode === 'cards' ? <List className="w-4 h-4 mr-2" /> : <Grid className="w-4 h-4 mr-2" />}
                  {viewMode === 'cards' ? 'Tabel' : 'Cards'}
                </button>

                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select
                  value={filters.province_name}
                  onChange={(e) => handleFilterChange('province_name', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Provinsi</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>

                <select
                  value={filters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Sumber</option>
                  <option value="google_sheet">Google Sheets</option>
                  <option value="google_form">Google Form</option>
                  <option value="import_csv">CSV Import</option>
                  <option value="manual">Manual</option>
                </select>

                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Reset Filter
                </button>
                {selectedItems.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Terpilih ({selectedItems.length})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="p-4 bg-blue-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedItems.length} item terpilih
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {selectedItems.length === data.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Batal Pilih
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data Display */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Memuat data...</h3>
            <p className="text-gray-600">Mengambil data sembako terbaru</p>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Tidak ada data</h3>
            <p className="text-gray-600 mb-6">Belum ada data sembako yang tersedia</p>
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              Tambah Data Pertama
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Data Sembako ({data.length} hasil)
                </h2>
                <div className="text-sm text-gray-600 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Update: {new Date().toLocaleDateString('id-ID')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((item) => (
                  <div key={item.id} className="relative">
                    {/* Checkbox Overlay */}
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Quick Action Menu */}
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-white rounded-full shadow-lg p-1">
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="p-1 hover:bg-blue-100 rounded-full text-blue-600"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-1 hover:bg-red-100 rounded-full text-red-600"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <SembakoCard 
                      data={item} 
                      enableEdit={true}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-4 mt-6">
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 bg-gray-200 text-gray-600 rounded disabled:opacity-50 hover:bg-gray-300"
              >
                Prev
              </button>
              
              {[...Array(Math.min(pagination.totalPages, 10))].map((_, index) => {
                const pageNum = index + 1;
                if (pagination.totalPages <= 10 || 
                    pageNum === 1 || 
                    pageNum === pagination.totalPages ||
                    Math.abs(pageNum - pagination.page) <= 2) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 bg-gray-200 text-gray-600 rounded disabled:opacity-50 hover:bg-gray-300"
              >
                Next
              </button>
            </div>
            
            <div className="text-center mt-4 text-sm text-gray-600">
              Halaman {pagination.page} dari {pagination.totalPages} 
              ({pagination.total || 0} total data)
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <SembakoForm
          item={editingItem}
          onSave={handleFormSave}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Floating Action Bar for Selected Items */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-white rounded-lg shadow-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="text-sm font-medium text-gray-800">
                {selectedItems.length} item terpilih
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Hapus
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SembakoAdminPage;