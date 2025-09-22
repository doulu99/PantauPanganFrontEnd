import React, { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, MapPin, Calendar, Star } from "lucide-react";

const PublicHomePage = () => {
  const [bpnData, setBpnData] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBpnData, setFilteredBpnData] = useState([]);
  const [filteredMarketData, setFilteredMarketData] = useState([]);

  // ✅ Fetch BPN data
  const fetchBPNData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/bpn/public/bpn-prices");
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
      const response = await fetch("http://localhost:5000/public/market-prices?limit=20");
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setMarketData(data.data);
      }
    } catch (error) {
      console.error("Error fetching Market:", error);
      setMarketData([]);
    }
  };

  // ✅ Filter data dengan search (produk, pasar, provinsi)
  const filterData = () => {
    if (!searchTerm.trim()) {
      setFilteredBpnData(bpnData);
      setFilteredMarketData(marketData);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    setFilteredBpnData(
      bpnData.filter((item) => item.name?.toLowerCase().includes(searchLower))
    );
    setFilteredMarketData(
      marketData.filter(
        (item) =>
          item.product_name?.toLowerCase().includes(searchLower) ||
          item.market_type?.toLowerCase().includes(searchLower) ||
          item.grade?.toLowerCase().includes(searchLower) ||
          item.province?.province_name?.toLowerCase().includes(searchLower) ||
          item.market_name?.toLowerCase().includes(searchLower)
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-green-600 animate-pulse"></div>
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Memuat data harga pangan...</h3>
          <p className="text-sm text-gray-500">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Hero Section with Animation */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Portal Harga Pangan
              <span className="block text-yellow-300">Nasional</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
              Informasi harga pangan terbaru, transparan, dan terpercaya dari seluruh Indonesia
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 transition-all duration-300 hover:shadow-3xl hover:bg-white">
                <div className="flex items-center">
                  <Search className="h-6 w-6 text-gray-400 ml-2" />
                  <input
                    type="text"
                    placeholder="Cari produk, pasar, atau provinsi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-3 text-gray-800 border-0 focus:outline-none bg-transparent text-lg placeholder-gray-400"
                  />
                  <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-blue-600 hover:to-green-600 hover:scale-105">
                    Cari
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics */}
      <div className="container mx-auto px-4 py-12 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl">
                <Star className="h-6 w-6 text-white" />
              </div>
              <span className="text-green-600 text-sm font-semibold bg-green-50 px-3 py-1 rounded-full">BPN</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Data Resmi BPN</h3>
            <p className="text-3xl font-bold text-green-600 mb-1">{filteredBpnData.length}</p>
            <p className="text-xs text-gray-500">Komoditas tersedia</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <span className="text-blue-600 text-sm font-semibold bg-blue-50 px-3 py-1 rounded-full">Pasar</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Data Pasar Lokal</h3>
            <p className="text-3xl font-bold text-blue-600 mb-1">{filteredMarketData.length}</p>
            <p className="text-xs text-gray-500">Produk tersedia</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-purple-600 text-sm font-semibold bg-purple-50 px-3 py-1 rounded-full">Trend</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Update Terbaru</h3>
            <p className="text-3xl font-bold text-purple-600 mb-1">24/7</p>
            <p className="text-xs text-gray-500">Realtime monitoring</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-orange-600 text-sm font-semibold bg-orange-50 px-3 py-1 rounded-full">Data</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Cakupan Area</h3>
            <p className="text-3xl font-bold text-orange-600 mb-1">34</p>
            <p className="text-xs text-gray-500">Provinsi di Indonesia</p>
          </div>
        </div>
      </div>

      {/* Enhanced Data Sections */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* BPN Data Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Harga Resmi BPN</h2>
                  <p className="text-green-100 text-sm">Data dari Badan Pangan Nasional</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Star className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {filteredBpnData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">Tidak ada data BPN tersedia</p>
                  <p className="text-gray-400 text-sm mt-2">Coba ubah kata kunci pencarian</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredBpnData.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 overflow-hidden"
                    >
                      <div className="relative">
                        <img
                          src={item.background}
                          alt={item.name}
                          className="h-32 w-full object-contain p-4 bg-gradient-to-br from-gray-50 to-gray-100"
                        />
                        <div className="absolute top-3 right-3">
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            BPN
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-5 space-y-3">
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-green-600 transition-colors">
                          {item.name}
                        </h3>
                        
                        <div className="space-y-2">
                          <p className="text-green-700 font-bold text-xl">
                            {formatCurrency(item.today)}
                            <span className="text-sm text-gray-500 font-normal ml-2">
                              /{item.satuan}
                            </span>
                          </p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Kemarin: {formatCurrency(item.yesterday)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              item.gap_change === "up" 
                                ? "bg-red-50 text-red-700" 
                                : "bg-green-50 text-green-700"
                            }`}>
                              {item.gap_change === "up" ? 
                                <TrendingUp className="h-3 w-3" /> : 
                                <TrendingDown className="h-3 w-3" />
                              }
                              <span>{item.gap} ({item.gap_percentage}%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Market Data Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Harga Pasar Lokal</h2>
                  <p className="text-blue-100 text-sm">Data dari pasar tradisional & modern</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {filteredMarketData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">Tidak ada data pasar tersedia</p>
                  <p className="text-gray-400 text-sm mt-2">Coba ubah kata kunci pencarian</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredMarketData.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 overflow-hidden"
                    >
                      <div className="relative">
                        <img
                          src={`http://localhost:5000${item.image_url}`}
                          alt={item.product_name}
                          className="h-32 w-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            Pasar
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-5 space-y-3">
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                          {item.product_name}
                        </h3>
                        
                        <p className="text-blue-700 font-bold text-xl">
                          {formatCurrency(item.price)}
                          <span className="text-sm text-gray-500 font-normal ml-2">
                            /{item.unit}
                          </span>
                        </p>
                        
                        <div className="flex items-center space-x-1 text-gray-600 text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>{item.market_name || "Pasar Umum"}, {item.province?.province_name}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {item.grade && (
                            <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                              {item.grade}
                            </span>
                          )}
                          <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-semibold">
                            {item.market_type}
                          </span>
                          <div className="flex items-center space-x-1 px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Portal Harga Pangan</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Menyediakan informasi harga pangan terbaru dan terpercaya untuk mendukung transparansi pasar pangan di Indonesia.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Sumber Data</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Badan Pangan Nasional (BPN)</li>
                <li>• Pasar Tradisional</li>
                <li>• Pasar Modern</li>
                <li>• Pedagang Grosir</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Kontak</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Email: info@pantaupangan.id</p>
                <p>Telp: -</p>
                <p>Jakarta, Indonesia</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Portal Pantau Pangan Indonesia. Seluruh hak cipta dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHomePage;