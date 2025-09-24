// ==========================================
// src/components/public/StatsSection.jsx
// ==========================================
import React from 'react';

const StatsSection = ({ sembakoStats, bpnData, comparisonData }) => {
  const stats = [
    {
      value: (sembakoStats?.summary?.total_records || 0).toLocaleString('id-ID'),
      suffix: '+',
      label: 'Data Points Internal',
      sublabel: 'Sembako tracking records',
      color: 'blue'
    },
    {
      value: (bpnData?.count || bpnData?.data?.length || 0),
      suffix: '+',
      label: 'Komoditas BPN',
      sublabel: 'Official government prices',
      color: 'orange'
    },
    {
      value: (comparisonData?.length || 0),
      suffix: '',
      label: 'Comparisons',
      sublabel: 'Multi-source analysis',
      color: 'emerald'
    },
    {
      value: '24/7',
      suffix: '',
      label: 'Monitoring',
      sublabel: 'Real-time updates',
      color: 'purple'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">Statistik Platform</h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Data komprehensif dari berbagai sumber untuk memberikan gambaran lengkap pasar sembako Indonesia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ stat }) => {
  const { value, suffix, label, sublabel, color } = stat;
  
  return (
    <div className="text-center">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
        <div className={`text-4xl font-bold text-${color}-300 mb-2`}>
          {value}{suffix}
        </div>
        <div className={`text-${color}-100 font-medium mb-1`}>{label}</div>
        <div className={`text-${color}-200 text-sm`}>{sublabel}</div>
      </div>
    </div>
  );
};

export default StatsSection;