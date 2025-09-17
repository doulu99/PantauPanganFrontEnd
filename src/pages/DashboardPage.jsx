import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, TrendingDown, RefreshCw, Calendar, Filter } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { priceAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard';
import PriceTable from '../components/PriceTable';
import PriceOverrideModal from '../components/PriceOverrideModal';

const DashboardPage = () => {
  const [prices, setPrices] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pricesRes, statsRes] = await Promise.all([
        priceAPI.getCurrentPrices({ category: selectedCategory }),
        priceAPI.getStatistics()
      ]);
      
      if (pricesRes.data.success) {
        setPrices(pricesRes.data.data || []);
      }
      if (statsRes.data.success) {
        setStatistics(statsRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await priceAPI.syncPrices({ level_harga_id: 3 });
      if (result.data.success) {
        await fetchData();
        toast.success('Data synchronized successfully!');
      }
    } catch (error) {
      toast.error('Sync failed');
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleEditPrice = (commodity) => {
    setSelectedCommodity(commodity);
    setOverrideModalOpen(true);
  };

  // Calculate statistics
  const avgPriceChange = prices.length > 0
    ? prices.reduce((acc, p) => acc + (p.gap_percentage || 0), 0) / prices.length
    : 0;

  const pricesUp = prices.filter(p => p.gap_change === 'up').length;
  const pricesDown = prices.filter(p => p.gap_change === 'down').length;
  const pricesStable = prices.filter(p => p.gap_change === 'stable' || !p.gap_change).length;

  const pieData = [
    { name: 'Naik', value: pricesUp, color: '#EF4444' },
    { name: 'Turun', value: pricesDown, color: '#10B981' },
    { name: 'Stabil', value: pricesStable, color: '#6B7280' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor harga pangan hari ini</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            <option value="beras">Beras</option>
            <option value="sayuran">Sayuran</option>
            <option value="daging">Daging</option>
            <option value="bumbu">Bumbu</option>
            <option value="lainnya">Lainnya</option>
          </select>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Komoditas"
          value={prices.length}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Rata-rata Perubahan"
          value={`${avgPriceChange.toFixed(2)}%`}
          change={avgPriceChange}
          icon={TrendingUp}
          color="orange"
        />
        <StatCard
          title="Harga Naik"
          value={pricesUp}
          icon={TrendingUp}
          color="red"
        />
        <StatCard
          title="Harga Turun"
          value={pricesDown}
          icon={TrendingDown}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Distribusi Perubahan</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Top Movers</h3>
          <div className="space-y-3">
            {prices
              .sort((a, b) => Math.abs(b.gap_percentage || 0) - Math.abs(a.gap_percentage || 0))
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.commodity?.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center">
                    {item.gap_change === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                    ) : item.gap_change === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                    ) : null}
                    <span className={`text-sm font-medium ${
                      item.gap_change === 'up' ? 'text-red-500' : 
                      item.gap_change === 'down' ? 'text-green-500' : 
                      'text-gray-500'
                    }`}>
                      {item.gap_percentage || 0}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Price Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <PriceTable prices={prices} onEditPrice={handleEditPrice} />
      )}

      {/* Price Override Modal */}
      <PriceOverrideModal
        isOpen={overrideModalOpen}
        onClose={() => {
          setOverrideModalOpen(false);
          setSelectedCommodity(null);
        }}
        commodity={selectedCommodity}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default DashboardPage;