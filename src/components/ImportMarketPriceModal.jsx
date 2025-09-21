// components/ImportMarketPriceModal.jsx - ENHANCED VERSION
import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle, Loader2, Eye } from 'lucide-react';
import { marketPriceAPI } from '../services/api';
import toast from 'react-hot-toast';

const ImportMarketPriceModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setValidationResult(null);
    setShowPreview(false);
    setPreviewData([]);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Format file tidak didukung. Gunakan Excel (.xlsx, .xls) atau CSV.');
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File terlalu besar. Maksimal 10MB.');
        return;
      }

      setFile(selectedFile);
      setValidationResult(null);
      setShowPreview(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileSelect(event);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const downloadTemplate = async () => {
    try {
      // Create CSV template content
      const templateContent = `commodity_id,commodity_source,market_name,market_location,price,date,quality_grade,notes
1,custom,Pasar Minggu,Jakarta Selatan,15000,2025-01-20,standard,Contoh data harga tempe
1,custom,Pasar Kebayoran,Jakarta Selatan,14500,2025-01-20,standard,Harga sedikit lebih murah
1,custom,Pasar Mayestik,Jakarta Selatan,15500,2025-01-20,premium,Kualitas premium`;

      // Create and download the file
      const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'template-import-harga-pasar.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast.success('Template berhasil didownload');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Gagal mendownload template');
    }
  };

  const validateFile = async () => {
    if (!file) return;

    setValidating(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // For now, we'll do basic client-side validation
      // In a real implementation, you'd send this to the server
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');
        const headers = lines[0].split(',');
        
        // Required headers
        const requiredHeaders = ['commodity_id', 'market_name', 'price', 'date'];
        const missingHeaders = requiredHeaders.filter(header => 
          !headers.some(h => h.trim().toLowerCase() === header.toLowerCase())
        );

        if (missingHeaders.length > 0) {
          setValidationResult({
            valid: false,
            errors: [`Header yang hilang: ${missingHeaders.join(', ')}`],
            warnings: [],
            totalRows: lines.length - 1,
            validRows: 0
          });
        } else {
          // Parse some data for preview
          const dataRows = lines.slice(1, 6).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
              obj[header.trim()] = values[index]?.trim() || '';
              return obj;
            }, {});
          }).filter(row => Object.values(row).some(val => val !== ''));

          setPreviewData(dataRows);
          setValidationResult({
            valid: true,
            errors: [],
            warnings: [],
            totalRows: lines.length - 1,
            validRows: lines.length - 1
          });
        }
      };
      reader.readAsText(file);

    } catch (error) {
      console.error('Error validating file:', error);
      setValidationResult({
        valid: false,
        errors: ['Gagal memvalidasi file'],
        warnings: [],
        totalRows: 0,
        validRows: 0
      });
    } finally {
      setValidating(false);
    }
  };

  const handleImport = async () => {
    if (!file || !validationResult?.valid) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Berhasil mengimport ${validationResult.validRows} data harga pasar`);
      onSuccess();
      resetState();
    } catch (error) {
      console.error('Error importing file:', error);
      toast.error('Gagal mengimport data');
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Import Data Harga Pasar
          </h2>
          <button
            onClick={() => {
              onClose();
              resetState();
            }}
            disabled={importing}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Download Template */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                1
              </div>
              <h3 className="text-lg font-medium text-gray-900">Download Template</h3>
            </div>
            <p className="text-gray-600 mb-4 ml-11">
              Download template Excel/CSV untuk memastikan format data yang benar.
            </p>
            <div className="ml-11">
              <button
                onClick={downloadTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template CSV
              </button>
            </div>
          </div>

          {/* Template Info */}
          <div className="mb-6 ml-11 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Format Template:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>commodity_id:</strong> ID komoditas (required) - Lihat dari daftar komoditas</p>
              <p><strong>commodity_source:</strong> Sumber komoditas (custom/national) - Default: custom</p>
              <p><strong>market_name:</strong> Nama pasar (required) - Contoh: Pasar Minggu</p>
              <p><strong>market_location:</strong> Lokasi pasar (optional) - Contoh: Jakarta Selatan</p>
              <p><strong>price:</strong> Harga (required) - Contoh: 15000</p>
              <p><strong>date:</strong> Tanggal (required) - Format: YYYY-MM-DD</p>
              <p><strong>quality_grade:</strong> Kualitas (optional) - premium/standard/economy</p>
              <p><strong>notes:</strong> Catatan (optional)</p>
            </div>
          </div>

          {/* Step 2: Upload File */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                2
              </div>
              <h3 className="text-lg font-medium text-gray-900">Upload File</h3>
            </div>
            <p className="text-gray-600 mb-4 ml-11">
              Upload file Excel atau CSV yang sudah diisi sesuai template.
            </p>
            
            <div className="ml-11">
              {!file ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    Pilih file atau drag & drop
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    Mendukung format: Excel (.xlsx, .xls) dan CSV
                  </div>
                  <div className="text-xs text-gray-400">
                    Maksimal ukuran file: 10MB
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{file.name}</div>
                        <div className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Validate Button */}
                  {!validationResult && (
                    <div className="mt-4 pt-4 border-t">
                      <button
                        onClick={validateFile}
                        disabled={validating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                      >
                        {validating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Memvalidasi...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Validasi File
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Validation Results */}
          {validationResult && (
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                  validationResult.valid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  3
                </div>
                <h3 className="text-lg font-medium text-gray-900">Hasil Validasi</h3>
              </div>

              <div className="ml-11 space-y-4">
                {/* Validation Summary */}
                <div className={`p-4 rounded-lg border ${
                  validationResult.valid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center mb-2">
                    {validationResult.valid ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <span className={`font-medium ${
                      validationResult.valid ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {validationResult.valid ? 'File Valid' : 'File Tidak Valid'}
                    </span>
                  </div>
                  <div className={`text-sm ${
                    validationResult.valid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Total baris: {validationResult.totalRows} | 
                    Valid: {validationResult.validRows}
                  </div>
                </div>

                {/* Errors */}
                {validationResult.errors.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">Error:</h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-600 mr-2">•</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {validationResult.warnings.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Peringatan:</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-600 mr-2">•</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Preview Data */}
                {validationResult.valid && previewData.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Preview Data (5 baris pertama):</h4>
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {showPreview ? 'Sembunyikan' : 'Tampilkan'} Preview
                      </button>
                    </div>

                    {showPreview && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Komoditas ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Pasar</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lokasi</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kualitas</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {previewData.map((row, index) => (
                                <tr key={index}>
                                  <td className="px-3 py-2 text-sm text-gray-900">{row.commodity_id || '-'}</td>
                                  <td className="px-3 py-2 text-sm text-gray-900">{row.market_name || '-'}</td>
                                  <td className="px-3 py-2 text-sm text-gray-500">{row.market_location || '-'}</td>
                                  <td className="px-3 py-2 text-sm text-gray-900">Rp {row.price || '-'}</td>
                                  <td className="px-3 py-2 text-sm text-gray-500">{row.date || '-'}</td>
                                  <td className="px-3 py-2 text-sm text-gray-500">{row.quality_grade || 'standard'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => {
                onClose();
                resetState();
              }}
              disabled={importing}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            
            {validationResult?.valid && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengimport...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data ({validationResult.validRows} baris)
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportMarketPriceModal;