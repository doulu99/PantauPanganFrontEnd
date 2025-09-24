// ==========================================
// src/pages/PublicHomePage.jsx - CLEAN REFACTORED VERSION
// ==========================================
import React, { useState, useEffect } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { sembakoApi } from "../services/sembakoApi";

// Import components
import HeroSection from "../components/public/HeroSection";
import TabNavigation from "../components/public/TabNavigation";
import InternalDataTab from "../components/public/InternalDataTab";
import BPNDataTab from "../components/public/BPNDataTab";
import ComparisonTab from "../components/public/ComparisonTab";
import FeaturesSection from "../components/public/FeaturesSection";
import StatsSection from "../components/public/StatsSection";
import RefreshSection from "../components/public/RefreshSection";
import Footer from "../components/public/Footer";

// Import hooks and utils
import { useBPNData } from "../hooks/useBPNData";
import { commoditiesConfig } from "../config/commodities";

const PublicHomePage = () => {
  // States
  const [sembakoStats, setSembakoStats] = useState(null);
  const [latestSembakoData, setLatestSembakoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('internal');

  // Custom hook for BPN data
  const {
    bpnData,
    comparisonData,
    bpnHealth,
    loading: bpnLoading,
    error: bpnError,
    refetch: refetchBPN
  } = useBPNData();

  // Auto-refresh interval
  useEffect(() => {
    fetchInternalData();
    const interval = setInterval(fetchInternalData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch internal data
  const fetchInternalData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, latestResponse] = await Promise.all([
        sembakoApi.getPublicStatistics(),
        sembakoApi.getPublicLatest()
      ]);

      setSembakoStats(statsResponse.data.data);
      setLatestSembakoData(latestResponse.data.data.slice(0, 6) || []);
    } catch (err) {
      console.error('Error fetching internal data:', err);
      setError('Gagal memuat data internal');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh all data
  const handleRefreshAll = async () => {
    await Promise.all([
      fetchInternalData(),
      refetchBPN()
    ]);
  };

  // Render loading state
  if (loading && !sembakoStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 text-lg">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <HeroSection 
        sembakoStats={sembakoStats}
        bpnData={bpnData}
        comparisonData={comparisonData}
        bpnHealth={bpnHealth}
      />

      <TabNavigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bpnData={bpnData}
        comparisonData={comparisonData}
      />

      <div className="container mx-auto px-4 pb-16">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <h3 className="font-semibold text-red-800">Terjadi Kesalahan</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Contents */}
        {activeTab === 'internal' && (
          <InternalDataTab
            latestSembakoData={latestSembakoData}
            commoditiesConfig={commoditiesConfig}
            loading={loading}
            onRefresh={fetchInternalData}
          />
        )}

        {activeTab === 'bpn' && (
          <BPNDataTab
            bpnData={bpnData}
            bpnHealth={bpnHealth}
            loading={bpnLoading}
            onRefresh={refetchBPN}
          />
        )}

        {activeTab === 'comparison' && (
          <ComparisonTab
            comparisonData={comparisonData}
            loading={bpnLoading}
            onRefresh={refetchBPN}
          />
        )}
      </div>

      <FeaturesSection />
      <StatsSection 
        sembakoStats={sembakoStats}
        bpnData={bpnData}
        comparisonData={comparisonData}
      />
      <RefreshSection onRefresh={handleRefreshAll} loading={loading || bpnLoading} />
      <Footer />
    </div>
  );
};

export default PublicHomePage;