import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 API Call starting...');
        const result = await apiCall();
        console.log('✅ API Call success:', result);
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        console.error('❌ API Call failed:', err);
        if (mounted) {
          setError(err.message || 'An error occurred');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

export const usePolling = (apiCall, interval = 5000, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let intervalId;

    const fetchData = async () => {
      try {
        console.log('🔄 Polling API call...');
        const result = await apiCall();
        console.log('✅ Polling success:', result);
        if (mounted) {
          setData(result);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error('❌ Polling failed:', err);
        if (mounted) {
          setError(err.message || 'An error occurred');
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchData();
    
    // Set up polling
    intervalId = setInterval(fetchData, interval);

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, dependencies);

  return { data, loading, error };
};
