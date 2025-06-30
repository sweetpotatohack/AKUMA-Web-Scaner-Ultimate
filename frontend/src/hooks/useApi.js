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
<<<<<<< HEAD
        console.log('🔄 API Call starting...');
        const result = await apiCall();
        console.log('✅ API Call success:', result);
=======
        const result = await apiCall();
>>>>>>> 7679d51fe1c7f06685c0b2d81391ae0a6c9638b8
        if (mounted) {
          setData(result);
        }
      } catch (err) {
<<<<<<< HEAD
        console.error('❌ API Call failed:', err);
=======
>>>>>>> 7679d51fe1c7f06685c0b2d81391ae0a6c9638b8
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
<<<<<<< HEAD
        console.log('🔄 Polling API call...');
        const result = await apiCall();
        console.log('✅ Polling success:', result);
=======
        const result = await apiCall();
>>>>>>> 7679d51fe1c7f06685c0b2d81391ae0a6c9638b8
        if (mounted) {
          setData(result);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
<<<<<<< HEAD
        console.error('❌ Polling failed:', err);
=======
>>>>>>> 7679d51fe1c7f06685c0b2d81391ae0a6c9638b8
        if (mounted) {
          setError(err.message || 'An error occurred');
          setLoading(false);
        }
      }
    };

<<<<<<< HEAD
    // Initial fetch
    fetchData();
    
    // Set up polling
=======
    fetchData();
>>>>>>> 7679d51fe1c7f06685c0b2d81391ae0a6c9638b8
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
