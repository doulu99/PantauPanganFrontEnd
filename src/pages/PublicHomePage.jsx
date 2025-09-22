// src/pages/PublicHomePage.jsx
import React, { useState, useEffect } from "react";
import { 
  Search, TrendingUp, TrendingDown, MapPin, Calendar, Star, 
  Activity, BarChart3, Globe, Sparkles, Award, Shield,
  Clock, Users, CheckCircle
} from "lucide-react";
import config from "../config/config.js";

const PublicHomePage = () => {
  const [bpnData, setBpnData] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBpnData, setFilteredBpnData] = useState([]);
  const [filteredMarketData, setFilteredMarketData] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  // ✅ Fetch BPN data
  const fetchBPNData = async () => {
    try {
      const response = await fetch(`${config.API_URL}/bpn/public/bpn-prices`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setBpnData(data.data);
      }
    } catch (error) {
      console.error("Error fetching BPN:", error);
      setBpnData([]);
    }
  };

  // ✅ Fetch Market data
  const fetchMarketData = async () => {
    try {
      const response = await fetch(`${config.PUBLIC_API_URL}/market-prices?limit=50`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setMarketData(data.data);
      }
    } catch (error) {
      console.error("Error fetching Market:", error);
      setMarketData([]);
    }
  };

  // ✅ Filter data
  const filterData = () => {
    if (!searchTerm.trim()) {
      setFilteredBpnData(bpnData);
      setFilteredMarketData(marketData);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    
    setFilteredBpnData(
      bpnData.filter((item) => 
        item.name?.toLowerCase().includes(searchLower)
      )
    );
    
    setFilteredMarketData(
      marketData.filter((item) =>
        item.product_name?.toLowerCase().includes(searchLower) ||
        item.market_type?.toLowerCase().includes(searchLower) ||
        item.grade?.toLowerCase().includes(searchLower) ||
        item.market_name?.toLowerCase().includes(searchLower) ||
        item.province?.province_name?.toLowerCase().includes(searchLower)
      )
    );
  };

  // ✅ Formatters
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  const formatShortDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    }) : "-";

  // Get filtered data based on tab
  const getFilteredData = () => {
    switch(activeTab) {
      case 'bpn':
        return { bpn: filteredBpnData, market: [] };
      case 'market':
        return { bpn: [], market: filteredMarketData };
      default:
        return { bpn: filteredBpnData, market: filteredMarketData };
    }
  };

  // ✅ Hooks
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchBPNData(), fetchMarketData()]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, bpnData, marketData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-emerald-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-blue-200 border-t-blue-600 shadow-xl"></div>
          <div className="absolute inset-0 rounded-full h-24 w-24 border-4 border-transparent border-r-emerald-600 animate-pulse"></div>
        </div>
        <div className="mt-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            <Sparkles className="inline h-6 w-6 mr-2 text-blue-600" />
            Memuat Data Harga Pangan
          </h3>
          <p className="text-gray-600 text-lg">Mengambil informasi terkini dari seluruh Indonesia...</p>
          <div className="flex justify-center mt-6 space-x-2">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full animate-bounce"
                style={{animationDelay: `${i * 200}ms`}}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { bpn: displayBpnData, market: displayMarketData } = getFilteredData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-emerald-600 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-emerald-200 rounded-full mix-blend-overlay filter blur-xl animate-pulse" style={{animationDelay: '2s', animationDuration: '6s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-200 rounded-full mix-blend-overlay filter blur-xl animate-pulse" style={{animationDelay: '1s', animationDuration: '5s'}}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div>
            {/* Header Badge */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-8 py-4 mb-8 hover:bg-white/15 transition-colors">
              <Activity className="h-6 w-6 mr-3 text-emerald-300" />
              <span className="text-lg font-semibold">Real-time Food Price Monitor</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-sm">
                Pantau Pangan
              </span>
              <span className="block bg-gradient-to-r from-emerald-300 via-green-300 to-yellow-300 bg-clip-text text-transparent">
                Indonesia
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-3xl mb-8 opacity-95 max-w-5xl mx-auto leading-relaxed font-light">
              Platform monitoring harga pangan nasional yang 
              <span className="block mt-2 font-semibold text-emerald-200">
                🔍 Transparan • ⚡ Real-time • 🛡️ Terpercaya
              </span>
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-5xl mx-auto relative group mb-12">
              <div className="relative bg-white/98 backdrop-blur-lg rounded-3xl shadow-2xl p-8 transition-all duration-500 hover:shadow-3xl hover:bg-white group-hover:scale-105">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 p-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl shadow-lg">
                    <Search className="h-7 w-7 text-white" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari produk pangan, pasar, atau provinsi di seluruh Indonesia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-6 py-4 text-gray-800 border-0 focus:outline-none bg-transparent text-xl placeholder-gray-500 font-medium"
                  />
                  <button 
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:from-blue-600 hover:to-emerald-600 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Search className="inline h-5 w-5 mr-2" />
                    Cari
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Display */}
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl px-8 py-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-bold text-emerald-300 mb-1">{filteredBpnData.length}</div>
                <div className="text-emerald-100 font-medium">Data BPN Resmi</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl px-8 py-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-bold text-blue-300 mb-1">{filteredMarketData.length}</div>
                <div className="text-blue-100 font-medium">Data Pasar Lokal</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl px-8 py-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-bold text-yellow-300 mb-1">34</div>
                <div className="text-yellow-100 font-medium">Provinsi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="container mx-auto px-4 py-16 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="h-8 w-8 text-white" />
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-4 py-2 rounded-full">
                RESMI
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Data BPN Official</h3>
            <p className="text-gray-600 leading-relaxed">
              Informasi harga pangan langsung dari Badan Pangan Nasional yang update setiap hari
            </p>
          </div>

          <div className="group bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <span className="bg-blue-100 text-blue-700 text-sm font-bold px-4 py-2 rounded-full">
                LOKAL
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Pasar Tradisional</h3>
            <p className="text-gray-600 leading-relaxed">
              Harga real dari pasar-pasar tradisional dan modern di seluruh Indonesia
            </p>
          </div>

          <div className="group bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <span className="bg-purple-100 text-purple-700 text-sm font-bold px-4 py-2 rounded-full">
                LIVE
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Update Real-time</h3>
            <p className="text-gray-600 leading-relaxed">
              Monitoring 24/7 dengan sistem yang selalu update informasi terbaru
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 pb-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/20">
            <div className="flex space-x-2">
              {[
                { id: 'all', label: 'Semua Data', icon: Globe },
                { id: 'bpn', label: 'Data BPN', icon: Award },
                { id: 'market', label: 'Pasar Lokal', icon: MapPin }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Display Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* BPN Data Section */}
          {(activeTab === 'all' || activeTab === 'bpn') && (
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20 hover:shadow-3xl transition-all duration-500">
              <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-bold mb-3">Harga Resmi BPN</h2>
                    <p className="text-emerald-100 text-xl">Data dari Badan Pangan Nasional</p>
                    <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-300 mr-2" />
                      <span className="text-sm font-medium">Terverifikasi Resmi</span>
                    </div>
                  </div>
                  <div className="p-6 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Award className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                {displayBpnData.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-green-200 rounded-full flex items-center justify-center">
                      <Search className="h-16 w-16 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">
                      {bpnData.length === 0 ? "Data BPN Tidak Tersedia" : "Tidak Ada Hasil Pencarian"}
                    </h3>
                    <p className="text-gray-500 text-lg">
                      {searchTerm && bpnData.length > 0 
                        ? `Tidak ditemukan hasil untuk "${searchTerm}"` 
                        : "Data sedang dimuat atau belum tersedia"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 text-center">
                      <p className="text-gray-600 text-lg">
                        <span className="font-semibold text-emerald-600">{displayBpnData.length}</span> dari{' '}
                        <span className="font-semibold">{bpnData.length}</span> komoditas
                      </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {displayBpnData.map((item, index) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:scale-105"
                        >
                          <div className="relative">
                            <div className="h-44 bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-6">
                              {item.background ? (
                                <img
                                  src={item.background}
                                  alt={item.name}
                                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-emerald-200 rounded-full flex items-center justify-center">
                                  <Star className="h-10 w-10 text-emerald-600" />
                                </div>
                              )}
                            </div>
                            <div className="absolute top-4 right-4">
                              <span className="bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                                BPN RESMI
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-6 space-y-4">
                            <h3 className="font-bold text-gray-900 text-xl group-hover:text-emerald-600 transition-colors">
                              {item.name}
                            </h3>
                            
                            <div className="space-y-3">
                              <div>
                                <div className="text-emerald-700 font-black text-3xl">
                                  {formatCurrency(item.today)}
                                </div>
                                <div className="text-gray-500 font-medium">
                                  per {item.satuan?.replace('Rp./','').replace('Rp/','') || 'unit'}
                                </div>
                              </div>
                              
                              {item.yesterday && (
                                <div className="bg-gray-50 p-4 rounded-xl">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600 font-medium">Kemarin</span>
                                    <span className="font-semibold">{formatCurrency(item.yesterday)}</span>
                                  </div>
                                </div>
                              )}
                              
                              {item.gap !== undefined && (
                                <div className="flex justify-center">
                                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold ${
                                    item.gap_change === "up" 
                                      ? "bg-red-50 text-red-700 border-2 border-red-200" 
                                      : "bg-green-50 text-green-700 border-2 border-green-200"
                                  }`}>
                                    {item.gap_change === "up" ? 
                                      <TrendingUp className="h-5 w-5" /> : 
                                      <TrendingDown className="h-5 w-5" />
                                    }
                                    <span>{formatCurrency(Math.abs(item.gap))} ({item.gap_percentage}%)</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Market Data Section */}
          {(activeTab === 'all' || activeTab === 'market') && (
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20 hover:shadow-3xl transition-all duration-500">
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-bold mb-3">Harga Pasar Lokal</h2>
                    <p className="text-blue-100 text-xl">Data dari pasar tradisional & modern</p>
                    <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-flex items-center">
                      <Users className="w-4 h-4 text-blue-300 mr-2" />
                      <span className="text-sm font-medium">Data Komunitas</span>
                    </div>
                  </div>
                  <div className="p-6 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <MapPin className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                {displayMarketData.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center">
                      <MapPin className="h-16 w-16 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">
                      {marketData.length === 0 ? "Data Pasar Tidak Tersedia" : "Tidak Ada Hasil Pencarian"}
                    </h3>
                    <p className="text-gray-500 text-lg">
                      {searchTerm && marketData.length > 0
                        ? `Tidak ditemukan hasil untuk "${searchTerm}"`
                        : "Data sedang dimuat atau belum tersedia"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 text-center">
                      <p className="text-gray-600 text-lg">
                        <span className="font-semibold text-blue-600">{displayMarketData.length}</span> dari{' '}
                        <span className="font-semibold">{marketData.length}</span> produk
                      </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {displayMarketData.map((item, index) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:scale-105"
                        >
                          <div className="relative">
                            <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                              {item.image_url ? (
                                <img
                                  src={`${config.API_BASE_URL}${item.image_url}`}
                                  alt={item.product_name}
                                  className="h-full w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center">
                                  <MapPin className="h-10 w-10 text-blue-600" />
                                </div>
                              )}
                            </div>
                            <div className="absolute top-4 right-4">
                              <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                                PASAR LOKAL
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-6 space-y-4">
                            <h3 className="font-bold text-gray-900 text-xl group-hover:text-blue-600 transition-colors">
                              {item.product_name || "Produk"}
                            </h3>
                            
                            <div>
                              <div className="text-blue-700 font-black text-3xl">
                                {formatCurrency(item.price)}
                              </div>
                              <div className="text-gray-500 font-medium">
                                per {item.unit} • {item.grade || "Grade Standard"}
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-xl">
                              <div className="flex items-center space-x-2 text-gray-700">
                                <MapPin className="h-4 w-4 flex-shrink-0 text-blue-500" />
                                <span className="font-medium text-sm">
                                  {item.market_name || "Pasar Umum"}, {item.province?.province_name || "Indonesia"}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
                                {item.market_type || "Pasar Tradisional"}
                              </span>
                              <div className="flex items-center space-x-1 px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">
                                <Calendar className="h-3 w-3" />
                                <span>{formatShortDate(item.effective_date || item.createdAt)}</span>
                              </div>
                              {item.status && (
                                <span className={`px-3 py-1 text-xs rounded-full font-bold ${
                                  item.status === 'published' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {item.status === 'published' ? 'AKTIF' : item.status.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '4s', animationDuration: '8s'}}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-8">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl mr-4 shadow-lg">
                  <Activity className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold">Pantau Pangan Indonesia</h3>
                  <p className="text-gray-400">Food Price Monitoring Platform</p>
                </div>
              </div>
              <p className="text-gray-300 text-xl leading-relaxed mb-8">
                Platform monitoring harga pangan terdepan yang menyediakan informasi real-time, 
                transparan, dan terpercaya untuk mendukung ketahanan pangan nasional dan 
                stabilitas ekonomi masyarakat Indonesia.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 flex items-center hover:bg-white/15 transition-colors">
                  <div className="w-4 h-4 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="font-medium">System Online</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 flex items-center hover:bg-white/15 transition-colors">
                  <Globe className="h-5 w-5 mr-3 text-blue-300" />
                  <span className="font-medium">34 Provinsi</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 flex items-center hover:bg-white/15 transition-colors">
                  <Shield className="h-5 w-5 mr-3 text-emerald-300" />
                  <span className="font-medium">Data Terverifikasi</span>
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div>
              <h4 className="text-2xl font-bold mb-8 flex items-center">
                <BarChart3 className="h-7 w-7 mr-3 text-emerald-400" />
                Sumber Data
              </h4>
              <ul className="space-y-5">
                {[
                  { name: "Badan Pangan Nasional (BPN)", color: "emerald", verified: true },
                  { name: "Pasar Tradisional", color: "blue" },
                  { name: "Pasar Modern & Supermarket", color: "purple" },
                  { name: "Pedagang Grosir", color: "orange" },
                  { name: "Platform E-commerce", color: "yellow" }
                ].map((source, index) => (
                  <li key={index} className="flex items-center text-gray-300 hover:text-white transition-colors group">
                    <div className={`w-3 h-3 bg-${source.color}-400 rounded-full mr-4 group-hover:scale-150 transition-transform shadow-lg`}></div>
                    <span className="font-medium">{source.name}</span>
                    {source.verified && (
                      <CheckCircle className="h-4 w-4 ml-2 text-green-400" />
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Info */}
            <div>
              <h4 className="text-2xl font-bold mb-8 flex items-center">
                <MapPin className="h-7 w-7 mr-3 text-blue-400" />
                Informasi
              </h4>
              <div className="space-y-5">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300 group">
                  <div className="text-sm text-gray-400 mb-2">Email Resmi</div>
                  <div className="text-white font-semibold text-lg group-hover:text-blue-300 transition-colors">
                    info@pantaupangan.id
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300 group">
                  <div className="text-sm text-gray-400 mb-2">Update Terakhir</div>
                  <div className="text-white font-semibold flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                    {formatDate(new Date())}
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300">
                  <div className="text-sm text-gray-400 mb-2">Server Location</div>
                  <div className="text-white font-semibold">Jakarta, Indonesia 🇮🇩</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-700 mt-20 pt-10">
            <div className="flex flex-col lg:flex-row justify-between items-center">
              <div className="text-center lg:text-left mb-6 lg:mb-0">
                <p className="text-gray-400 text-xl font-semibold mb-2">
                  © 2025 Portal Pantau Pangan Indonesia
                </p>
                <p className="text-gray-500 text-lg">
                  Seluruh hak cipta dilindungi. Data diperbaharui setiap hari untuk Indonesia yang lebih sejahtera.
                </p>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="text-center group hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <div className="text-3xl font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                    {filteredBpnData.length + filteredMarketData.length}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Total Data</div>
                </div>
                <div className="w-px h-16 bg-gray-700"></div>
                <div className="text-center group hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <div className="text-3xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">24/7</div>
                  <div className="text-sm text-gray-500 font-medium">Monitoring</div>
                </div>
                <div className="w-px h-16 bg-gray-700"></div>
                <div className="text-center group hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <div className="text-3xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors">99.9%</div>
                  <div className="text-sm text-gray-500 font-medium">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHomePage;