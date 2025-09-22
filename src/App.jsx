// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Pages
import PublicHomePage from "./pages/PublicHomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import MarketPricesPage from "./pages/MarketPricesPage";
import OverridesPage from "./pages/OverridesPage";
import PricesPage from "./pages/PricesPage";
import RegionsPage from "./pages/RegionsPage";

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
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
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