// ==========================================
// 1. src/App.jsx - Updated dengan routes sembako
// ==========================================
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Existing Pages
import PublicHomePage from "./pages/PublicHomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import MarketPricesPage from "./pages/MarketPricesPage";
import OverridesPage from "./pages/OverridesPage";
import PricesPage from "./pages/PricesPage";
import RegionsPage from "./pages/RegionsPage";

// NEW: Sembako Pages
import SembakoPage from "./pages/SembakoPage";
import SembakoAdminPage from "./pages/SembakoAdminPage";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicHomePage />} />
              <Route path="/home" element={<PublicHomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* NEW: Public Sembako Route */}
              <Route path="/sembako" element={<SembakoPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* NEW: Admin Sembako Route */}
              <Route
                path="/admin/sembako"
                element={
                  <ProtectedRoute>
                    <SembakoAdminPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Existing Protected Routes (keep for backward compatibility) */}
              <Route
                path="/market-prices"
                element={
                  <ProtectedRoute>
                    <MarketPricesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/overrides"
                element={
                  <ProtectedRoute>
                    <OverridesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prices"
                element={
                  <ProtectedRoute>
                    <PricesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/regions"
                element={
                  <ProtectedRoute>
                    <RegionsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;