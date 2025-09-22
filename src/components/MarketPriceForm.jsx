// src/components/MarketPriceForm.jsx
import React, { useEffect, useState } from "react";
import { Save, X, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:5000";

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

  // Fetch provinces & data untuk edit
  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/api/regions/provinces`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProvinces(data);
        } else {
          console.error("Format provinsi tidak sesuai:", data);
        }
      })
      .catch(console.error);

    if (priceId) {
      fetch(`${API_BASE}/api/market-prices/${priceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setFormData({ ...data.data, image: null });
          }
        })
        .catch(console.error);
    }
  }, [priceId, token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          form.append(key, value);
        }
      });

      const url = priceId
        ? `${API_BASE}/api/market-prices/${priceId}`
        : `${API_BASE}/api/market-prices`;
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
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {priceId ? "Edit Market Price" : "Add New Market Price"}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="product_name"
              placeholder="Enter product name"
              value={formData.product_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (IDR) *
            </label>
            <input
              type="number"
              name="price"
              placeholder="0"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Unit (free input) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <input
              type="text"
              name="unit"
              placeholder="contoh: kg, liter, ikat"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Market Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Market Type *
            </label>
            <select
              name="market_type"
              value={formData.market_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Pasar Tradisional">Traditional Market</option>
              <option value="Pasar Modern">Modern Market</option>
              <option value="Supermarket">Supermarket</option>
              <option value="Grosir">Wholesale</option>
              <option value="Online Shop">Online Shop</option>
            </select>
          </div>

          {/* Market Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Market Name
            </label>
            <input
              type="text"
              name="market_name"
              placeholder="Enter market name"
              value={formData.market_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Province */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Province
            </label>
            <select
              name="province_id"
              value={formData.province_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.province_id}>
                  {province.province_name}
                </option>
              ))}
            </select>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade
            </label>
            <select
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Grade</option>
              <option value="Premium">Premium</option>
              <option value="Super">Super</option>
              <option value="Standar">Standard</option>
              <option value="Grade A">Grade A</option>
              <option value="Grade B">Grade B</option>
              <option value="Grade C">Grade C</option>
            </select>
          </div>

          {/* Effective Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effective Date
            </label>
            <input
              type="date"
              name="effective_date"
              value={formData.effective_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-gray-400" />
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : priceId ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarketPriceForm;
