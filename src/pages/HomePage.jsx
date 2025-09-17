import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Package,
  Building2,
  Store,
} from "lucide-react";
import { formatCurrency } from "../utils/helpers";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../index.css"; // pastikan ada animate-marquee CSS di sini

const HomePage = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState("bapanas"); // default Badan Pangan Nasional
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchPrices();
  }, [selectedCategory, selectedSource]);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/prices/current", {
        params: { category: selectedCategory, source: selectedSource, limit: 20 },
      });
      if (res.data.success) {
        setPrices(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  // Running ticker data
  const tickerItems = prices.map(
    (item) =>
      `${item.commodity?.name}: ${formatCurrency(item.price)} (${
        item.gap_change === "up"
          ? "▲"
          : item.gap_change === "down"
          ? "▼"
          : "—"
      } ${item.gap_percentage}%)`
  );

  const PriceCard = ({ item }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-5 border border-gray-100">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={item.commodity?.image_url}
          alt={item.commodity?.name}
          className="w-14 h-14 object-contain"
        />
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            {item.commodity?.name}
          </h3>
          <p className="text-sm text-gray-500">{item.commodity?.unit}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-extrabold text-gray-800">
          {formatCurrency(item.price)}
        </span>
        <span
          className={`flex items-center px-2 py-1 rounded-md text-xs font-medium ${
            item.gap_change === "up"
              ? "bg-red-100 text-red-600"
              : item.gap_change === "down"
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {item.gap_change === "up" && <TrendingUp className="w-3 h-3 mr-1" />}
          {item.gap_change === "down" && (
            <TrendingDown className="w-3 h-3 mr-1" />
          )}
          {item.gap_percentage}%
        </span>
      </div>
    </div>
  );

  // Slider settings
  const sliderSettings = {
    autoplay: true,
    autoplaySpeed: 4000,
    infinite: true,
    arrows: false,
    dots: true,
    pauseOnHover: false,
    fade: true,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* 🔹 Running Ticker */}
      <div className="bg-blue-900 text-white text-sm py-2 overflow-hidden relative">
        <div className="animate-marquee whitespace-nowrap">
          {tickerItems.length > 0
            ? tickerItems.join("   •   ")
            : "Memuat data harga..."}
        </div>
      </div>

      {/* 🔹 Hero Slider */}
      <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
        <Slider {...sliderSettings}>
          {[
            "/images/beras.jpeg",
            "/images/cabai.jpeg",
            "/images/daging.jpg",
            "/images/sayuran.jpg",
          ].map((src, idx) => (
            <div key={idx} className="relative w-full h-[400px] md:h-[500px]">
              <img
                src={src}
                alt="Sembako"
                className="w-full h-full object-cover"
              />
              {/* gradient overlay lebih soft */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
                <h2 className="text-white text-4xl md:text-5xl font-extrabold drop-shadow-lg">
                  
                </h2>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* 🔹 Harga Section */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-16">
        {/* Tabs sumber data */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setSelectedSource("bapanas")}
            className={`px-5 py-2 rounded-lg flex items-center gap-2 ${
              selectedSource === "bapanas"
                ? "bg-blue-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Badan Pangan Nasional
          </button>
          <button
            onClick={() => setSelectedSource("manual")}
            className={`px-5 py-2 rounded-lg flex items-center gap-2 ${
              selectedSource === "manual"
                ? "bg-green-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            <Store className="w-4 h-4" />
            Pasar Manual
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Harga Terkini -{" "}
              {selectedSource === "bapanas"
                ? "Badan Pangan Nasional"
                : "Sumber Pasar Manual"}
            </h2>
            <p className="text-gray-600">
              Update terakhir: {new Date().toLocaleString("id-ID")}
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kategori</option>
              <option value="beras">Beras</option>
              <option value="sayuran">Sayuran</option>
              <option value="daging">Daging</option>
              <option value="bumbu">Bumbu</option>
              <option value="lainnya">Lainnya</option>
            </select>
            <button
              onClick={fetchPrices}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Harga Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : prices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {prices.map((item) => (
              <PriceCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-100 rounded-lg">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {selectedSource === "manual"
                ? "Belum ada data harga dari pasar manual"
                : "Tidak ada data harga tersedia"}
            </p>
          </div>
        )}
      </section>

      {/* 🔹 Footer */}
      <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-gray-400 py-12 mt-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">Pantau Pangan</h3>
            <p className="text-sm leading-relaxed">
              Portal resmi pemantauan harga pangan nasional. Data bersumber dari{" "}
              <strong>Badan Pangan Nasional</strong> dan pasar-pasar di
              Indonesia.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/prices" className="hover:text-white">
                  Harga
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white">
                  Tentang
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Kontak</h4>
            <p className="text-sm">Badan Pangan Nasional</p>
            <p className="text-sm">Email: info@pantaupangan.id</p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-white">
                Facebook
              </a>
              <a href="#" className="hover:text-white">
                Twitter
              </a>
              <a href="#" className="hover:text-white">
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-8">
          © 2025 Pantau Pangan. Data resmi Badan Pangan Nasional.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
