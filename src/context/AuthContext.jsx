// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import config from "../config/config.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");

    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [user, token]);

  const login = (data) => {
    setUser(data.user);
    setToken(data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
  };

  // ✅ Tambahkan fungsi register
  const register = async (formData) => {
    try {
      const res = await axios.post(`${config.API_URL}/auth/register`, formData);
      return { success: true, data: res.data };
    } catch (err) {
      console.error("Register error:", err.response?.data || err.message);
      return { success: false, error: err.response?.data || "Registration failed" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);