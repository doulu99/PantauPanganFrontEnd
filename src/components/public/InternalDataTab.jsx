// ==========================================
// src/components/public/InternalDataTab.jsx
// ==========================================
import React from 'react';
import { RefreshCw, Database } from 'lucide-react';
import { CommodityCard } from './CommodityCard';

const InternalDataTab = ({ latestSembakoData, commoditiesConfig, loading, onRefresh }) => {
  if (!loading && latestSembakoData.length === 0) {
    return (
      <div className="text-center py-16">
        <Database className="w-24 h-24 mx-auto mb-6 text-gray-300" />
        <h3 className="text-2xl font-semibold text-gray-600 mb-4">Tidak Ada Data Internal</h3>
        <p className="text-gray-500 mb-6">Belum ada data harga sembako yang tersedia dalam sistem internal.</p>
        <button 
          onClick={onRefresh}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
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
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Data Harga Internal</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Data harga sembako terbaru dari sistem monitoring internal kami
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(commoditiesConfig).map(([key, commodity]) => {
          const latestData = latestSembakoData[0];
          const price = latestData?.[key];
          
          return (
            <CommodityCard
              key={key}
              commodityKey={key}
              commodity={commodity}
              price={price}
              latestData={latestData}
            />
          );
        })}
      </div>
    </div>
  );
};

export default InternalDataTab;