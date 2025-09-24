// ==========================================
// src/components/public/Footer.jsx
// ==========================================
import React from 'react';
import { BarChart3, Database, Shield, Scale, Zap } from 'lucide-react';

const Footer = () => {
  const features = [
    { icon: Database, label: 'Multi-Source', color: 'blue' },
    { icon: Shield, label: 'Official Data', color: 'orange' },
    { icon: Scale, label: 'Comparison', color: 'emerald' },
    { icon: Zap, label: 'Real-time', color: 'purple' }
  ];

  return (
    <footer className="bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Pantau Pangan Indonesia</h3>
          </div>
          
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Platform monitoring harga sembako dengan integrasi Badan Pangan Nasional 
            untuk transparansi dan akurasi data yang maksimal.
          </p>
          
          <div className="flex justify-center space-x-6 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <feature.icon className={`w-8 h-8 text-${feature.color}-400 mx-auto mb-2`} />
                <div className="text-sm text-gray-400">{feature.label}</div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-500 text-sm">
              © 2025 Pantau Pangan Indonesia. Powered by BPN Integration & Multi-Source Data Analysis.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;