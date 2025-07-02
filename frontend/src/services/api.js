import { API_BASE_URL } from '../config/api.js';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', errorText);
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
  }
  return response.json();
};

const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    console.log(`🌐 API Call: ${url}`);
    if (options.body) {
      console.log('📤 Request Body:', options.body);
    }
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    console.error(`❌ API Error for ${url}:`, error);
    throw error;
  }
};

export const api = {
  // Health check
  async health() {
    return fetchWithErrorHandling(`${API_BASE_URL}/health`);
  },

  // Scans
  async getScans() {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/scans`);
  },

  async createScan(data) {
    // Для AKUMA сканера используем простой формат
    const target = data.target.split('\n')[0].trim(); // Берём первую цель
    
    const akumaData = {
      target: target
    };

    console.log('🎯 Sending AKUMA scan request:', akumaData);

    return fetchWithErrorHandling(`${API_BASE_URL}/api/akuma-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(akumaData),
    });
  },

  async getScan(scanId) {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/scans/${scanId}`);
  },

  async getScanLogs(scanId) {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/scans/${scanId}/logs`);
  },

  // Statistics
  async getStats() {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/stats`);
  },

  // Delete scan
  async deleteScan(scanId) {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/scans/${scanId}`, {
      method: 'DELETE',
    });
  }
};

// Экспортируем также для отладки
window.AKUMA_API = api;
window.AKUMA_API_BASE = API_BASE_URL;
