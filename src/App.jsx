import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Existing Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PricesPage from './pages/PricesPage';
import ProfilePage from './pages/ProfilePage';
import PriceComparisonPage from './pages/PriceComparisonPage';

// New Market Price Pages
import ManualPriceInputPage from './pages/ManualPriceInputPage';
import MarketPriceAnalyticsPage from './pages/MarketPriceAnalyticsPage';

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="prices" element={<PricesPage />} />
            <Route path="comparison" element={<PriceComparisonPage />} />
            <Route path="profile" element={<ProfilePage />} />
            
            {/* Market Price Routes */}
            <Route path="market-prices" element={<ManualPriceInputPage />} />
            <Route path="market-prices/input" element={<ManualPriceInputPage />} />
            <Route path="market-prices/analytics" element={<MarketPriceAnalyticsPage />} />
          </Route>
        </Route>
        
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;