// ==========================================
// src/hooks/useBPNData.js - Custom Hook for BPN Data
// ==========================================
import { useState, useEffect, useCallback } from 'react';

export const useBPNData = () => {
  const [bpnData, setBpnData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [bpnHealth, setBpnHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBPNData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch BPN prices
      const bpnResponse = await fetch('/api/bpn/prices', {
        headers: { 'Accept': 'application/json' }
      });

      if (bpnResponse.ok) {
        const bpnResult = await bpnResponse.json();
        if (bpnResult.success) {
          setBpnData(bpnResult);
        }
      }

      // Fetch comparison
      const comparisonResponse = await fetch('/api/bpn/comparison', {
        headers: { 'Accept': 'application/json' }
      });

      if (comparisonResponse.ok) {
        const comparisonResult = await comparisonResponse.json();
        if (comparisonResult.success) {
          setComparisonData(comparisonResult.data.comparison);
        }
      }

      // Fetch health
      const healthResponse = await fetch('/api/bpn/health', {
        headers: { 'Accept': 'application/json' }
      });

      if (healthResponse.ok) {
        const healthResult = await healthResponse.json();
        setBpnHealth(healthResult);
      }

    } catch (err) {
      console.error('BPN fetch error:', err);
      setError(err.message);
      setBpnData(null);
      setComparisonData(null);
      setBpnHealth({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBPNData();
  }, [fetchBPNData]);

  return {
    bpnData,
    comparisonData,
    bpnHealth,
    loading,
    error,
    refetch: fetchBPNData
  };
};