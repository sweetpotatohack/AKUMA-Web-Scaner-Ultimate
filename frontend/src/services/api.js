<<<<<<< HEAD
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
=======
const API_BASE = 'http://localhost:8000';
>>>>>>> 7679d51fe1c7f06685c0b2d81391ae0a6c9638b8

export const api = {
  // Health check
  async health() {
<<<<<<< HEAD
    return fetchWithErrorHandling(`${API_BASE_URL}/health`);
=======
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
>>>>>>> 7679d51fe1c7f06685c0b2d81391ae0a6c9638b8
  },

  // Scans
  async getScans() {
<<<<<<< HEAD
    return fetchWithErrorHandling(`${API_BASE_URL}/api/scans`);
  },

  async createScan(data) {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/scans`, {
=======
    const response = await fetch(`${API_BASE}/scans`);
    return response.json();
  },

  async createScan(data) {
    const response = await fetch(`${API_BASE}/scans`, {
>>>>>>> 7679d51fe1c7f06685c0b2d81391ae0a6c9638b8
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
<<<<<<< HEAD
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
=======
    return response.json();
  },

  async getScan(scanId) {
    const response = await fetch(`${API_BASE}/scans/${scanId}`);
    return response.json();
  },

  async getScanProgress(scanId) {
    const response = await fetch(`${API_BASE}/scans/${scanId}/progress`);
    return response.json();
  },

  async getScanResults(scanId) {
    const response = await fetch(`${API_BASE}/scans/${scanId}/results`);
    return response.json();
>>>>>>> 7679d51fe1c7f06685c0b2d81391ae0a6c9638b8
  },

  // Statistics
  async getStats() {
<<<<<<< HEAD
    return fetchWithErrorHandling(`${API_BASE_URL}/api/stats`);
  },

  // Vulnerabilities
  async getVulnerabilities() {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/vulnerabilities`);
=======
    const response = await fetch(`${API_BASE}/stats`);
    return response.json();
  },

  // Targets
  async uploadTargets(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/upload-targets`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
>>>>>>> 7679d51fe1c7f06685c0b2d81391ae0a6c9638b8
  },

  // Reports
  async generateReport(scanId, format = 'html') {
<<<<<<< HEAD
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
    
=======
    const response = await fetch(`${API_BASE}/scans/${scanId}/report?format=${format}`);
>>>>>>> 7679d51fe1c7f06685c0b2d81391ae0a6c9638b8
    if (format === 'html') {
      return response.text();
    }
    return response.blob();
  },

<<<<<<< HEAD
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
=======
  // Notifications
  async getNotificationSettings() {
    const response = await fetch(`${API_BASE}/notifications/settings`);
    return response.json();
  },

  async updateNotificationSettings(settings) {
    const response = await fetch(`${API_BASE}/notifications/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    return response.json();
  },

  async testNotification(type) {
    const response = await fetch(`${API_BASE}/notifications/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });
    return response.json();
  }
};
>>>>>>> 7679d51fe1c7f06685c0b2d81391ae0a6c9638b8
