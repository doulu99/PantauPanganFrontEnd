import React, { useState, useEffect } from 'react';
import { X, Store, MapPin, Calendar, Save, AlertCircle } from 'lucide-react';
import { marketPriceAPI, priceAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const EditMarketPriceModal = ({ isOpen, onClose, price, onSuccess }) => {
  const [commodities, setCommodities] = useState([]);
  const [formData, setFormData] = useState({
    commodity_id: '',
    market_name: '',
    market_location: '',
    price: '',
    date: '',
    quality_grade: 'standard',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalPrice, setOriginalPrice] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCommodities();
      if (price) {
        setOriginalPrice(price);
        setFormData({
          commodity_id: price.commodity_id || '',
          market_name: price.market_name || '',
          market_location: price.market_location || '',
          price: price.price || '',
          date: price.date ? new Date(price.date).toISOString().split('T')[0] : '',
          quality_grade: price.quality_grade || 'standard',
          notes: price.notes || ''
        });
      }
    }
  }, [isOpen, price]);

  const fetchCommodities = async () => {
    try {
      const response = await priceAPI.getCurrentPrices({ limit: 100 });
      if (response.data.success) {
        const uniqueCommodities = [];
        const seen = new Set();
        
        response.data.data.forEach(item => {
          if (item.commodity && !seen.has(item.commodity.id)) {
            seen.add(item.commodity.id);
            uniqueCommodities.push(item.commodity);
          }
        });
        
        setCommodities(uniqueCommodities);
      }
    } catch (error) {
      console.error('Error fetching commodities:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.commodity_id) {
      newErrors.commodity_id = 'Pilih komoditas';
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
      const updateData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      await marketPriceAPI.updateMarketPrice(price.id, updateData);
      toast.success('Harga pasar berhasil diperbarui!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui harga pasar');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatNumber = (value) => {
    const number = parseFloat(value);
    return isNaN(number) ? 0 : number;
  };

  if (!isOpen || !price) return null;

  const priceChange = originalPrice ? 
    ((parseFloat(formData.price) || 0) - parseFloat(originalPrice.price || 0)) : 0;
  const priceChangePercent = originalPrice && originalPrice.price ? 
    (priceChange / parseFloat(originalPrice.price) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Edit Harga Pasar</h2>
            <p className="text-sm text-gray-600">
              Perbarui data harga untuk {price.commodity?.name}
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
          {/* Price Change Alert */}
          {priceChange !== 0 && (
            <div className={`p-4 rounded-lg border-l-4 ${
              priceChange > 0 
                ? 'bg-red-50 border-red-400' 
                : 'bg-green-50 border-green-400'
            }`}>
              <div className="flex items-center">
                <AlertCircle className={`w-4 h-4 mr-2 ${
                  priceChange > 0 ? 'text-red-600' : 'text-green-600'
                }`} />
                <div className="text-sm">
                  <p className={`font-medium ${
                    priceChange > 0 ? 'text-red-800' : 'text-green-800'
                  }`}>
                    Perubahan Harga: {priceChange > 0 ? '+' : ''}{formatCurrency(priceChange)} 
                    ({priceChangePercent > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
                  </p>
                  <p className={`${
                    priceChange > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    Dari {formatCurrency(originalPrice?.price || 0)} menjadi {formatCurrency(formData.price || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Commodity Selection */}
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
                  {commodities.map(comm => (
                    <option key={comm.id} value={comm.id}>
                      {comm.name} ({comm.unit})
                    </option>
                  ))}
                </select>
                {errors.commodity_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.commodity_id}</p>
                )}
              </div>

              {/* Market Name */}
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

              {/* Market Location */}
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

              {/* Quality Grade */}
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

            {/* Right Column */}
            <div className="space-y-4">
              {/* Price */}
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
                {originalPrice && (
                  <p className="mt-1 text-xs text-gray-500">
                    Harga sebelumnya: {formatCurrency(originalPrice.price)}
                  </p>
                )}
              </div>

              {/* Date */}
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

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows="4"
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
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMarketPriceModal;