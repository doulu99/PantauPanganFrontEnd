// src/components/CsvImportExport.jsx
import React, { useState } from "react";
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  File,
  Database,
  Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import config from "../config/config.js";

const CsvImportExport = ({ onSuccess }) => {
  const { token } = useAuth();

  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleFileSelect = (file) => {
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        setCsvFile(file);
        setError("");
      } else {
        setError("Please select a valid CSV file (.csv)");
        setCsvFile(null);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setError("Please select a CSV file first!");
      return;
    }
    if (!token) {
      setError("Authentication required. Please login first.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const form = new FormData();
      form.append("file", csvFile);

      const res = await fetch(`${config.API_URL}/market-prices/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setImportResult(data.data);
        setShowModal(true);
        setCsvFile(null);
        if (onSuccess) onSuccess();
      } else {
        setError(data.message || "Import failed. Please check your file format.");
      }
    } catch (error) {
      console.error("Import error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!token) {
      setError("Authentication required. Please login first.");
      return;
    }

    setExportLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${config.API_URL}/market-prices/export`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `market-prices-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      setError("Export failed. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await fetch(`${config.API_URL}/market-prices/template`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "market-prices-template.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Template download error:", error);
      setError("Template download failed. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl mr-4 shadow-lg">
          <Database className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">CSV Data Management</h2>
          <p className="text-gray-600">Import and export market price data efficiently</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-800">Error</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Import Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mr-4 shadow-md">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Import CSV Data</h3>
              <p className="text-gray-600 text-sm">Upload CSV file to import market prices</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Template Download */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-1">Need the correct format?</p>
                  <p className="text-blue-600 text-sm">Download our CSV template to ensure compatibility</p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 text-sm font-semibold shadow-md hover:shadow-lg"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Template
                </button>
              </div>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select CSV File
              </label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : csvFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    {csvFile ? (
                      <CheckCircle className="h-8 w-8 text-white" />
                    ) : (
                      <Upload className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      {csvFile ? (
                        <>
                          <span className="text-green-600">✓</span> {csvFile.name}
                        </>
                      ) : (
                        "Drop CSV file here or click to browse"
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {csvFile ? (
                        <>Size: {(csvFile.size / 1024).toFixed(2)} KB</>
                      ) : (
                        "Supports CSV files up to 10MB"
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              {csvFile && (
                <div className="mt-4 flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center">
                    <File className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-semibold text-green-800">{csvFile.name}</p>
                      <p className="text-green-600 text-sm">{(csvFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCsvFile(null)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Import Button */}
            <button
              onClick={handleImport}
              disabled={!csvFile || loading}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                !csvFile || loading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 mr-3" />
                  Import Data
                </>
              )}
            </button>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mr-4 shadow-md">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Export CSV Data</h3>
              <p className="text-gray-600 text-sm">Download all market prices as CSV</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Export Info */}
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <h4 className="font-semibold text-emerald-800 mb-2">Export includes:</h4>
                <ul className="text-emerald-700 text-sm space-y-1">
                  <li>• All published market prices</li>
                  <li>• Product names and categories</li>
                  <li>• Market information and locations</li>
                  <li>• Prices and effective dates</li>
                  <li>• Quality grades and units</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Database className="h-10 w-10 text-white" />
                </div>
                <h4 className="text-lg font-bold text-emerald-800 mb-2">Ready for Export</h4>
                <p className="text-emerald-600 text-sm mb-4">
                  Download all market price data in CSV format for analysis, backup, or integration with other systems.
                </p>
                <div className="text-xs text-emerald-500 bg-emerald-100 px-3 py-1 rounded-full inline-block">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  Updated in real-time
                </div>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                exportLoading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
            >
              {exportLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-6 w-6 mr-3" />
                  Export All Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Import Result Modal */}
      {showModal && importResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl mr-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Import Results</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Success Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {importResult.successful || 0}
                  </div>
                  <div className="text-green-700 text-sm font-semibold">Successfully Imported</div>
                </div>
                
                {importResult.failed > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">
                      {importResult.failed || 0}
                    </div>
                    <div className="text-red-700 text-sm font-semibold">Failed to Import</div>
                  </div>
                )}
              </div>

              {/* Error Details */}
              {importResult.errors && importResult.errors.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    Import Errors
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {importResult.errors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-sm text-red-700 bg-red-100 rounded-lg p-2">
                          <span className="font-semibold">Row {error.row}:</span> {error.message}
                        </div>
                      ))}
                      {importResult.errors.length > 10 && (
                        <div className="text-sm text-red-600 text-center py-2 border-t border-red-200">
                          ... and {importResult.errors.length - 10} more errors
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {importResult.successful > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-green-800 font-semibold">
                    🎉 Import completed successfully!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Your data has been added to the database
                  </p>
                </div>
              )}

              {/* Close Button */}
              <div className="text-center">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-2xl hover:from-blue-600 hover:to-emerald-600 font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvImportExport;