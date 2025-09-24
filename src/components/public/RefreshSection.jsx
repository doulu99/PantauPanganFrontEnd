// ==========================================
// src/components/public/RefreshSection.jsx
// ==========================================
import React from 'react';
import { RefreshCw } from 'lucide-react';

const RefreshSection = ({ onRefresh, loading }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">
            Data Selalu Terkini
          </h2>
          <p className="text-lg text-indigo-100 mb-6">
            Refresh data kapan saja untuk mendapatkan informasi harga terbaru dari semua sumber
          </p>
          
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-6 h-6 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Memuat Data...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefreshSection;