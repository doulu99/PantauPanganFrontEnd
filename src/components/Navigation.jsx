import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Package, LogOut, User, BarChart3, TrendingUp, Store, PlusCircle, BarChart2, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const closeMenus = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/assets/logo3.png" 
                alt="Logo" 
                className="h-10 w-auto object-contain" 
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>

            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Dashboard
                </Link>

                <Link 
                  to="/prices" 
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/prices') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Harga Nasional
                </Link>

                <Link 
                  to="/market-prices" 
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/market-prices') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Store className="w-4 h-4 mr-1" />
                  Harga Pasar
                </Link>

                <Link 
                  to="/profile" 
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/profile') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4 mr-1" />
                  Profile
                </Link>

                <button 
                  onClick={handleLogout} 
                  className="flex items-center px-3 py-2 text-gray-500 hover:text-red-600 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}

            {!user && (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              onClick={closeMenus}
              className={`block px-3 py-2 rounded-md transition-colors ${
                isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>

            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={closeMenus}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive('/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>

                <Link 
                  to="/prices" 
                  onClick={closeMenus}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive('/prices') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Harga Nasional
                </Link>

                <Link 
                  to="/market-prices" 
                  onClick={closeMenus}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive('/market-prices') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Store className="w-4 h-4 mr-2" />
                  Harga Pasar
                </Link>

                <Link 
                  to="/profile" 
                  onClick={closeMenus}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive('/profile') ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>

                <button 
                  onClick={() => {
                    closeMenus();
                    handleLogout();
                  }} 
                  className="flex items-center w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={closeMenus}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={closeMenus}
                  className="block px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;