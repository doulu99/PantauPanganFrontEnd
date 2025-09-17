import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Store, 
  Globe,
  AlertCircle,
  Plus,
  Filter,
  Calendar,
  MapPin,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { marketPriceAPI, priceAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import AddMarketPriceModal from '../components/AddMarketPriceModal';

const PriceComparisonPage = () => {
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [trendData, setTrendData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchComparison();
  }, [selectedCommodity, selectedDate]);

  useEffect(() => {
    if (selectedCommodity) {
      fetchTrends();
    }
  }, [selectedCommodity]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const response = await marketPriceAPI.comparePrices({
        commodity_id: selectedCommodity,
        date: selectedDate
      });

      if (response.data.success) {
        setComparisonData(response.data.data);
        setSummary(response.data.summary);
      }
    } catch (error) {
      toast.error('Failed to fetch comparison data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await marketPriceAPI.getPriceTrends({
        commodity_id: selectedCommodity
      });

      if (response.data.success) {
        // Format data for chart
        const chartData = [];
        const nationalMap = {};
        const marketMap = {};

        response.data.data.national_prices.forEach(p => {
          nationalMap[p.date] = parseFloat(p.price);
        });

        response.data.data.market_prices.forEach(p => {
          marketMap[p.date] = parseFloat(p.price);
        });

        // Combine all dates
        const allDates = [...new Set([
          ...Object.keys(nationalMap),
          ...Object.keys(marketMap)
        ])].sort();

        allDates.forEach(date => {
          chartData.push({
            date: formatDate(date),
            national: nationalMap[date] || null,
            market: marketMap[date] || null
          });
        });

        setTrendData(chartData);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  const ComparisonCard = ({ item }) => {
    const hasMarketPrice = item.market_prices.length > 0;
    const priceDiff = item.difference;
    const isHigher = priceDiff > 0;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{item.commodity.name}</h3>
            <p className="text-sm text-gray-500">{item.commodity.unit}</p>
          </div>
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            {item.commodity.category}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* National Price */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Globe className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-xs text-blue-600 font-medium">Harga Nasional</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {item.national_price ? formatCurrency(item.national_price) : '-'}
            </p>
            <p className="text-xs text-gray-500">Badan Pangan</p>
          </div>

          {/* Market Average */}
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Store className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-xs text-green-600 font-medium">Rata-rata Pasar</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {hasMarketPrice ? formatCurrency(item.average_market_price) : '-'}
            </p>
            <p className="text-xs text-gray-500">
              {item.market_prices.length} pasar
            </p>
          </div>
        </div>

        {/* Difference Indicator */}
        {item.national_price && hasMarketPrice && (
          <div className={`rounded-lg p-3 ${isHigher ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Selisih Harga Pasar
              </span>
              <div className="flex items-center">
                {isHigher ? (
                  <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span className={`font-bold ${isHigher ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(Math.abs(priceDiff))} ({Math.abs(item.difference_percentage)}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Market Details */}
        {hasMarketPrice && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Detail Harga Pasar:</p>
            <div className="space-y-1">
              {item.market_prices.slice(0, 3).map((mp, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {mp.market_name}
                  </span>
                  <span className="font-medium">{formatCurrency(mp.price)}</span>
                </div>
              ))}
              {item.market_prices.length > 3 && (
                <p className="text-xs text-blue-600 mt-1">
                  +{item.market_prices.length - 3} pasar lainnya
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Perbandingan Harga</h1>
        <p className="text-gray-600 mt-2">
          Bandingkan harga nasional dari Badan Pangan dengan harga pasar lokal
        </p>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Komoditas</p>
            <p className="text-2xl font-bold">{summary.total_commodities}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Rata-rata Selisih</p>
            <p className="text-2xl font-bold">
              {summary.average_difference > 0 ? '+' : ''}{summary.average_difference.toFixed(2)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Lebih Mahal di Pasar</p>
            <p className="text-2xl font-bold text-red-600">
              {comparisonData.filter(d => d.difference > 0).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Lebih Murah di Pasar</p>
            <p className="text-2xl font-bold text-green-600">
              {comparisonData.filter(d => d.difference < 0).length}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Komoditas</option>
            {/* Add commodity options dynamically */}
          </select>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Harga Pasar
          </button>
        </div>
      </div>

      {/* Trend Chart */}
      {trendData && trendData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Trend Perbandingan Harga (30 Hari)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="national" 
                stroke="#3B82F6" 
                name="Harga Nasional"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="market" 
                stroke="#10B981" 
                name="Rata-rata Pasar"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Comparison Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparisonData.map((item, index) => (
            <ComparisonCard key={index} item={item} />
          ))}
        </div>
      )}

      {/* Add Market Price Modal */}
      {showAddModal && (
        <AddMarketPriceModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchComparison();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default PriceComparisonPage;