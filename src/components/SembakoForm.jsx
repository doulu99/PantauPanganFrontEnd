// ==========================================
// 7. src/components/SembakoForm.jsx
// ==========================================
import React, { useState, useEffect } from 'react';
import { Save, X, MapPin, Calendar } from 'lucide-react';
import { sembakoApi } from '../services/sembakoApi';

const SembakoForm = ({ item = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    province_name: '',
    market_name: '',
    survey_date: new Date().toISOString().split('T')[0],
    harga_beras: '',
    harga_gula: '',
    harga_minyak: '',
    harga_daging: '',
    harga_ayam: '',
    harga_telur: '',
    harga_bawang_merah: '',
    harga_bawang_putih: '',
    harga_gas: '',
    harga_garam: '',
    harga_susu: '',
    source: 'manual',
    status: 'published',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form with item data if editing
  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        survey_date: item.survey_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        harga_beras: item.harga_beras || '',
        harga_gula: item.harga_gula || '',
        harga_minyak: item.harga_minyak || '',
        harga_daging: item.harga_daging || '',
        harga_ayam: item.harga_ayam || '',
        harga_telur: item.harga_telur || '',
        harga_bawang_merah: item.harga_bawang_merah || '',
        harga_bawang_putih: item.harga_bawang_putih || '',
        harga_gas: item.harga_gas || '',
        harga_garam: item.harga_garam || '',
        harga_susu: item.harga_susu || '',
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.province_name || !formData.market_name || !formData.survey_date) {
      setError('Provinsi, nama pasar, dan tanggal survei wajib diisi');
      return;
    }

    // Check if at least one price is filled
    const priceFields = [
      'harga_beras', 'harga_gula', 'harga_minyak', 'harga_daging', 
      'harga_ayam', 'harga_telur', 'harga_bawang_merah', 
      'harga_bawang_putih', 'harga_gas', 'harga_garam', 'harga_susu'
    ];
    
    const hasPrice = priceFields.some(field => formData[field] && parseFloat(formData[field]) > 0);
    
    if (!hasPrice) {
      setError('Minimal satu harga komoditas harus diisi');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare data - convert empty strings to null and numbers to float
      const submitData = { ...formData };
      priceFields.forEach(field => {
        if (submitData[field] === '' || submitData[field] === null) {
          submitData[field] = null;
        } else {
          submitData[field] = parseFloat(submitData[field]);
        }
      });

      if (item) {
        await sembakoApi.update(item.id, submitData);
      } else {
        await sembakoApi.create(submitData);
      }

      onSave();
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const commodities = [
    { key: 'harga_beras', name: 'Beras', unit: '/kg', icon: '🌾' },
    { key: 'harga_gula', name: 'Gula', unit: '/kg', icon: '🍯' },
    { key: 'harga_minyak', name: 'Minyak Goreng', unit: '/liter', icon: '🛢️' },
    { key: 'harga_daging', name: 'Daging Sapi', unit: '/kg', icon: '🥩' },
    { key: 'harga_ayam', name: 'Ayam', unit: '/kg', icon: '🐔' },
    { key: 'harga_telur', name: 'Telur', unit: '/kg', icon: '🥚' },
    { key: 'harga_bawang_merah', name: 'Bawang Merah', unit: '/kg', icon: '🧅' },
    { key: 'harga_bawang_putih', name: 'Bawang Putih', unit: '/kg', icon: '🧄' },
    { key: 'harga_gas', name: 'Gas LPG 3kg', unit: '/tabung', icon: '🫗' },
    { key: 'harga_garam', name: 'Garam', unit: '/kg', icon: '🧂' },
    { key: 'harga_susu', name: 'Susu', unit: '/liter', icon: '🥛' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {item ? 'Edit Data Sembako' : 'Tambah Data Sembako'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Informasi Lokasi & Waktu
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provinsi *
                </label>
                <input
                  type="text"
                  name="province_name"
                  value={formData.province_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama provinsi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Pasar *
                </label>
                <input
                  type="text"
                  name="market_name"
                  value={formData.market_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama pasar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Survei *
                </label>
                <input
                  type="date"
                  name="survey_date"
                  value={formData.survey_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Prices */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              💰 Harga Komoditas
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Isi minimal satu harga komoditas. Kosongkan jika tidak tersedia.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {commodities.map((commodity) => (
                <div key={commodity.key} className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span className="mr-2">{commodity.icon}</span>
                    {commodity.name}
                    <span className="text-gray-500 ml-1">{commodity.unit}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      name={commodity.key}
                      value={formData[commodity.key]}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meta Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ⚙️ Pengaturan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sumber Data
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="manual">Manual</option>
                  <option value="google_form">Google Form</option>
                  <option value="google_sheet">Google Sheet</option>
                  <option value="import_csv">Import CSV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SembakoForm;