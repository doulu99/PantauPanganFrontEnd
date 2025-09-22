// src/pages/MarketPricesPage.jsx
import React, { useState } from "react";
import { Plus, Upload, BarChart3, FileText } from "lucide-react";
import MarketPriceList from "../components/MarketPriceList";
import MarketPriceForm from "../components/MarketPriceForm";
import CsvImportExport from "../components/CsvImportExport";
import Statistics from "../components/Statistics";
import { useAuth } from "../context/AuthContext";

const MarketPricesPage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();

  const canManageData = user && (user.role === "admin" || user.role === "editor");

  const navigationItems = [
    { key: 'list', label: 'Data List', icon: FileText },
    { key: 'add', label: 'Add Data', icon: Plus, requireAuth: true },
    { key: 'import', label: 'Import CSV', icon: Upload, requireAuth: true },
    { key: 'statistics', label: 'Statistics', icon: BarChart3 }
  ];

  const handleShowAddForm = () => {
    setEditingId(null);
    setShowForm(true);
    setActiveTab('add');
  };

  const handleShowEditForm = (id) => {
    setEditingId(id);
    setShowForm(true);
    setActiveTab('add');
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingId(null);
    setActiveTab('list');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setActiveTab('list');
  };

  const handleImportSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTabClick = (tabKey) => {
    if (tabKey === 'add' && !showForm) {
      handleShowAddForm();
    } else {
      setActiveTab(tabKey);
      if (tabKey !== 'add') {
        setShowForm(false);
        setEditingId(null);
      }
    }
  };

  const renderContent = () => {
    if (showForm || activeTab === 'add') {
      return (
        <MarketPriceForm
          priceId={editingId}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      );
    }

    switch (activeTab) {
      case 'list':
        return (
          <MarketPriceList
            onEdit={canManageData ? handleShowEditForm : null}
            canManage={canManageData}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'import':
        return <CsvImportExport onSuccess={handleImportSuccess} />;
      case 'statistics':
        return <Statistics />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Market Price Management
            </h1>
            {canManageData && (
              <div className="flex space-x-3">
                <button
                  onClick={handleShowAddForm}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Data
                </button>
                <button
                  onClick={() => setActiveTab('import')}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {navigationItems
              .filter(item => !item.requireAuth || canManageData)
              .map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleTabClick(key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === key || (key === 'add' && showForm)
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {label}
                </button>
              ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default MarketPricesPage;