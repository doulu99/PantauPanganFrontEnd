import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  Download, 
  Search, 
  RefreshCw, 
  Package, 
  MapPin,
  Camera,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Clock,
  Store,
  ShoppingCart,
  PlusCircle
} from 'lucide-react';

const EnhancedMarketPriceInput = () => {
  // State management
  const [marketPrices, setMarketPrices] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    commodity_name: '',
    market_type: '',
    province_name: '',
    quality_grade: '',
    date_from: '',
    date_to: ''
  });
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  
  // Form states dengan commodity baru
  const [formData, setFormData] = useState({
    // Commodity fields (bisa existing atau new)
    commodity_type: 'existing', // 'existing' atau 'new'
    commodity_id: '',
    commodity_name: '',
    commodity_unit: '',
    commodity_category: '',
    
    // Market price fields
    market_name: '',
    market_type: 'traditional',
    market_location: '',
    province_name: '',
    city_name: '',
    price: '',
    quality_grade: 'standard',
    date_recorded: new Date().toISOString().split('T')[0],
    time_recorded: '',
    notes: '',
    latitude: '',
    longitude: ''
  });
  
  // File upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importProgress, setImportProgress] = useState(null);
  const [importResults, setImportResults] = useState(null);

  // Categories for new commodities
  const commodityCategories = [
    'beras', 'sayuran', 'buah', 'daging', 'ikan', 'bumbu', 'lainnya'
  ];

  // Common units
  const commonUnits = [
    'kg', 'gram', 'liter', 'ml', 'pcs', 'pack', 'karung', 'ikat'
  ];

  useEffect(() => {
    fetchMarketPrices();
    fetchProvinces();
    fetchCommodities();
  }, [filters]);

  const fetchMarketPrices = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`/api/market-prices?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setMarketPrices(data.data.prices);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch market prices');
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await fetch('/api/market-prices/provinces');
      const data = await response.json();
      if (data.success) {
        setProvinces(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch provinces:', err);
    }
  };

  const fetchCommodities = async () => {
    try {
      const response = await fetch('/api/market-prices/commodities');
      const data = await response.json();
      if (data.success) {
        setCommodities(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch commodities:', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Maximum 5MB allowed.');
        return;
      }
      
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      
      // Handle commodity data
      if (formData.commodity_type === 'new') {
        formDataToSend.append('commodity_type', 'new');
        formDataToSend.append('commodity_name', formData.commodity_name);
        formDataToSend.append('commodity_unit', formData.commodity_unit);
        formDataToSend.append('commodity_category', formData.commodity_category);
      } else {
        formDataToSend.append('commodity_type', 'existing');
        formDataToSend.append('commodity_id', formData.commodity_id);
      }
      
      // Market price fields
      const priceFields = [
        'market_name', 'market_type', 'market_location', 
        'province_name', 'city_name', 'price', 'quality_grade',
        'date_recorded', 'time_recorded', 'notes', 'latitude', 'longitude'
      ];
      
      priceFields.forEach(field => {
        if (formData[field]) {
          formDataToSend.append(field, formData[field]);
        }
      });
      
      // Append image if selected
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      const url = editingPrice ? `/api/market-prices/${editingPrice.id}` : '/api/market-prices';
      const method = editingPrice ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (editingPrice) {
          setMarketPrices(marketPrices.map(price => 
            price.id === editingPrice.id ? data.data : price
          ));
        } else {
          setMarketPrices([data.data, ...marketPrices]);
        }
        
        resetForm();
        setShowAddModal(false);
        setEditingPrice(null);
        
        // Refresh commodities list if new commodity was added
        if (formData.commodity_type === 'new') {
          fetchCommodities();
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to save market price');
    }
  };

  const resetForm = () => {
    setFormData({
      commodity_type: 'existing',
      commodity_id: '',
      commodity_name: '',
      commodity_unit: '',
      commodity_category: '',
      market_name: '',
      market_type: 'traditional',
      market_location: '',
      province_name: '',
      city_name: '',
      price: '',
      quality_grade: 'standard',
      date_recorded: new Date().toISOString().split('T')[0],
      time_recorded: '',
      notes: '',
      latitude: '',
      longitude: ''
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleEdit = (price) => {
    setEditingPrice(price);
    setFormData({
      commodity_type: price.commodity_source === 'custom' ? 'new' : 'existing',
      commodity_id: price.commodity_source === 'custom' ? '' : price.commodity_id,
      commodity_name: price.commodity_name || '',
      commodity_unit: price.unit || '',
      commodity_category: price.commodity?.category || '',
      market_name: price.market_name,
      market_type: price.market_type,
      market_location: price.market_location || '',
      province_name: price.province_name || '',
      city_name: price.city_name || '',
      price: price.price,
      quality_grade: price.quality_grade,
      date_recorded: price.date_recorded,
      time_recorded: price.time_recorded || '',
      notes: price.notes || '',
      latitude: price.latitude || '',
      longitude: price.longitude || ''
    });
    setImagePreview(price.image_url);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this market price?')) {
      try {
        const response = await fetch(`/api/market-prices/${id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        if (data.success) {
          setMarketPrices(marketPrices.filter(price => price.id !== id));
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to delete market price');
      }
    }
  };

  const handleFileImport = async () => {
    if (!importFile) return;
    
    setImportProgress(0);
    const formData = new FormData();
    formData.append('file', importFile);
    
    try {
      const response = await fetch('/api/market-prices/import', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setImportResults(data.data);
        setImportProgress(100);
        fetchMarketPrices(); // Refresh data
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to import data');
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/market-prices/template');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template-import-market-prices.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download template');
    }
  };

  const PriceCard = ({ price }) => {
    const isRecent = new Date(price.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {price.commodity_name || price.commodity?.name || 'Unknown Commodity'}
              </h3>
              {price.verification_status === 'verified' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {price.verification_status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
              {price.verification_status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              {price.market_type === 'traditional' && <Store className="w-4 h-4" />}
              {price.market_type === 'modern' && <ShoppingCart className="w-4 h-4" />}
              {price.market_type === 'wholesale' && <Package className="w-4 h-4" />}
              <span>{price.market_name}</span>
            </div>
            {price.market_location && (
              <p className="text-xs text-gray-500 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {price.market_location}
              </p>
            )}
          </div>
          
          {price.image_url && (
            <img 
              src={price.image_url} 
              alt="Product" 
              className="w-16 h-16 object-cover rounded-lg ml-4"
            />
          )}
        </div>

        <div className="text-right mb-4">
          <div className="text-2xl font-bold text-green-600">
            Rp {parseInt(price.price).toLocaleString('id-ID')}
          </div>
          <div className="text-sm text-gray-500">
            per {price.unit || price.commodity?.unit || 'unit'}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {price.province_name && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {price.province_name}
            </span>
          )}
          
          <span className={`px-2 py-1 text-xs rounded-full ${
            price.market_type === 'traditional' ? 'bg-green-100 text-green-800' :
            price.market_type === 'modern' ? 'bg-purple-100 text-purple-800' :
            price.market_type === 'wholesale' ? 'bg-orange-100 text-orange-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {price.market_type}
          </span>

          <span className={`px-2 py-1 text-xs rounded-full ${
            price.quality_grade === 'premium' ? 'bg-yellow-100 text-yellow-800' :
            price.quality_grade === 'standard' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {price.quality_grade?.charAt(0).toUpperCase() + price.quality_grade?.slice(1)}
          </span>

          {price.commodity_source && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              price.commodity_source === 'custom' ? 'bg-purple-100 text-purple-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {price.commodity_source === 'custom' ? 'Custom' : 'National'}
            </span>
          )}
        </div>

        {isRecent && (
          <div className="flex items-center text-xs text-green-600 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Baru ditambahkan
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
          <span>{new Date(price.date_recorded).toLocaleDateString('id-ID')}</span>
          {price.time_recorded && (
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {price.time_recorded}
            </span>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => handleEdit(price)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(price.id)}
            className="p-1 hover:bg-gray-100 rounded text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {price.notes && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600 italic">
            "{price.notes}"
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Input Harga Pasar</h1>
            <p className="text-gray-600 mt-2">
              Input harga pasar dengan komoditas existing atau buat komoditas baru
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Data
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </button>
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Template
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pencarian
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Cari pasar, komoditas..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Pasar
            </label>
            <select
              value={filters.market_type}
              onChange={(e) => setFilters({...filters, market_type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Jenis</option>
              <option value="traditional">Traditional</option>
              <option value="modern">Modern</option>
              <option value="wholesale">Wholesale</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provinsi
            </label>
            <select
              value={filters.province_name}
              onChange={(e) => setFilters({...filters, province_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Provinsi</option>
              {provinces.map(province => (
                <option key={province.id} value={province.province_name}>
                  {province.province_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kualitas
            </label>
            <select
              value={filters.quality_grade}
              onChange={(e) => setFilters({...filters, quality_grade: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Kualitas</option>
              <option value="economy">Economy</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({...filters, date_from: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="self-center text-gray-500">sampai</span>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({...filters, date_to: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={fetchMarketPrices}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data harga pasar...</p>
        </div>
      ) : marketPrices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketPrices.map((price) => (
            <PriceCard key={price.id} price={price} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-100 rounded-lg">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Belum ada data harga pasar</p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tambah Data Pertama
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingPrice ? 'Edit Data Harga Pasar' : 'Tambah Data Harga Pasar'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Commodity Selection */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">1. Pilih atau Buat Komoditas</h3>
                  
                  <div className="space-y-4">
                    {/* Commodity Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Input Komoditas
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="existing"
                            checked={formData.commodity_type === 'existing'}
                            onChange={(e) => setFormData({...formData, commodity_type: e.target.value})}
                            className="mr-2"
                          />
                          Pilih dari yang ada
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="new"
                            checked={formData.commodity_type === 'new'}
                            onChange={(e) => setFormData({...formData, commodity_type: e.target.value})}
                            className="mr-2"
                          />
                          Buat komoditas baru
                        </label>
                      </div>
                    </div>

                    {/* Existing Commodity Selection */}
                    {formData.commodity_type === 'existing' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pilih Komoditas *
                        </label>
                        <select
                          value={formData.commodity_id}
                          onChange={(e) => {
                            const selectedCommodity = commodities.find(c => c.id == e.target.value);
                            setFormData({
                              ...formData, 
                              commodity_id: e.target.value,
                              commodity_unit: selectedCommodity?.unit || ''
                            });
                          }}
                          required={formData.commodity_type === 'existing'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Pilih Komoditas</option>
                          {commodities.map(commodity => (
                            <option key={`${commodity.source}-${commodity.id}`} value={commodity.id}>
                              {commodity.name} ({commodity.unit}) - {commodity.source}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* New Commodity Form */}
                    {formData.commodity_type === 'new' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Komoditas Baru *
                          </label>
                          <input
                            type="text"
                            value={formData.commodity_name}
                            onChange={(e) => setFormData({...formData, commodity_name: e.target.value})}
                            required={formData.commodity_type === 'new'}
                            placeholder="Contoh: Tempe Lokal"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Satuan *
                          </label>
                          <select
                            value={formData.commodity_unit}
                            onChange={(e) => setFormData({...formData, commodity_unit: e.target.value})}
                            required={formData.commodity_type === 'new'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Pilih Satuan</option>
                            {commonUnits.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kategori *
                          </label>
                          <select
                            value={formData.commodity_category}
                            onChange={(e) => setFormData({...formData, commodity_category: e.target.value})}
                            required={formData.commodity_type === 'new'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Pilih Kategori</option>
                            {commodityCategories.map(category => (
                              <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Market Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">2. Informasi Pasar</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Pasar *
                      </label>
                      <input
                        type="text"
                        value={formData.market_name}
                        onChange={(e) => setFormData({...formData, market_name: e.target.value})}
                        required
                        placeholder="Contoh: Pasar Minggu"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Pasar *
                      </label>
                      <select
                        value={formData.market_type}
                        onChange={(e) => setFormData({...formData, market_type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="traditional">Pasar Traditional</option>
                        <option value="modern">Pasar Modern/Supermarket</option>
                        <option value="wholesale">Pasar Grosir</option>
                        <option value="online">Online Marketplace</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provinsi
                      </label>
                      <select
                        value={formData.province_name}
                        onChange={(e) => setFormData({...formData, province_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Pilih Provinsi</option>
                        {provinces.map(province => (
                          <option key={province.id} value={province.province_name}>
                            {province.province_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kota/Kabupaten
                      </label>
                      <input
                        type="text"
                        value={formData.city_name}
                        onChange={(e) => setFormData({...formData, city_name: e.target.value})}
                        placeholder="Nama kota/kabupaten"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat Lengkap Pasar
                    </label>
                    <input
                      type="text"
                      value={formData.market_location}
                      onChange={(e) => setFormData({...formData, market_location: e.target.value})}
                      placeholder="Alamat lengkap pasar"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Price Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">3. Informasi Harga</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        required
                        placeholder="15000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kualitas
                      </label>
                      <select
                        value={formData.quality_grade}
                        onChange={(e) => setFormData({...formData, quality_grade: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="economy">Economy</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal *
                      </label>
                      <input
                        type="date"
                        value={formData.date_recorded}
                        onChange={(e) => setFormData({...formData, date_recorded: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Waktu
                      </label>
                      <input
                        type="time"
                        value={formData.time_recorded}
                        onChange={(e) => setFormData({...formData, time_recorded: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">4. Foto Produk/Struk (Opsional)</h3>
                  
                  <div className="flex items-center space-x-4">
                    <label className="flex-1">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {selectedImage ? selectedImage.name : 'Klik untuk upload foto'}
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    
                    {imagePreview && (
                      <div className="w-24 h-24">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          className="mt-1 text-xs text-red-600 hover:text-red-800"
                        >
                          Hapus foto
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">5. Informasi Tambahan (Opsional)</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.latitude}
                          onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                          placeholder="-6.2088"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.longitude}
                          onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                          placeholder="106.8456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        rows={3}
                        placeholder="Catatan tambahan tentang harga atau kondisi pasar..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Menyimpan...' : (editingPrice ? 'Update' : 'Simpan')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingPrice(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Import Data dari CSV/Excel</h2>
              
              <div className="space-y-6">
                {/* Step 1: Download Template */}
                <div>
                  <h3 className="text-lg font-medium mb-2">1. Download Template</h3>
                  <p className="text-gray-600 mb-3">
                    Download template CSV dengan format baru yang mendukung komoditas custom
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </button>
                </div>

                {/* Template Format Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Format Template Baru:</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>commodity_type:</strong> 'existing' atau 'new'</p>
                    <p><strong>Untuk existing:</strong> isi commodity_id, kosongkan nama/unit/kategori</p>
                    <p><strong>Untuk new:</strong> isi commodity_name, commodity_unit, commodity_category</p>
                    <p><strong>market_name, price, date_recorded:</strong> wajib diisi</p>
                  </div>
                </div>

                {/* Step 2: Upload File */}
                <div>
                  <h3 className="text-lg font-medium mb-2">2. Upload File</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => setImportFile(e.target.files[0])}
                      className="hidden"
                      id="import-file"
                    />
                    <label htmlFor="import-file" className="cursor-pointer">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {importFile ? importFile.name : 'Klik untuk pilih file CSV atau Excel'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Maksimal 10MB
                      </p>
                    </label>
                  </div>
                </div>

                {/* Progress */}
                {importProgress !== null && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress Import</span>
                      <span className="text-sm text-gray-600">{importProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{width: `${importProgress}%`}}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Results */}
                {importResults && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Hasil Import:</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {importResults.total_rows}
                        </div>
                        <div className="text-gray-600">Total Baris</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {importResults.success_rows}
                        </div>
                        <div className="text-gray-600">Berhasil</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {importResults.failed_rows}
                        </div>
                        <div className="text-gray-600">Gagal</div>
                      </div>
                    </div>
                    
                    {importResults.errors && importResults.errors.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-red-600 mb-2">Error Details:</h5>
                        <div className="max-h-32 overflow-y-auto text-sm">
                          {importResults.errors.slice(0, 5).map((error, index) => (
                            <div key={index} className="text-red-600">
                              Baris {error.row}: {error.error}
                            </div>
                          ))}
                          {importResults.errors.length > 5 && (
                            <div className="text-gray-500">
                              ...dan {importResults.errors.length - 5} error lainnya
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleFileImport}
                    disabled={!importFile || importProgress !== null}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importProgress !== null ? 'Mengimpor...' : 'Import Data'}
                  </button>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                      setImportProgress(null);
                      setImportResults(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMarketPriceInput;