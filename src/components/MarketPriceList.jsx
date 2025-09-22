// src/components/MarketPriceList.jsx
import React, { useEffect, useState } from "react";
import { Edit, Trash2, Search, Filter, MapPin, Calendar, Package, DollarSign, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import config from "../config/config.js";

const MarketPriceList = ({ onEdit, canManage, refreshTrigger }) => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    market_type: "",
    province_id: "",
    status: ""
  });
  const [provinces, setProvinces] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchProvinces = async () => {
    try {
      const res = await fetch(`${config.API_URL}/regions/provinces`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data = await res.json();
      setProvinces(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching provinces:", error);
      setProvinces([]);
    }
  };

  const fetchPrices = async () => {
    setLoading(true);
    setError("");
    
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const res = await fetch(`${config.PUBLIC_API_URL}/market-prices?${queryParams}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data = await res.json();
      
      if (data.success) {
        setPrices(data.data || []);
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            ...data.pagination
          }));
        }
      } else {
        setError(data.message || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [refreshTrigger, filters, pagination.page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${config.API_URL}/market-prices/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();
      if (data.success) {
        fetchPrices(); // Refresh list
        // Show success message
        setError("");
      } else {
        setError(data.message || "Failed to delete item");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Error deleting item");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleRefresh = () => {
    fetchPrices();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl mr-4 shadow-lg">
            <Package className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Market Price List</h2>
            <p className="text-gray-600">Manage and monitor all market prices</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-sm"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-800">Error</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center mb-6">
          <Filter className="h-6 w-6 text-gray-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">Filters & Search</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search Products</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search commodity, market..."
                className="pl-10 w-full px-4 py-3 text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Market Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Market Type</label>
            <select
              className="w-full px-4 py-3 text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
              value={filters.market_type}
              onChange={(e) => handleFilterChange('market_type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Pasar Tradisional">Traditional Market</option>
              <option value="Pasar Modern">Modern Market</option>
              <option value="Supermarket">Supermarket</option>
              <option value="Grosir">Wholesale</option>
              <option value="Online">Online</option>
            </select>
          </div>

          {/* Province */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Province</label>
            <select
              className="w-full px-4 py-3 text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
              value={filters.province_id}
              onChange={(e) => handleFilterChange('province_id', e.target.value)}
            >
              <option value="">All Provinces</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              className="w-full px-4 py-3 text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-800">
                Market Prices ({pagination.total} items)
              </h3>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              {loading && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>

        {prices.length === 0 && !loading ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Market Prices Found</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.market_type || filters.province_id || filters.status
                ? "Try adjusting your filters to see more results"
                : "No market prices available at the moment"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-emerald-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Market
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  {canManage && (
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {prices.map((price, index) => (
                  <tr 
                    key={price.id} 
                    className="hover:bg-blue-50 transition-colors duration-200"
                    style={{animationDelay: `${index * 50}ms`}}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {price.image_url ? (
                          <img
                            src={`${config.API_BASE_URL}${price.image_url}`}
                            alt={price.product_name}
                            className="w-12 h-12 rounded-xl object-cover mr-4 border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-xl flex items-center justify-center mr-4">
                            <Package className="h-6 w-6 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {price.product_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {price.unit} • {price.grade || "Standard"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-emerald-600">
                        {formatCurrency(price.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {price.market_name || "Unknown Market"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {price.market_type || "Traditional"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-700">
                          {price.province?.province_name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-700">
                          {formatDate(price.effective_date || price.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                        price.status === 'published' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : price.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {price.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onEdit(price)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(price.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-emerald-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    pagination.page === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 shadow-sm'
                  }`}
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-2">
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
                    {pagination.page}
                  </span>
                  <span className="text-gray-500">of</span>
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold">
                    {pagination.totalPages}
                  </span>
                </div>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    pagination.page === pagination.totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 shadow-sm'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPriceList;