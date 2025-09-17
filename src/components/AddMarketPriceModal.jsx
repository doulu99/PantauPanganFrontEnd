import React, { useState, useEffect } from 'react';
import { X, Store, MapPin, Calendar, Upload, Plus, Package } from 'lucide-react';
import { marketPriceAPI, priceAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const AddMarketPriceModal = ({ isOpen, onClose, onSuccess }) => {
  const [commodities, setCommodities] = useState([]);
  const [showCustomCommodity, setShowCustomCommodity] = useState(false);
  const [customCommodityData, setCustomCommodityData] = useState({
    name: '',
    unit: '',
    category: '',
    description: ''
  });
  const [formData, setFormData] = useState({
    commodity_id: '',
    commodity_type: 'existing', // 'existing' or 'custom'
    market_name: '',
    market_location: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    quality_grade: 'standard',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchCommodities();
      resetForm();
    }
  }, [isOpen]);

  const fetchCommodities = async () => {
    try {
      // Ambil komoditas dari API nasional
      const nationalResponse = await priceAPI.getCurrentPrices({ limit: 100 });
      
      // Ambil komoditas custom yang sudah pernah dibuat
      const customResponse = await marketPriceAPI.getCustomCommodities();
      
      const allCommodities = [];
      const seen = new Set();
      
      // Tambahkan komoditas nasional
      if (nationalResponse.data.success) {
        nationalResponse.data.data.forEach(item => {
          if (item.commodity && !seen.has(item.commodity.id)) {
            seen.add(item.commodity.id);
            allCommodities.push({
              ...item.commodity,
              source: 'national'
            });
          }
        });
      }
      
      // Tambahkan komoditas custom
      if (customResponse.data.success) {
        customResponse.data.data.forEach(commodity => {
          if (!seen.has(commodity.id)) {
            seen.add(commodity.id);
            allCommodities.push({
              ...commodity,
              source: 'custom'
            });
          }
        });
      }
      
      setCommodities(allCommodities);
    } catch (error) {
      console.error('Error fetching commodities:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      commodity_id: '',
      commodity_type: 'existing',
      market_name: '',
      market_location: '',
      price: '',
      date: new Date().toISOString().split('T')[0],
      quality_grade: 'standard',
      notes: ''
    });
    setCustomCommodityData({
      name: '',
      unit: '',
      category: '',
      description: ''
    });
    setShowCustomCommodity(false);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    // Validasi commodity
    if (formData.commodity_type === 'existing') {
      if (!formData.commodity_id) {
        newErrors.commodity_id = 'Pilih komoditas atau buat komoditas baru';
      }
    } else {
      if (!customCommodityData.name.trim()) {
        newErrors.custom_name = 'Nama komoditas wajib diisi';
      }
      if (!customCommodityData.unit.trim()) {
        newErrors.custom_unit = 'Satuan wajib diisi';
      }
      if (!customCommodityData.category.trim()) {
        newErrors.custom_category = 'Kategori wajib diisi';
      }
    }

    if (!formData.market_name.trim()) {
      newErrors.market_name = 'Nama pasar wajib diisi';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Harga harus lebih dari 0';
    }
    
    if (!formData.date) {
      newErrors.date = 'Tanggal wajib diisi';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date = 'Tanggal tidak boleh lebih dari hari ini';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let commodityId = formData.commodity_id;

      // Jika komoditas baru, buat dulu komoditasnya
      if (formData.commodity_type === 'custom') {
        const commodityResponse = await marketPriceAPI.createCustomCommodity(customCommodityData);
        if (commodityResponse.data.success) {
          commodityId = commodityResponse.data.data.id;
          toast.success('Komoditas baru berhasil dibuat!');
        } else {
          throw new Error('Gagal membuat komoditas baru');
        }
      }

      // Buat data harga pasar
      const priceData = {
        ...formData,
        commodity_id: commodityId,
        price: parseFloat(formData.price)
      };

      await marketPriceAPI.addMarketPrice(priceData);
      toast.success('Harga pasar berhasil ditambahkan!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambah harga pasar');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.startsWith('custom_')) {
      const customField = field.replace('custom_', '');
      setCustomCommodityData(prev => ({
        ...prev,
        [customField]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const toggleCommodityType = () => {
    const newType = formData.commodity_type === 'existing' ? 'custom' : 'existing';
    setFormData(prev => ({
      ...prev,
      commodity_type: newType,
      commodity_id: ''
    }));
    setShowCustomCommodity(newType === 'custom');
    
    // Clear related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.commodity_id;
      delete newErrors.custom_name;
      delete newErrors.custom_unit;
      delete newErrors.custom_category;
      return newErrors;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Tambah Harga Pasar</h2>
            <p className="text-sm text-gray-600">
              Input data harga pasar lokal untuk perbandingan
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 rounded-lg"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Commodity Type Selection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Pilih Komoditas</h3>
              <div className="flex bg-white rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => formData.commodity_type === 'custom' && toggleCommodityType()}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    formData.commodity_type === 'existing'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  disabled={loading}
                >
                  Pilih yang Ada
                </button>
                <button
                  type="button"
                  onClick={() => formData.commodity_type === 'existing' && toggleCommodityType()}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    formData.commodity_type === 'custom'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                  disabled={loading}
                >
                  Buat Baru
                </button>
              </div>
            </div>

            {formData.commodity_type === 'existing' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Komoditas <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.commodity_id}
                  onChange={(e) => handleInputChange('commodity_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.commodity_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">Pilih Komoditas</option>
                  <optgroup label="Komoditas Nasional">
                    {commodities
                      .filter(comm => comm.source === 'national')
                      .map(comm => (
                        <option key={`national-${comm.id}`} value={comm.id}>
                          {comm.name} ({comm.unit}) - Nasional
                        </option>
                      ))
                    }
                  </optgroup>
                  <optgroup label="Komoditas Custom">
                    {commodities
                      .filter(comm => comm.source === 'custom')
                      .map(comm => (
                        <option key={`custom-${comm.id}`} value={comm.id}>
                          {comm.name} ({comm.unit}) - Custom
                        </option>
                      ))
                    }
                  </optgroup>
                </select>
                {errors.commodity_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.commodity_id}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center text-green-600 mb-3">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Membuat Komoditas Baru</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Komoditas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customCommodityData.name}
                      onChange={(e) => handleInputChange('custom_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.custom_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Contoh: Ikan Lele Segar"
                      disabled={loading}
                    />
                    {errors.custom_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.custom_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Satuan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customCommodityData.unit}
                      onChange={(e) => handleInputChange('custom_unit', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.custom_unit ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Contoh: Kg, Pcs, Ikat"
                      disabled={loading}
                    />
                    {errors.custom_unit && (
                      <p className="mt-1 text-sm text-red-600">{errors.custom_unit}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={customCommodityData.category}
                    onChange={(e) => handleInputChange('custom_category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.custom_category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="beras">Beras</option>
                    <option value="sayuran">Sayuran</option>
                    <option value="buah">Buah</option>
                    <option value="daging">Daging</option>
                    <option value="ikan">Ikan & Seafood</option>
                    <option value="bumbu">Bumbu & Rempah</option>
                    <option value="telur">Telur & Susu</option>
                    <option value="kacang">Kacang-kacangan</option>
                    <option value="minyak">Minyak & Lemak</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                  {errors.custom_category && (
                    <p className="mt-1 text-sm text-red-600">{errors.custom_category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={customCommodityData.description}
                    onChange={(e) => handleInputChange('custom_description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Deskripsi singkat komoditas..."
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Market Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pasar <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.market_name}
                    onChange={(e) => handleInputChange('market_name', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.market_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Contoh: Pasar Induk Kramat Jati"
                    disabled={loading}
                  />
                </div>
                {errors.market_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.market_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi Pasar
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.market_location}
                    onChange={(e) => handleInputChange('market_location', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Jakarta Timur"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tingkat Kualitas
                </label>
                <select
                  value={formData.quality_grade}
                  onChange={(e) => handleInputChange('quality_grade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="premium">Premium</option>
                  <option value="standard">Standard</option>
                  <option value="ekonomis">Ekonomis</option>
                </select>
              </div>
            </div>

            {/* Right Column - Price Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={loading}
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Catatan tambahan (opsional)..."
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {formData.commodity_type === 'custom' ? 'Membuat...' : 'Menyimpan...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Simpan Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMarketPriceModal;