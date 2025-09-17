import React, { useState, useEffect } from 'react';
import { X, Store, MapPin, Calendar, Upload } from 'lucide-react';
import { marketPriceAPI, priceAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const AddMarketPriceModal = ({ isOpen, onClose, onSuccess }) => {
  const [commodities, setCommodities] = useState([]);
  const [formData, setFormData] = useState({
    commodity_id: '',
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
    fetchCommodities();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    if (!formData.commodity_id) newErrors.commodity_id = 'Pilih komoditas';
    if (!formData.market_name) newErrors.market_name = 'Nama pasar wajib diisi';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Harga harus lebih dari 0';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await marketPriceAPI.addMarketPrice(formData);
      toast.success('Harga pasar berhasil ditambahkan!');
      onSuccess();
    } catch (error) {
      toast.error('Gagal menambah harga pasar');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tambah Harga Pasar</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Commodity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Komoditas <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.commodity_id}
              onChange={(e) => setFormData({...formData, commodity_id: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.commodity_id ? 'border-red-500' : 'border-gray-300'
              }`}
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
                onChange={(e) => setFormData({...formData, market_name: e.target.value})}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.market_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: Pasar Induk Kramat Jati"
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
                onChange={(e) => setFormData({...formData, market_location: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Jakarta Timur"
              />
            </div>
          </div>

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
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          {/* Date and Quality */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kualitas
              </label>
              <select
                value={formData.quality_grade}
                onChange={(e) => setFormData({...formData, quality_grade: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="premium">Premium</option>
                <option value="standard">Standard</option>
                <option value="economy">Ekonomi</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Catatan tambahan (opsional)"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMarketPriceModal;