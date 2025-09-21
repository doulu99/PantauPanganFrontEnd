// components/AddMarketPriceModal.jsx - ENHANCED WITH COMMODITY CREATION
import React, { useState, useEffect } from 'react';
import { X, Plus, Loader2, Package, Edit3 } from 'lucide-react';
import { marketPriceAPI, customCommodityAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import ImageUpload from './ImageUpload';

const AddMarketPriceModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [commodities, setCommodities] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showCreateCommodity, setShowCreateCommodity] = useState(false);
  const [creatingCommodity, setCreatingCommodity] = useState(false);
  
  const [formData, setFormData] = useState({
    commodity_id: '',
    commodity_source: 'custom',
    market_name: '',
    market_location: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    quality_grade: 'standard',
    notes: ''
  });

  // New commodity form data
  const [newCommodity, setNewCommodity] = useState({
    name: '',
    unit: '',
    category: 'lainnya',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [commodityErrors, setCommodityErrors] = useState({});

  // Categories for new commodity
  const categories = [
    { value: 'beras', label: 'Beras' },
    { value: 'sayuran', label: 'Sayuran' },
    { value: 'buah', label: 'Buah' },
    { value: 'daging', label: 'Daging' },
    { value: 'ikan', label: 'Ikan' },
    { value: 'bumbu', label: 'Bumbu' },
    { value: 'telur', label: 'Telur' },
    { value: 'kacang', label: 'Kacang-kacangan' },
    { value: 'minyak', label: 'Minyak' },
    { value: 'lainnya', label: 'Lainnya' }
  ];

  // Common units
  const commonUnits = [
    'kg', 'gram', 'liter', 'ml', 'buah', 'biji', 'lembar', 'batang', 
    'ikat', 'bungkus', 'sachet', 'botol', 'kaleng', 'dus'
  ];

  // Fetch commodities when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCommodities();
      resetForm();
    }
  }, [isOpen]);

  const fetchCommodities = async () => {
    try {
      const customResponse = await customCommodityAPI.getCustomCommodities();
      if (customResponse.data.success) {
        const customCommodities = customResponse.data.data.map(commodity => ({
          ...commodity,
          source: 'custom',
          display_name: `${commodity.name} (${commodity.unit}) - ${commodity.category}`
        }));
        setCommodities(customCommodities);
      }
    } catch (error) {
      console.error('Error fetching commodities:', error);
      toast.error('Gagal memuat data komoditas');
    }
  };

  const resetForm = () => {
    setFormData({
      commodity_id: '',
      commodity_source: 'custom',
      market_name: '',
      market_location: '',
      price: '',
      date: new Date().toISOString().split('T')[0],
      quality_grade: 'standard',
      notes: ''
    });
    setNewCommodity({
      name: '',
      unit: '',
      category: 'lainnya',
      description: ''
    });
    setSelectedImages([]);
    setErrors({});
    setCommodityErrors({});
    setShowCreateCommodity(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCommodityInputChange = (e) => {
    const { name, value } = e.target;
    setNewCommodity(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (commodityErrors[name]) {
      setCommodityErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCommodityChange = (e) => {
    const commodityId = e.target.value;
    
    if (commodityId === 'create_new') {
      setShowCreateCommodity(true);
      setFormData(prev => ({
        ...prev,
        commodity_id: ''
      }));
      return;
    }
    
    const selectedCommodity = commodities.find(c => c.id === parseInt(commodityId));
    
    setFormData(prev => ({
      ...prev,
      commodity_id: commodityId,
      commodity_source: selectedCommodity ? selectedCommodity.source : 'custom'
    }));
    
    if (errors.commodity_id) {
      setErrors(prev => ({
        ...prev,
        commodity_id: ''
      }));
    }
  };

  const validateCommodityForm = () => {
    const newErrors = {};

    if (!newCommodity.name.trim()) {
      newErrors.name = 'Nama komoditas harus diisi';
    }

    if (!newCommodity.unit.trim()) {
      newErrors.unit = 'Satuan harus diisi';
    }

    if (!newCommodity.category) {
      newErrors.category = 'Kategori harus dipilih';
    }

    setCommodityErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCommodity = async () => {
    if (!validateCommodityForm()) {
      return;
    }

    setCreatingCommodity(true);

    try {
      const response = await customCommodityAPI.createCustomCommodity(newCommodity);

      if (response.data.success) {
        toast.success('Komoditas baru berhasil dibuat');
        
        // Add to commodities list
        const createdCommodity = {
          ...response.data.data,
          source: 'custom',
          display_name: `${response.data.data.name} (${response.data.data.unit}) - ${response.data.data.category}`
        };
        
        setCommodities(prev => [createdCommodity, ...prev]);
        
        // Select the new commodity
        setFormData(prev => ({
          ...prev,
          commodity_id: createdCommodity.id.toString(),
          commodity_source: 'custom'
        }));
        
        // Close create form
        setShowCreateCommodity(false);
        setNewCommodity({
          name: '',
          unit: '',
          category: 'lainnya',
          description: ''
        });
        setCommodityErrors({});
        
      } else {
        throw new Error(response.data.message || 'Gagal membuat komoditas');
      }
    } catch (error) {
      console.error('Error creating commodity:', error);
      
      let errorMessage = 'Gagal membuat komoditas baru';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const validationErrors = {};
        error.response.data.errors.forEach(err => {
          validationErrors[err.field] = err.message;
        });
        setCommodityErrors(validationErrors);
        errorMessage = 'Terdapat kesalahan validasi';
      }
      
      toast.error(errorMessage);
    } finally {
      setCreatingCommodity(false);
    }
  };

  const handleImagesChange = (images) => {
    setSelectedImages(images);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.commodity_id) {
      newErrors.commodity_id = 'Komoditas harus dipilih';
    }

    if (!formData.market_name.trim()) {
      newErrors.market_name = 'Nama pasar harus diisi';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Harga harus diisi dan lebih dari 0';
    }

    if (!formData.date) {
      newErrors.date = 'Tanggal harus diisi';
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
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      selectedImages.forEach((image, index) => {
        submitData.append('images', image);
      });

      const response = await marketPriceAPI.addMarketPrice(submitData);

      if (response.data.success) {
        toast.success('Data harga pasar berhasil ditambahkan');
        onSuccess();
      } else {
        throw new Error(response.data.message || 'Gagal menambahkan data');
      }
    } catch (error) {
      console.error('Error adding market price:', error);
      
      let errorMessage = 'Gagal menambahkan data harga pasar';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const validationErrors = {};
        error.response.data.errors.forEach(err => {
          validationErrors[err.field] = err.message;
        });
        setErrors(validationErrors);
        errorMessage = 'Terdapat kesalahan validasi pada form';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Tambah Harga Pasar Baru
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Commodity Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Komoditas *
                </label>
                
                {!showCreateCommodity ? (
                  <div className="space-y-2">
                    <select
                      name="commodity_id"
                      value={formData.commodity_id}
                      onChange={handleCommodityChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.commodity_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={loading}
                    >
                      <option value="">Pilih Komoditas</option>
                      {commodities.map(commodity => (
                        <option key={commodity.id} value={commodity.id}>
                          {commodity.display_name}
                        </option>
                      ))}
                      <option value="create_new" className="bg-blue-50 text-blue-700">
                        + Buat Komoditas Baru
                      </option>
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => setShowCreateCommodity(true)}
                      className="w-full px-3 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Buat Komoditas Baru
                    </button>
                  </div>
                ) : (
                  /* Create New Commodity Form */
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-blue-900 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Buat Komoditas Baru
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowCreateCommodity(false)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-blue-800 mb-1">
                            Nama Komoditas *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={newCommodity.name}
                            onChange={handleCommodityInputChange}
                            placeholder="Contoh: Tempe Mendoan"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              commodityErrors.name ? 'border-red-500' : 'border-blue-300'
                            }`}
                            disabled={creatingCommodity}
                          />
                          {commodityErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{commodityErrors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-blue-800 mb-1">
                            Satuan *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="unit"
                              value={newCommodity.unit}
                              onChange={handleCommodityInputChange}
                              placeholder="Contoh: Ikat"
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                commodityErrors.unit ? 'border-red-500' : 'border-blue-300'
                              }`}
                              disabled={creatingCommodity}
                              list="units-list"
                            />
                            <datalist id="units-list">
                              {commonUnits.map(unit => (
                                <option key={unit} value={unit} />
                              ))}
                            </datalist>
                          </div>
                          {commodityErrors.unit && (
                            <p className="mt-1 text-sm text-red-600">{commodityErrors.unit}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          Kategori *
                        </label>
                        <select
                          name="category"
                          value={newCommodity.category}
                          onChange={handleCommodityInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            commodityErrors.category ? 'border-red-500' : 'border-blue-300'
                          }`}
                          disabled={creatingCommodity}
                        >
                          {categories.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                        {commodityErrors.category && (
                          <p className="mt-1 text-sm text-red-600">{commodityErrors.category}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-1">
                          Deskripsi
                        </label>
                        <input
                          type="text"
                          name="description"
                          value={newCommodity.description}
                          onChange={handleCommodityInputChange}
                          placeholder="Contoh: 1 Ikat 4 Lembar"
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={creatingCommodity}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleCreateCommodity}
                        disabled={creatingCommodity}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {creatingCommodity ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Membuat...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Buat Komoditas
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                {errors.commodity_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.commodity_id}</p>
                )}
              </div>

              {/* Market Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Pasar *
                  </label>
                  <input
                    type="text"
                    name="market_name"
                    value={formData.market_name}
                    onChange={handleInputChange}
                    placeholder="Contoh: Pasar Minggu"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.market_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  {errors.market_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.market_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi Pasar
                  </label>
                  <input
                    type="text"
                    name="market_location"
                    value={formData.market_location}
                    onChange={handleInputChange}
                    placeholder="Contoh: Jakarta Selatan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Price and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="15000"
                      min="1"
                      step="100"
                      className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={loading}
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                  {formData.price && parseFloat(formData.price) > 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      {formatCurrency(parseFloat(formData.price))}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>
              </div>

              {/* Quality Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kualitas
                </label>
                <select
                  name="quality_grade"
                  value={formData.quality_grade}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="economy">Economy (Kualitas Ekonomis)</option>
                  <option value="standard">Standard (Kualitas Standar)</option>
                  <option value="premium">Premium (Kualitas Premium)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Catatan tambahan tentang harga ini..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="space-y-6">
              {/* Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Bukti Harga
                </label>
                <ImageUpload
                  images={selectedImages}
                  onImagesChange={handleImagesChange}
                  maxImages={5}
                  maxSizePerImage={5}
                  disabled={loading}
                  className="mb-2"
                />
                <p className="text-xs text-gray-500">
                  Upload foto untuk verifikasi harga. Foto pertama akan menjadi foto utama.
                </p>
              </div>

              {/* Form Summary */}
              {formData.commodity_id && formData.price && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Ringkasan Data</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>
                      <span className="font-medium">Komoditas:</span>{' '}
                      {commodities.find(c => c.id === parseInt(formData.commodity_id))?.name || '-'}
                    </p>
                    <p>
                      <span className="font-medium">Satuan:</span>{' '}
                      {commodities.find(c => c.id === parseInt(formData.commodity_id))?.unit || '-'}
                    </p>
                    <p>
                      <span className="font-medium">Pasar:</span>{' '}
                      {formData.market_name || '-'}
                      {formData.market_location && ` (${formData.market_location})`}
                    </p>
                    <p>
                      <span className="font-medium">Harga:</span>{' '}
                      {formData.price ? formatCurrency(parseFloat(formData.price)) : '-'}
                    </p>
                    <p>
                      <span className="font-medium">Foto:</span>{' '}
                      {selectedImages.length} foto
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !formData.commodity_id}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Harga
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