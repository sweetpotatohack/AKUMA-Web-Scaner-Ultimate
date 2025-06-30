import { API_BASE_URL } from '../config/api.js';

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    console.log(`🌐 API Call: ${url}`);
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
    return fetchWithErrorHandling(`${API_BASE_URL}/api/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  async getScan(scanId) {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/scans/${scanId}`);
  },

  async getScanLogs(scanId) {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/scans/${scanId}/logs`);
  },

  async getScanPorts(scanId) {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/scans/${scanId}/ports`);
  },

  async getScanVulnerabilities(scanId) {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/scans/${scanId}/vulnerabilities`);
  },

  async getScanResults(scanId) {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/scans/${scanId}`);
  },

  // Statistics
  async getStats() {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/stats`);
  },

  // Vulnerabilities
  async getVulnerabilities() {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/vulnerabilities`);
  },

  // Reports
  async generateReport(scanId, format = 'html') {
    const response = await fetch(`${API_BASE_URL}/api/scans/${scanId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ format }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    if (format === 'html') {
      return response.text();
    }
    return response.blob();
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
