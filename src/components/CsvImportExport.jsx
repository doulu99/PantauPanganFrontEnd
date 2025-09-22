// src/components/CsvImportExport.jsx
import React, { useState } from "react";
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:5000";

const CsvImportExport = ({ onSuccess }) => {
  const { token } = useAuth();

  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    } else {
      alert("Please select a valid CSV file");
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      alert("Please select a CSV file first!");
      return;
    }
    if (!token) {
      alert("Anda belum login atau token tidak ditemukan");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", csvFile);

      const res = await fetch(`${API_BASE}/api/market-prices/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setImportResult(data.data);
        setShowModal(true);
        setCsvFile(null);
        if (onSuccess) onSuccess();
      } else {
        alert(`Import failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "product_name",
      "price",
      "unit",
      "market_type",
      "market_name",
      "province_id",
      "grade",
      "effective_date",
      "status",
    ];

    const sampleData = [
      "Beras Premium",
      "12000",
      "kg",
      "Pasar Tradisional",
      "Pasar Minggu",
      "31",
      "Premium",
      "2025-01-15",
      "published",
    ];

    const csvContent = [headers.join(","), sampleData.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "market_prices_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const closeModal = () => {
    setShowModal(false);
    setImportResult(null);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Upload className="w-5 h-5 mr-2" />
        CSV Import/Export
      </h2>

      {/* Template Download Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              CSV Template
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Download the CSV template to ensure proper format for importing
              data.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm bg-white text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </button>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <form onSubmit={handleImport} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  CSV files only (MAX. 10MB)
                </p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {csvFile && (
            <p className="mt-2 text-sm text-green-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              File selected: {csvFile.name}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!csvFile || loading}
            className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4 mr-2" />
            {loading ? "Importing..." : "Import Data"}
          </button>
        </div>
      </form>

      {/* Import Result Modal */}
      {showModal && importResult && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              onClick={closeModal}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Import Results
                    </h3>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {importResult.success_count}
                    </div>
                    <div className="text-sm text-green-700">
                      Successfully imported
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {importResult.error_count}
                    </div>
                    <div className="text-sm text-red-700">Failed to import</div>
                  </div>
                </div>

                {importResult.error_count > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Error Details:
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-32 overflow-y-auto">
                      <ul className="text-sm text-red-700 space-y-1">
                        {importResult.errors &&
                          importResult.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={closeModal}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
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
