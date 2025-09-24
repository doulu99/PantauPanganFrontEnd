// ==========================================
// src/components/public/ComparisonTab.jsx
// ==========================================
import React from 'react';
import { RefreshCw, Scale } from 'lucide-react';
import { ComparisonCard } from './CommodityCard';

const ComparisonTab = ({ comparisonData, loading, onRefresh }) => {
  if (!loading && !comparisonData) {
    return (
      <div className="text-center py-16">
        <Scale className="w-24 h-24 mx-auto mb-6 text-gray-300" />
        <h3 className="text-2xl font-semibold text-gray-600 mb-4">Perbandingan Tidak Tersedia</h3>
        <p className="text-gray-500 mb-6">Data perbandingan memerlukan data internal dan BPN yang tersedia.</p>
        <button 
          onClick={onRefresh}
          className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Refresh Data
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Perbandingan Harga Multi-Source</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Perbandingan langsung antara data internal sistem kami dengan data resmi BPN
        </p>
        
        <ComparisonSummary comparisonData={comparisonData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {comparisonData.map((item, index) => (
          <ComparisonCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

const ComparisonSummary = ({ comparisonData }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
    <div className="bg-red-50 rounded-xl p-4">
      <div className="text-2xl font-bold text-red-600">
        {comparisonData.filter(item => item.trend === 'higher').length}
      </div>
      <div className="text-sm text-red-700">Lebih Tinggi dari BPN</div>
    </div>
    <div className="bg-green-50 rounded-xl p-4">
      <div className="text-2xl font-bold text-green-600">
        {comparisonData.filter(item => item.trend === 'lower').length}
      </div>
      <div className="text-sm text-green-700">Lebih Rendah dari BPN</div>
    </div>
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-2xl font-bold text-gray-600">
        {comparisonData.filter(item => item.trend === 'same').length}
      </div>
      <div className="text-sm text-gray-700">Harga Mirip</div>
    </div>
  </div>
);

export default ComparisonTab;