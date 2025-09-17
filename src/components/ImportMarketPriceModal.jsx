import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { marketPriceAPI } from '../services/api';
import toast from 'react-hot-toast';

const ImportMarketPriceModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Result
  const [previewData, setPreviewData] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast.error('Format file tidak didukung. Gunakan Excel (.xlsx, .xls) atau CSV (.csv)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Ukuran file terlalu besar. Maksimal 5MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await marketPriceAPI.downloadImportTemplate();
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template-import-harga-pasar.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Template berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengunduh template');
      console.error(error);
    }
  };

  const validateImportData = async () => {
    if (!selectedFile) {
      toast.error('Pilih file terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await marketPriceAPI.validateImportData(formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });

      if (response.data.success) {
        setPreviewData(response.data.data.preview);
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memvalidasi data');
      console.error(error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const processImport = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await marketPriceAPI.importMarketPrices(formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });

      if (response.data.success) {
        setImportResult(response.data.data);
        setStep(3);
        toast.success('Import data berhasil!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengimport data');
      console.error(error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setLoading(false);
    setUploadProgress(0);
    setImportResult(null);
    setStep(1);
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSuccess = () => {
    resetModal();
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Import Data Harga Pasar</h2>
            <p className="text-sm text-gray-600">
              {step === 1 && 'Upload file Excel atau CSV dengan data harga pasar'}
              {step === 2 && 'Preview data yang akan diimport'}
              {step === 3 && 'Hasil import data'}
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1 hover:bg-gray-100 rounded-lg"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Download className="w-5 h-5 text-blue-600 mr-2" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">Download Template</h4>
                    <p className="text-sm text-blue-700">
                      Unduh template Excel untuk memudahkan input data
                    </p>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Download
                  </button>
                </div>
              </div>

              {/* File Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload File Import
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag & drop file atau klik untuk memilih
                </p>
                <p className="text-sm text-gray-500">
                  Mendukung: Excel (.xlsx, .xls) dan CSV (.csv) - Maksimal 5MB
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-600 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Format Requirements */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-2">Persyaratan Format Data:</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Kolom wajib: commodity_name, market_name, price, date</li>
                      <li>• Format tanggal: YYYY-MM-DD (contoh: 2025-01-15)</li>
                      <li>• Harga dalam angka tanpa simbol mata uang</li>
                      <li>• Nama komoditas harus sesuai dengan data yang ada</li>
                      <li>• Maksimal 1000 baris data per file</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  onClick={validateImportData}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={!selectedFile || loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Memvalidasi... {uploadProgress}%
                    </div>
                  ) : (
                    'Validasi Data'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Preview Data Import</h3>
                <p className="text-sm text-gray-600">
                  {previewData.length} baris data ditemukan
                </p>
              </div>

              {/* Preview Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Komoditas
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Pasar
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Lokasi
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Harga
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tanggal
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.slice(0, 10).map((row, index) => (
                        <tr key={index} className={row.errors ? 'bg-red-50' : ''}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {row.commodity_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {row.market_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {row.market_location || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            Rp {parseFloat(row.price || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(row.date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {row.errors ? (
                              <div className="flex items-center text-red-600">
                                <XCircle className="w-4 h-4 mr-1" />
                                Error
                              </div>
                            ) : (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Valid
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {previewData.length > 10 && (
                <p className="text-sm text-gray-500 text-center">
                  Dan {previewData.length - 10} baris lainnya...
                </p>
              )}

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Kembali
                </button>
                <div className="space-x-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={loading}
                  >
                    Batal
                  </button>
                  <button
                    onClick={processImport}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Mengimport... {uploadProgress}%
                      </div>
                    ) : (
                      'Import Data'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Result */}
          {step === 3 && importResult && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Import Berhasil!
                </h3>
                <p className="text-gray-600">
                  Data harga pasar telah berhasil diimport ke sistem
                </p>
              </div>

              {/* Result Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-800">
                    {importResult.success_count || 0}
                  </div>
                  <div className="text-sm text-green-600">Berhasil</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-800">
                    {importResult.error_count || 0}
                  </div>
                  <div className="text-sm text-red-600">Gagal</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-800">
                    {importResult.total_processed || 0}
                  </div>
                  <div className="text-sm text-blue-600">Total Diproses</div>
                </div>
              </div>

              {/* Error Details */}
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Error yang Ditemukan:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>• Baris {error.row}: {error.message}</li>
                    ))}
                  </ul>
                  {importResult.errors.length > 10 && (
                    <p className="text-sm text-red-600 mt-2">
                      Dan {importResult.errors.length - 10} error lainnya...
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Tutup
                </button>
                <button
                  onClick={handleSuccess}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Lihat Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportMarketPriceModal;