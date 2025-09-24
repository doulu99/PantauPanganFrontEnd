// ==========================================
// 10. src/hooks/useSembako.js - Custom Hook
// ==========================================
import { useState, useEffect } from 'react';
import { sembakoApi } from '../services/sembakoApi';

export const useSembako = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await sembakoApi.getAll(filters);
      setData(response.data.data || []);
      setPagination(response.data.pagination || {});
      setError(null);
    } catch (err) {
      console.error('useSembako error:', err);
      setError(err.response?.data?.message || 'Gagal memuat data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return {
    data,
    loading,
    error,
    pagination,
    refetch: fetchData,
  };
};

export const useSembakoPublic = (province = '') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await sembakoApi.getPublicLatest(province);
      setData(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('useSembakoPublic error:', err);
      setError('Gagal memuat data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [province]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};