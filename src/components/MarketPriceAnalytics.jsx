import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, MapPin, Calendar, Filter } from 'lucide-react';
import { marketPriceAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const MarketPriceAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [priceComparison, setPriceComparison] = useState([]);
  const [marketComparison, setMarketComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, selectedCategory, selectedMarket]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const params = {
        period: selectedPeriod,
        category: selectedCategory,
        market: selectedMarket
      };

      const [analyticsRes, comparisonRes, marketRes] = await Promise.all([
        marketPriceAPI.getPriceAnalytics(params),
        marketPriceAPI.comparePrices(params),
        marketPriceAPI.getMarketComparison(params)
      ]);

      if (analyticsRes.data.success) {
        setAnalyticsData(analyticsRes.data.data);
      }

      if (comparisonRes.data.success) {
        setPriceComparison(comparisonRes.data.data);
      }

      if (marketRes.data.success) {
        setMarketComparison(marketRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Gagal memuat data analytics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : change < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              ) : null}
              <span className={`text-sm ${
                change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Harga Pasar</h2>
          <p className="text-gray-600 mt-1">Analisis tren dan perbandingan harga pasar</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
            <option value="quarter">3 Bulan Terakhir</option>
            <option value="year">1 Tahun Terakhir</option>
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            <option value="beras">Beras</option>
            <option value="sayuran">Sayuran</option>
            <option value="daging">Daging</option>
            <option value="bumbu">Bumbu</option>
          </select>
        </div>
      </div>

      {/* Key Statistics */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Data Harga"
            value={analyticsData.total_records?.toLocaleString('id-ID')}
            change={analyticsData.growth_rate}
            icon={BarChart3}
            color="blue"
          />
          <StatCard
            title="Rata-rata Harga"
            value={formatCurrency(analyticsData.average_price)}
            change={analyticsData.price_change}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Jumlah Pasar"
            value={analyticsData.unique_markets}
            icon={MapPin}
            color="orange"
          />
          <StatCard
            title="Komoditas Aktif"
            value={analyticsData.active_commodities}
            icon={PieChartIcon}
            color="purple"
          />
        </div>
      )}

      {/* Price Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Tren Harga</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Periode: {selectedPeriod === 'week' ? '7 Hari' : selectedPeriod === 'month' ? '30 Hari' : selectedPeriod === 'quarter' ? '3 Bulan' : '1 Tahun'}</span>
          </div>
        </div>
        
        {analyticsData?.price_trends && analyticsData.price_trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analyticsData.price_trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              />
              <YAxis tickFormatter={(value) => `Rp${(value/1000)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avg_price" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Rata-rata Harga"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="min_price" 
                stroke="#82ca9d" 
                strokeWidth={1}
                strokeDasharray="5 5"
                name="Harga Minimum"
              />
              <Line 
                type="monotone" 
                dataKey="max_price" 
                stroke="#ff7300" 
                strokeWidth={1}
                strokeDasharray="5 5"
                name="Harga Maksimum"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada data tren untuk periode ini</p>
            </div>
          </div>
        )}
      </div>

      {/* Price Comparison and Market Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Comparison Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Perbandingan Harga Antar Komoditas
          </h3>
          
          {priceComparison && priceComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceComparison.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="commodity_name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis tickFormatter={(value) => `${(value/1000)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="market_price" 
                  fill="#8884d8" 
                  name="Harga Pasar"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="national_price" 
                  fill="#82ca9d" 
                  name="Harga Nasional"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada data perbandingan</p>
              </div>
            </div>
          )}
        </div>

        {/* Market Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Distribusi Data per Pasar
          </h3>
          
          {marketComparison && marketComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={marketComparison.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {marketComparison.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} data`, 'Jumlah']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <PieChartIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada data distribusi pasar</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Market Performance Table */}
      {analyticsData?.top_markets && analyticsData.top_markets.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Performa Pasar Teratas
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nama Pasar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Jumlah Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rata-rata Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Update Terakhir
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.top_markets.map((market, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {market.market_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {market.market_location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {market.data_count} data
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(market.avg_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(market.last_update).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPriceAnalytics;