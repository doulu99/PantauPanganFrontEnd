// ==========================================
// 4. src/components/SembakoImport.jsx
// ==========================================
import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { sembakoApi } from '../services/sembakoApi';

const SembakoImport = ({ onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Please select a CSV file');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setImporting(true);
      const response = await sembakoApi.importCSV(file);
      setResult(response.data);
      
      if (response.data.success && onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      console.error('Import error:', error);
      setResult({
        success: false,
        message: error.response?.data?.message || 'Import gagal',
        data: { error_count: 1, errors: [error.message] }
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Timestamp,Province ID,Nama Pasar,Tanggal,Harga Beras,Harga Gula,Harga Minyak,Harga Daging,Harga Ayam,Harga Telur,Harga Bawang Merah,Harga Bawang Putih,Harga Gas,Harga Garam,Harga Susu
9/24/2025 10:30:00,Jakarta,Pasar Mayestik,9/24/2025,11500,9500,14000,140000,28000,32000,48000,45000,18500,1400,6500
9/24/2025 10:30:45,Jawa Barat,Pasar Bogor,9/24/2025,10800,8500,13500,130000,29000,31000,52000,48000,18000,1350,6800`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-sembako.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Import Data CSV
        </h3>

        {/* Template Download */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">📋 Format CSV</h4>
          <p className="text-sm text-blue-700 mb-3">
            Download template CSV untuk memastikan format data yang benar
          </p>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Download Template
          </button>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih File CSV
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-green-600">
              ✓ File selected: {file.name}
            </p>
          )}
        </div>

        {/* Import Button */}
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className={`px-6 py-2 rounded-lg flex items-center ${
              !file || importing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {importing ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </>
            )}
          </button>
          
          {result && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Lihat Detail
            </button>
          )}
        </div>

        {/* Quick Result */}
        {result && (
          <div className={`mt-4 p-4 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              )}
              <span className={`font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </span>
            </div>
            {result.data && (
              <div className="mt-2 text-sm">
                <span className="text-green-600">✓ Berhasil: {result.data.success_count || 0}</span>
                {result.data.error_count > 0 && (
                  <span className="ml-4 text-red-600">✗ Gagal: {result.data.error_count}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">Detail Import</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <div className="mb-4">
                <p className={`font-medium ${
                  result.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.message}
                </p>
              </div>

              {result.data && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-600">Data Berhasil</p>
                      <p className="text-xl font-bold text-green-800">
                        {result.data.success_count || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-600">Data Gagal</p>
                      <p className="text-xl font-bold text-red-800">
                        {result.data.error_count || 0}
                      </p>
                    </div>
                  </div>

                  {result.data.errors && result.data.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Error Details:</h4>
                      <div className="bg-red-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                        {result.data.errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-700 mb-1">
                            {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SembakoImport;