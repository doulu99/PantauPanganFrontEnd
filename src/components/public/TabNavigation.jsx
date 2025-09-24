// ==========================================
// src/components/public/TabNavigation.jsx - Complete Component
// ==========================================
import React from 'react';
import { Database, Shield, Scale } from 'lucide-react';

const TabNavigation = ({ activeTab, setActiveTab, bpnData, comparisonData }) => {
  const tabs = [
    {
      id: 'internal',
      label: 'Data Internal',
      subtitle: 'Sistem Kami',
      icon: Database,
      color: 'blue',
      disabled: false,
      description: 'Data harga dari sistem monitoring internal'
    },
    {
      id: 'bpn',
      label: 'Data BPN',
      subtitle: 'Resmi Pemerintah',
      icon: Shield,
      color: 'orange',
      disabled: !bpnData,
      description: 'Data resmi dari Badan Pangan Nasional'
    },
    {
      id: 'comparison',
      label: 'Perbandingan',
      subtitle: 'Multi-Source',
      icon: Scale,
      color: 'emerald',
      disabled: !comparisonData,
      description: 'Analisis perbandingan antar sumber data'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-2">
        <div className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-1">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
            />
          ))}
        </div>
        
        {/* Tab Info Bar */}
        <TabInfoBar tabs={tabs} activeTab={activeTab} bpnData={bpnData} comparisonData={comparisonData} />
      </div>
    </div>
  );
};

const TabButton = ({ tab, isActive, onClick }) => {
  const { icon: Icon, label, subtitle, color, disabled } = tab;
  
  // Define color classes for different states
  const colorClasses = {
    blue: {
      active: 'bg-blue-600 text-white shadow-lg transform scale-105',
      hover: 'hover:bg-blue-50 hover:text-blue-700'
    },
    orange: {
      active: 'bg-orange-600 text-white shadow-lg transform scale-105',
      hover: 'hover:bg-orange-50 hover:text-orange-700'
    },
    emerald: {
      active: 'bg-emerald-600 text-white shadow-lg transform scale-105',
      hover: 'hover:bg-emerald-50 hover:text-emerald-700'
    }
  };

  // Build className dynamically
  let className = "flex-1 px-4 md:px-6 py-4 rounded-xl font-semibold transition-all duration-300 relative group";
  
  if (disabled) {
    className += " opacity-50 cursor-not-allowed text-gray-400";
  } else if (isActive) {
    className += ` ${colorClasses[color].active}`;
  } else {
    className += ` text-gray-600 hover:bg-gray-100 ${colorClasses[color].hover}`;
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      title={disabled ? 'Data tidak tersedia' : `Switch to ${label}`}
    >
      <div className="flex items-center justify-center">
        <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
        <div className="text-left">
          <div className="text-sm md:text-base">{label}</div>
          <div className="text-xs opacity-75 hidden md:block">{subtitle}</div>
        </div>
      </div>
      
      {/* Status indicator */}
      {!disabled && (
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
          isActive ? 'bg-green-400' : 'bg-gray-300'
        } transition-colors duration-300`} />
      )}
      
      {/* Disabled overlay tooltip */}
      {disabled && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Data tidak tersedia
        </div>
      )}
    </button>
  );
};

const TabInfoBar = ({ tabs, activeTab, bpnData, comparisonData }) => {
  const activeTabConfig = tabs.find(tab => tab.id === activeTab);
  
  if (!activeTabConfig) return null;

  // Get data count for active tab
  const getDataCount = () => {
    switch (activeTab) {
      case 'internal':
        return 'Data tersedia';
      case 'bpn':
        return bpnData ? `${bpnData.count || bpnData.data?.length || 0} komoditas` : 'Tidak tersedia';
      case 'comparison':
        return comparisonData ? `${comparisonData.length} perbandingan` : 'Tidak tersedia';
      default:
        return '';
    }
  };

  // Get status indicator
  const getStatus = () => {
    switch (activeTab) {
      case 'internal':
        return { color: 'green', text: 'Aktif' };
      case 'bpn':
        return bpnData 
          ? { color: 'green', text: bpnData.source === 'fresh' ? 'Live' : 'Cache' }
          : { color: 'red', text: 'Error' };
      case 'comparison':
        return comparisonData 
          ? { color: 'green', text: 'Tersedia' }
          : { color: 'gray', text: 'Menunggu data' };
      default:
        return { color: 'gray', text: '' };
    }
  };

  const status = getStatus();

  return (
    <div className="mt-3 px-4 py-2 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-3">
          <activeTabConfig.icon className="w-4 h-4 text-gray-600" />
          <span className="text-gray-700 font-medium">{activeTabConfig.description}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">{getDataCount()}</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full bg-${status.color}-500`} />
            <span className={`text-${status.color}-600 font-medium`}>{status.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export additional utility functions if needed
export const getTabConfig = (tabId) => {
  const configs = {
    internal: {
      id: 'internal',
      label: 'Data Internal',
      subtitle: 'Sistem Kami',
      icon: Database,
      color: 'blue'
    },
    bpn: {
      id: 'bpn',
      label: 'Data BPN',
      subtitle: 'Resmi Pemerintah', 
      icon: Shield,
      color: 'orange'
    },
    comparison: {
      id: 'comparison',
      label: 'Perbandingan',
      subtitle: 'Multi-Source',
      icon: Scale,
      color: 'emerald'
    }
  };
  
  return configs[tabId] || null;
};

export default TabNavigation;