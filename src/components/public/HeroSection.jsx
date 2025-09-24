// ==========================================
// src/components/public/HeroSection.jsx
// ==========================================
import React from 'react';
import { Sparkles, Database, Shield, Scale, Zap } from 'lucide-react';

const HeroSection = ({ sembakoStats, bpnData, comparisonData, bpnHealth }) => {
  return (
    <div className="relative overflow-hidden">
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
              <span className="text-white font-semibold">Perbandingan Harga Sembako Multi-Sumber</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-300 via-emerald-300 to-blue-300 bg-clip-text text-transparent">
                Pantau Pangan
              </span>
              <br />
              <span className="text-3xl md:text-4xl font-medium text-white/90">Indonesia</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Monitoring dan perbandingan harga sembako dari data internal dan Badan Pangan Nasional 
              untuk analisis yang komprehensif dan akurat.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <StatCard
              icon={Database}
              value={sembakoStats?.summary?.total_records?.toLocaleString('id-ID') || '0'}
              label="Data Internal"
              color="blue"
            />
            <StatCard
              icon={Shield}
              value={bpnData?.count || bpnData?.data?.length || '0'}
              label="Data BPN Resmi"
              color="orange"
            />
            <StatCard
              icon={Scale}
              value={comparisonData?.length || '0'}
              label="Perbandingan"
              color="emerald"
            />
            <StatCard
              icon={Zap}
              value={bpnHealth?.success ? 'Live' : 'Cached'}
              label="Status BPN"
              color="purple"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, color }) => {
  const colorClasses = {
    blue: 'text-blue-300',
    orange: 'text-orange-300',
    emerald: 'text-emerald-300',
    purple: 'text-purple-300'
  };

  return (
    <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
      <Icon className={`w-8 h-8 ${colorClasses[color]} mx-auto mb-2`} />
      <div className={`text-2xl font-bold ${colorClasses[color]} mb-1`}>
        {value}
      </div>
      <div className={`text-${color}-100 font-medium`}>{label}</div>
    </div>
  );
};

export default HeroSection;