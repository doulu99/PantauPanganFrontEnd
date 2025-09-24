// ==========================================
// 1. src/pages/PublicHomePage.jsx - Updated dengan Sembako
// ==========================================
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, Activity, Globe, Award, MapPin, Clock, 
  TrendingUp, RefreshCw, ArrowRight, BarChart3 
} from "lucide-react";
import { sembakoApi } from "../services/sembakoApi";

const PublicHomePage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [sembakoStats, setSembakoStats] = useState(null);
  const [latestSembakoData, setLatestSembakoData] = useState([]);
  const [bpnData, setBpnData] = useState([]); // Legacy BPN data
  const [marketData, setMarketData] = useState([]); // Legacy market data
  
  // Fetch Sembako Statistics
  const fetchSembakoStats = async () => {
    try {
      const response = await sembakoApi.getPublicStatistics();
      setSembakoStats(response.data.data);
    } catch (error) {
      console.error('Error fetching sembako stats:', error);
    }
  };

  // Fetch Latest Sembako Data
  const fetchLatestSembako = async () => {
    try {
      const response = await sembakoApi.getPublicLatest();
      setLatestSembakoData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching latest sembako:', error);
    }
  };

  // Legacy functions for existing data (if still needed)
  const fetchBPNData = async () => {
    // Keep existing BPN fetch logic if you have it
    // or remove if not needed
    setBpnData([]);
  };

  const fetchMarketData = async () => {
    // Keep existing market fetch logic if you have it
    // or remove if not needed  
    setMarketData([]);
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchSembakoStats(), 
        fetchLatestSembako(),
        fetchBPNData(), 
        fetchMarketData()
      ]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

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
            Memuat Data Harga Sembako
          </h3>
          <p className="text-gray-600 text-lg">Mengambil informasi 9 bahan pokok dari seluruh Indonesia...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Enhanced Hero Section with Sembako Focus */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-6">
                <Sparkles className="h-5 w-5 text-yellow-300 mr-2 animate-pulse" />
                <span className="text-white font-semibold">Sistem Monitoring 9 Bahan Pokok Pangan</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-yellow-300 via-emerald-300 to-blue-300 bg-clip-text text-transparent">
                  Pantau Pangan
                </span>
                <br />
                <span className="text-3xl md:text-4xl font-medium text-white/90">Indonesia</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
                Monitoring harga 9 bahan pokok pangan secara real-time dari seluruh Indonesia. 
                Data akurat, transparan, dan terpercaya untuk ketahanan pangan nasional.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                to="/sembako"
                className="group bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                <BarChart3 className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                Lihat Data Sembako
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => document.getElementById('stats-section').scrollIntoView({behavior: 'smooth'})}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center"
              >
                <Activity className="mr-3 h-6 w-6" />
                Lihat Statistik
              </button>
            </div>

            {/* Hero Stats - Sembako Focus */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl px-8 py-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-bold text-emerald-300 mb-1">
                  {sembakoStats?.summary?.total_records?.toLocaleString('id-ID') || 0}
                </div>
                <div className="text-emerald-100 font-medium">Data Sembako</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl px-8 py-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-bold text-blue-300 mb-1">
                  {sembakoStats?.summary?.total_provinces || 0}
                </div>
                <div className="text-blue-100 font-medium">Provinsi</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl px-8 py-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-bold text-yellow-300 mb-1">11</div>
                <div className="text-yellow-100 font-medium">Komoditas</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl px-8 py-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-bold text-purple-300 mb-1">24/7</div>
                <div className="text-purple-100 font-medium">Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Section - Sembako Focused */}
      <div className="container mx-auto px-4 py-16 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="h-8 w-8 text-white" />
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-4 py-2 rounded-full">
                SEMBAKO
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">9 Bahan Pokok</h3>
            <p className="text-gray-600 leading-relaxed">
              Monitoring khusus untuk 9 bahan pokok pangan: beras, gula, minyak, daging, ayam, telur, dan bawang
            </p>
          </div>

          <div className="group bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <span className="bg-blue-100 text-blue-700 text-sm font-bold px-4 py-2 rounded-full">
                NASIONAL
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Seluruh Indonesia</h3>
            <p className="text-gray-600 leading-relaxed">
              Data dari pasar-pasar tradisional dan modern di 34 provinsi seluruh Indonesia
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
            <h3 className="text-xl font-bold text-gray-800 mb-3">Update Harian</h3>
            <p className="text-gray-600 leading-relaxed">
              Import otomatis dari Google Form dan update manual untuk data yang selalu fresh
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div id="stats-section" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Statistik Sembako Nasional</h2>
          <p className="text-xl text-gray-600">Rata-rata harga 9 bahan pokok pangan di Indonesia</p>
        </div>

        {sembakoStats?.average_prices && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Object.entries(sembakoStats.average_prices).map(([key, price]) => {
                const commodityInfo = {
                  harga_beras: { name: 'Beras', icon: '🌾', unit: '/kg' },
                  harga_gula: { name: 'Gula', icon: '🍯', unit: '/kg' },
                  harga_minyak: { name: 'Minyak', icon: '🛢️', unit: '/liter' },
                  harga_daging: { name: 'Daging Sapi', icon: '🥩', unit: '/kg' },
                  harga_ayam: { name: 'Ayam', icon: '🐔', unit: '/kg' },
                  harga_telur: { name: 'Telur', icon: '🥚', unit: '/kg' },
                  harga_bawang_merah: { name: 'Bawang Merah', icon: '🧅', unit: '/kg' },
                  harga_bawang_putih: { name: 'Bawang Putih', icon: '🧄', unit: '/kg' },
                  harga_gas: { name: 'Gas LPG', icon: '🫗', unit: '/tabung' },
                  harga_garam: { name: 'Garam', icon: '🧂', unit: '/kg' },
                  harga_susu: { name: 'Susu', icon: '🥛', unit: '/liter' },
                };

                const commodity = commodityInfo[key];
                if (!commodity) return null;

                return (
                  <div key={key} className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
                    <div className="text-center">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                        {commodity.icon}
                      </div>
                      <h4 className="font-bold text-gray-800 mb-1">{commodity.name}</h4>
                      <p className="text-sm text-gray-500 mb-3">{commodity.unit}</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                        {formatPrice(parseFloat(price))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Latest Data Preview */}
      {latestSembakoData.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Data Terbaru</h2>
            <p className="text-xl text-gray-600">Harga sembako terkini dari berbagai daerah</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {latestSembakoData.slice(0, 6).map((item) => (
              <div key={item.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white p-4">
                  <h3 className="font-bold text-lg">{item.market_name}</h3>
                  <p className="text-blue-100">{item.province_name}</p>
                  <p className="text-sm text-blue-200">
                    {new Date(item.survey_date).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {item.harga_beras && (
                      <div className="flex justify-between">
                        <span>🌾 Beras:</span>
                        <span className="font-semibold">{formatPrice(item.harga_beras)}</span>
                      </div>
                    )}
                    {item.harga_gula && (
                      <div className="flex justify-between">
                        <span>🍯 Gula:</span>
                        <span className="font-semibold">{formatPrice(item.harga_gula)}</span>
                      </div>
                    )}
                    {item.harga_minyak && (
                      <div className="flex justify-between">
                        <span>🛢️ Minyak:</span>
                        <span className="font-semibold">{formatPrice(item.harga_minyak)}</span>
                      </div>
                    )}
                    {item.harga_ayam && (
                      <div className="flex justify-between">
                        <span>🐔 Ayam:</span>
                        <span className="font-semibold">{formatPrice(item.harga_ayam)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link 
              to="/sembako" 
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Lihat Semua Data Sembako
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
        </div>
      )}

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '4s', animationDuration: '8s'}}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center mb-8">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl mr-4 shadow-lg">
                  <Activity className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold">Pantau Pangan Indonesia</h3>
                  <p className="text-gray-400">Sembako Monitoring Platform</p>
                </div>
              </div>
              <p className="text-gray-300 text-xl leading-relaxed mb-8">
                Platform monitoring harga sembako terdepan yang menyediakan informasi real-time 
                untuk 9 bahan pokok pangan guna mendukung ketahanan pangan nasional.
              </p>
            </div>
            
            <div>
              <h4 className="text-xl font-bold text-white mb-6">Quick Links</h4>
              <div className="space-y-4">
                <Link to="/sembako" className="block text-gray-300 hover:text-white transition-colors text-lg">
                  📊 Data Sembako
                </Link>
                <Link to="/login" className="block text-gray-300 hover:text-white transition-colors text-lg">
                  🔐 Login Admin
                </Link>
                <a href="#stats-section" className="block text-gray-300 hover:text-white transition-colors text-lg">
                  📈 Statistik
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-bold text-white mb-6">Info Kontak</h4>
              <div className="space-y-4 text-lg">
                <div className="text-gray-300">
                  📧 info@pantaupangan.id
                </div>
                <div className="text-gray-300">
                  🇮🇩 Jakarta, Indonesia
                </div>
                <div className="text-gray-300">
                  🕐 Update: {new Date().toLocaleDateString('id-ID')}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-20 pt-10 text-center">
            <p className="text-gray-400 text-xl font-semibold">
              © 2025 Portal Pantau Pangan Indonesia - Sistem Monitoring 9 Bahan Pokok
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHomePage;