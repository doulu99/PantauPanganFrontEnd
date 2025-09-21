// src/components/EnhancedMarketPriceInput.jsx
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
  ShoppingCart
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
  
  // File upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importProgress, setImportProgress] = useState(null);
  const [importResults, setImportResults] = useState(null);

  // Categories and units
  const commodityCategories = [
    'beras', 'sayuran', 'buah', 'daging', 'ikan', 'bumbu', 'lainnya'
  ];

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
      setError('Failed to fetch market prices: ' + err.message);
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
        setError('File size too large. Maximum 5MB allowed.');
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
    setLoading(true);
    
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
        
        // Refresh commodities if new was added
        if (formData.commodity_type === 'new') {
          fetchCommodities();
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to save market price: ' + err.message);
    } finally {
      setLoading(false);
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
        setError('Failed to delete market price: ' + err.message);
      }
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
      setError('Failed to download template: ' + err.message);
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

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data harga pasar...</p>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-100 rounded-lg">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {marketPrices.length === 0 
              ? 'Belum ada data harga pasar. Klik "Tambah Data" untuk mulai input harga.' 
              : `Menampilkan ${marketPrices.length} data harga pasar`
            }
          </p>
          {marketPrices.length === 0 && (
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tambah Data Pertama
            </button>
          )}
        </div>
      )}

      {/* Show price cards if data exists */}
      {marketPrices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {marketPrices.map((price) => (
            <PriceCard key={price.id} price={price} />
          ))}
        </div>
      )}

      {/* Simple test message */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Component loaded successfully. Backend: {loading ? 'Loading...' : 'Ready'}
      </div>
    </div>
  );
};

export default EnhancedMarketPriceInput;