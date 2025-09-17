import React, { useState } from 'react';
import { X, Upload, AlertCircle, Check } from 'lucide-react';
import { overrideAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const PriceOverrideModal = ({ isOpen, onClose, commodity, onSuccess }) => {
  const [formData, setFormData] = useState({
    override_price: '',
    reason: '',
    source_info: '',
    evidence: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, evidence: 'File size must be less than 5MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, evidence: file }));
      setErrors(prev => ({ ...prev, evidence: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.override_price || formData.override_price <= 0) {
      newErrors.override_price = 'Harga harus lebih dari 0';
    }
    
    if (!formData.reason || formData.reason.length < 10) {
      newErrors.reason = 'Alasan minimal 10 karakter';
    }
    
    if (!formData.source_info) {
      newErrors.source_info = 'Sumber informasi harus diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    
    const submitData = new FormData();
    submitData.append('commodity_id', commodity.commodity?.id || commodity.id);
    submitData.append('override_price', formData.override_price);
    submitData.append('reason', formData.reason);
    submitData.append('source_info', formData.source_info);
    submitData.append('date', new Date().toISOString().split('T')[0]);
    
    if (formData.evidence) {
      submitData.append('evidence', formData.evidence);
    }
    
    try {
      await overrideAPI.createOverride(submitData);
      toast.success('Harga berhasil diupdate!');
      onSuccess();
      onClose();
      setFormData({
        override_price: '',
        reason: '',
        source_info: '',
        evidence: null
      });
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Gagal menyimpan data');
      setErrors({ submit: 'Gagal menyimpan data. Silakan coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = commodity?.price || 0;
  const priceDifference = formData.override_price ? 
    ((formData.override_price - currentPrice) / currentPrice * 100).toFixed(2) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Override Harga Manual</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Commodity Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Informasi Komoditas</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Nama:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {commodity?.commodity?.name || commodity?.name}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Harga Saat Ini:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {formatCurrency(currentPrice)}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Satuan:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {commodity?.commodity?.unit || commodity?.unit || 'Rp/kg'}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Kategori:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {commodity?.commodity?.category || commodity?.category}
                </span>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Override Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Manual <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Rp
                </span>
                <input
                  type="number"
                  name="override_price"
                  value={formData.override_price}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.override_price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
              </div>
              {errors.override_price && (
                <p className="mt-1 text-sm text-red-600">{errors.override_price}</p>
              )}
              
              {formData.override_price && currentPrice && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    Perbedaan: {priceDifference}%
                    {Math.abs(priceDifference) > 50 && (
                      <span className="text-red-600 font-medium ml-2">
                        (Perbedaan 50% memerlukan approval admin)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alasan Perubahan <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: Harga di pasar lokal berbeda karena stok terbatas"
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
            </div>

            {/* Source Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sumber Informasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="source_info"
                value={formData.source_info}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.source_info ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: Pasar Induk Kramat Jati"
              />
              {errors.source_info && (
                <p className="mt-1 text-sm text-red-600">{errors.source_info}</p>
              )}
            </div>

            {/* Evidence Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bukti Foto (Opsional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload file</span>
                      <input
                        type="file"
                        name="evidence"
                        onChange={handleFileChange}
                        className="sr-only"
                        accept="image/*,.pdf"
                      />
                    </label>
                    <p className="pl-1">atau drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF hingga 5MB
                  </p>
                  {formData.evidence && (
                    <div className="mt-2 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">
                        {formData.evidence.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {errors.evidence && (
                <p className="mt-1 text-sm text-red-600">{errors.evidence}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Harga Manual'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PriceOverrideModal;