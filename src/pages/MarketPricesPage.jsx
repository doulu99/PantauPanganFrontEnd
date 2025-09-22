// src/pages/MarketPricePage.jsx
import React, { useState, useEffect } from "react";
import { 
  Plus, Database, BarChart3, FileText, Settings, 
  Sparkles, Activity, Package, TrendingUp 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MarketPriceList from "../components/MarketPriceList";
import MarketPriceForm from "../components/MarketPriceForm";
import CsvImportExport from "../components/CsvImportExport";
import Statistics from "../components/Statistics";

const MarketPricePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [editingPrice, setEditingPrice] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Permission check - simple role-based access
  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const handleAddNew = () => {
    setEditingPrice(null);
    setActiveTab('form');
  };

  const handleEdit = (price) => {
    setEditingPrice(price);
    setActiveTab('form');
  };

  const handleFormSuccess = () => {
    setActiveTab('list');
    setEditingPrice(null);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  const handleFormCancel = () => {
    setActiveTab('list');
    setEditingPrice(null);
  };

  const handleImportSuccess = () => {
    setRefreshTrigger(prev => prev + 1); // Trigger refresh after import
  };

  const tabs = [
    {
      id: 'list',
      label: 'Price List',
      icon: Package,
      description: 'View and manage all market prices'
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: BarChart3,
      description: 'Market price analytics and insights'
    },
    {
      id: 'import-export',
      label: 'Data Management',
      icon: Database,
      description: 'Import and export CSV data'
    }
  ];

  // Add form tab when editing or adding
  const allTabs = activeTab === 'form' 
    ? [
        {
          id: 'form',
          label: editingPrice ? 'Edit Price' : 'Add New Price',
          icon: editingPrice ? Settings : Plus,
          description: editingPrice ? 'Update existing price' : 'Create new market price'
        },
        ...tabs
      ]
    : tabs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-3xl mr-6 shadow-lg">
                <Activity className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-800 mb-2">
                  Market Price Management
                </h1>
                <p className="text-xl text-gray-600">
                  Monitor, manage, and analyze food market prices across Indonesia
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Live</div>
                <div className="text-sm text-gray-500">Data Status</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">34</div>
                <div className="text-sm text-gray-500">Provinces</div>
              </div>
            </div>
          </div>

          {/* User Welcome */}
          {user && (
            <div className="mt-6 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600">Welcome back,</p>
                    <p className="text-lg font-bold text-gray-800">{user.name || 'User'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    canManage 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role?.toUpperCase() || 'USER'}
                  </span>
                  {canManage && (
                    <button
                      onClick={handleAddNew}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-xl hover:from-blue-600 hover:to-emerald-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add New Price
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-2">
            <div className="flex flex-wrap gap-2">
              {allTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-bold">{tab.label}</div>
                    <div className={`text-xs ${
                      activeTab === tab.id ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {tab.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-500">
          {activeTab === 'list' && (
            <div className="animate-fade-in">
              <MarketPriceList
                onEdit={canManage ? handleEdit : undefined}
                canManage={canManage}
                refreshTrigger={refreshTrigger}
              />
            </div>
          )}

          {activeTab === 'form' && (
            <div className="animate-fade-in">
              <MarketPriceForm
                priceId={editingPrice?.id}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="animate-fade-in">
              <Statistics />
            </div>
          )}

          {activeTab === 'import-export' && (
            <div className="animate-fade-in">
              {canManage ? (
                <CsvImportExport onSuccess={handleImportSuccess} />
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h3>
                  <p className="text-gray-600 text-lg mb-6">
                    Data import and export features are available only to administrators and managers.
                  </p>
                  <div className="inline-flex items-center px-6 py-3 bg-orange-100 text-orange-800 rounded-xl font-semibold">
                    <Settings className="h-5 w-5 mr-2" />
                    Contact admin for access
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-16 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Sparkles className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="font-semibold text-gray-800">Pantau Pangan Management System</p>
                <p className="text-gray-600 text-sm">Real-time market price monitoring platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                System Online
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-emerald-600" />
                Data Updated
              </div>
              <div className="text-gray-500">
                © 2025 Pantau Pangan Indonesia
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MarketPricePage;