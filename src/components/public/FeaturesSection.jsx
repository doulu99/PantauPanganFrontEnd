// ==========================================
// src/components/public/FeaturesSection.jsx
// ==========================================
import React from 'react';
import { Database, Shield, Scale, BarChart3 } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Database,
      gradient: 'from-blue-500 to-indigo-600',
      title: 'Data Real-time',
      description: 'Monitoring harga sembako secara real-time dari berbagai sumber terpercaya'
    },
    {
      icon: Shield,
      gradient: 'from-orange-500 to-red-600',
      title: 'Data Resmi BPN',
      description: 'Integrasi langsung dengan Badan Pangan Nasional untuk data resmi pemerintah'
    },
    {
      icon: Scale,
      gradient: 'from-emerald-500 to-green-600',
      title: 'Perbandingan Multi-Source',
      description: 'Analisis perbandingan harga antara berbagai sumber data untuk akurasi maksimal'
    },
    {
      icon: BarChart3,
      gradient: 'from-purple-500 to-pink-600',
      title: 'Analisis Trend',
      description: 'Analisis tren harga untuk prediksi dan insights yang actionable'
    }
  ];

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Fitur Unggulan</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Platform monitoring harga sembako dengan integrasi multi-sumber untuk analisis yang komprehensif
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ feature }) => {
  const { icon: Icon, gradient, title, description } = feature;
  
  return (
    <div className="text-center group">
      <div className={`bg-gradient-to-br ${gradient} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
        <Icon className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeaturesSection;