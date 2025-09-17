import React from 'react';
import { Link } from 'react-router-dom';
import { Package, RefreshCw, Activity, Shield, ChevronRight, BarChart3, AlertCircle } from 'lucide-react';

const HomePage = () => {
  const stats = [
    { label: 'Komoditas Terpantau', value: '25+', icon: Package, color: 'blue' },
    { label: 'Update Harian', value: '4x', icon: RefreshCw, color: 'green' },
    { label: 'Provinsi', value: '38', icon: Activity, color: 'purple' },
    { label: 'Akurasi Data', value: '99%', icon: Shield, color: 'orange' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Monitor Harga Pangan
            <span className="text-blue-600"> Real-Time</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Platform pemantauan harga pangan nasional dengan data akurat dari Badan Pangan Nasional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
              Lihat Dashboard
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/register" className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
              <stat.icon className={`w-12 h-12 mx-auto mb-4 text-${stat.color}-500`} />
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Fitur Unggulan</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Analisis Trend</h3>
            <p className="text-gray-600">
              Visualisasi data harga dengan grafik interaktif untuk analisis trend pasar
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <AlertCircle className="w-12 h-12 text-orange-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Alert System</h3>
            <p className="text-gray-600">
              Notifikasi otomatis saat terjadi perubahan harga signifikan
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <Shield className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Data Terverifikasi</h3>
            <p className="text-gray-600">
              Data dari sumber resmi dengan kemampuan override manual yang teraudit
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;