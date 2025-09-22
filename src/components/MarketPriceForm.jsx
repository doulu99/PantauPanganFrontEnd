// src/components/MarketPriceForm.jsx
import React, { useEffect, useState } from "react";
import { Save, X, Upload, MapPin, DollarSign, Package, Calendar, Star, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import config from "../config/config.js";

const MarketPriceForm = ({ priceId, onSuccess, onCancel }) => {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    product_name: "",
    price: "",
    unit: "",
    market_type: "Pasar Tradisional",
    market_name: "",
    province_id: "",
    grade: "",
    effective_date: new Date().toISOString().split("T")[0],
    status: "published",
    image: null,
  });

  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch provinces & data untuk edit
  useEffect(() => {
    if (!token) return;

    // Fetch provinces with robust error handling
    const fetchProvinces = async () => {
      try {
        const res = await fetch(`${config.API_URL}/regions/provinces`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Handle different response structures
        let provincesArray = [];
        if (Array.isArray(data)) {
          provincesArray = data;
        } else if (data.success && Array.isArray(data.data)) {
          provincesArray = data.data;
        } else if (data.data && Array.isArray(data.data)) {
          provincesArray = data.data;
        } else {
          console.error("Unexpected provinces response format:", data);
          setError("Failed to load provinces. Please refresh and try again.");
          return;
        }
        
        // Normalize province data structure
        const normalizedProvinces = provincesArray.map(province => ({
          id: province.id || province.province_id,
          name: province.name || province.province_name
        }));
        
        setProvinces(normalizedProvinces);
        
      } catch (error) {
        console.error("Error fetching provinces:", error);
        setError("Failed to load provinces. Please check your connection.");
      }
    };

    fetchProvinces();

    // Fetch existing data for edit mode
    if (priceId) {
      const fetchPriceData = async () => {
        try {
          const res = await fetch(`${config.API_URL}/market-prices/${priceId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          
          const data = await res.json();
          
          if (data.success) {
            // Keep the original image reference but don't set it in form
            const { image, image_url, ...restData } = data.data;
            setFormData(prev => ({
              ...prev,
              ...restData,
              image: null // Always reset image for edit mode
            }));
            
            // Set image preview if exists
            if (image_url) {
              setImagePreview(`${config.API_BASE_URL}${image_url}`);
            }
          } else {
            setError(data.message || "Failed to load price data");
          }
        } catch (error) {
          console.error("Error fetching price data:", error);
          setError("Failed to load price data. Please try again.");
        }
      };
      
      fetchPriceData();
    }
  }, [priceId, token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      handleFileSelect(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (error) setError("");
  };

  const handleFileSelect = (file) => {
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, WEBP)");
        return;
      }

      if (file.size > maxSize) {
        setError("File size must be less than 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          form.append(key, value);
        }
      });

      const url = priceId
        ? `${config.API_URL}/market-prices/${priceId}`
        : `${config.API_URL}/market-prices`;
      const method = priceId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || "Failed to save data");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(value);
  };

  const isValidPrice = formData.price && !isNaN(formData.price) && Number(formData.price) > 0;
  const canSubmit = formData.product_name && formData.price && isValidPrice && formData.unit && formData.market_name && formData.province_id && !loading;

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl mr-4 shadow-lg">
            <Package className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {priceId ? "Edit Market Price" : "Add New Market Price"}
            </h2>
            <p className="text-gray-600">
              {priceId ? "Update existing product information" : "Create new product entry in our database"}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-800">Error</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Product Information
              </h3>
              
              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
                    placeholder="e.g., Beras Premium"
                  />
                </div>

                {/* Price and Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (IDR) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="100"
                        className={`w-full pl-10 pr-4 py-3 text-gray-800 bg-white border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                          isValidPrice ? 'border-green-300 focus:border-green-500 focus:ring-green-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="12000"
                      />
                      {isValidPrice && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {formData.price && (
                      <p className="mt-2 text-sm text-gray-600">
                        Preview: Rp {formatCurrency(formData.price)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
                    >
                      <option value="">Select Unit</option>
                      <option value="kg">kg</option>
                      <option value="liter">liter</option>
                      <option value="pcs">pcs</option>
                      <option value="pack">pack</option>
                      <option value="sack">sack</option>
                      <option value="ikat">ikat</option>
                    </select>
                  </div>
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Grade/Quality
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
                  >
                    <option value="">Select Grade</option>
                    <option value="Premium">Premium</option>
                    <option value="Standar">Standar</option>
                    <option value="Medium">Medium</option>
                    <option value="Regular">Regular</option>
                    <option value="Super">Super</option>
                    <option value="I">Grade I</option>
                    <option value="II">Grade II</option>
                    <option value="III">Grade III</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Market Information Section */}
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
                Market Information
              </h3>
              
              <div className="space-y-4">
                {/* Market Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Market Type *
                  </label>
                  <select
                    name="market_type"
                    value={formData.market_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
                  >
                    <option value="Pasar Tradisional">Pasar Tradisional</option>
                    <option value="Pasar Modern">Pasar Modern</option>
                    <option value="Supermarket">Supermarket</option>
                    <option value="Grosir">Grosir</option>
                    <option value="Online">Online</option>
                  </select>
                </div>

                {/* Market Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Market Name *
                  </label>
                  <input
                    type="text"
                    name="market_name"
                    value={formData.market_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
                    placeholder="e.g., Pasar Beringharjo"
                  />
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Province *
                  </label>
                  <select
                    name="province_id"
                    value={formData.province_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
                  >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Effective Date and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Effective Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        name="effective_date"
                        value={formData.effective_date}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2 text-purple-600" />
            Product Image
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Area */}
            <div>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                />
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      {formData.image ? formData.image.name : "Upload Product Image"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Drag & drop or click to select • PNG, JPG, WEBP (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Preview */}
            <div>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-2xl shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image: null }));
                      setImagePreview(null);
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-gray-200">
                  <div className="text-center">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No image selected</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 text-gray-700 font-semibold bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`px-8 py-3 font-bold rounded-xl transition-all duration-300 flex items-center shadow-lg ${
              canSubmit
                ? 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-3" />
                {priceId ? "Update Product" : "Save Product"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarketPriceForm;