// ==========================================
// src/components/public/BPNDataTab.jsx
// ==========================================
import React from 'react';
import { RefreshCw, Shield, CheckCircle } from 'lucide-react';
import { BPNCard } from './CommodityCard';

const BPNDataTab = ({ bpnData, bpnHealth, loading, onRefresh }) => {
  if (!loading && !bpnData) {
    return (
      <div className="text-center py-16">
        <Shield className="w-24 h-24 mx-auto mb-6 text-gray-300" />
        <h3 className="text-2xl font-semibold text-gray-600 mb-4">Data BPN Tidak Tersedia</h3>
        <p className="text-gray-500 mb-6">Tidak dapat mengakses data dari Badan Pangan Nasional saat ini.</p>
        <button 
          onClick={onRefresh}
          className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Data Harga BPN Resmi</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Data harga resmi dari Badan Pangan Nasional Indonesia
        </p>
        {bpnHealth && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full">
            <CheckCircle className="w-4 h-4 mr-2" />
            Status: {bpnHealth.success ? 'Live Data' : 'Cached Data'}
            {bpnData?.source && (
              <span className="ml-2 text-xs bg-green-200 px-2 py-1 rounded">
                {bpnData.source === 'fresh' ? 'Fresh' : bpnData.source === 'cache' ? 'Cached' : 'Fallback'}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(bpnData?.data || []).map((item) => (
          <BPNCard key={item.id} item={item} />
        ))}
      </div>

      {/* BPN Data Summary */}
      {bpnData?.data && bpnData.data.length > 0 && (
        <BPNSummary data={bpnData.data} />
      )}
    </div>
  );
};

const BPNSummary = ({ data }) => (
  <div className="mt-12 bg-orange-50 rounded-2xl p-8">
    <div className="text-center">
      <h3 className="text-2xl font-bold text-orange-800 mb-4">Ringkasan Data BPN</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          value={data.length}
          label="Total Komoditas"
          color="orange"
        />
        <SummaryCard
          value={data.filter(item => (item.gap_change === 'down' || (item.gap || 0) < 0)).length}
          label="Harga Turun"
          color="green"
        />
        <SummaryCard
          value={data.filter(item => (item.gap_change === 'up' || (item.gap || 0) > 0)).length}
          label="Harga Naik"
          color="red"
        />
        <SummaryCard
          value={data.filter(item => Math.abs(item.gap || 0) < 50).length}
          label="Harga Stabil"
          color="gray"
        />
      </div>
    </div>
  </div>
);

const SummaryCard = ({ value, label, color }) => (
  <div className="bg-white rounded-xl p-4">
    <div className={`text-2xl font-bold text-${color}-600`}>
      {value}
    </div>
    <div className={`text-sm text-${color}-700`}>{label}</div>
  </div>
);

export default BPNDataTab;