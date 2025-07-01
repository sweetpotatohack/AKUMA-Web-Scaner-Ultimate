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
    // Преобразуем данные frontend в формат backend
    const targets = data.target.split('\n').map(t => t.trim()).filter(t => t);
    const scanTypes = [data.scan_type || 'comprehensive'];
    const description = data.name || 'AKUMA Scan';

    const backendData = {
      targets: targets,
      scanTypes: scanTypes,
      description: description
    };

    console.log('🎯 Sending scan request:', backendData);

    return fetchWithErrorHandling(`${API_BASE_URL}/api/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
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

  async getScanProgress(scanId) {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/scans/${scanId}/progress`);
  },

  // Statistics
  async getStats() {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/stats`);
  },

  // Vulnerabilities
  async getVulnerabilities() {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/vulnerabilities`);
  },

  // Targets
  async uploadTargets(file) {
    const formData = new FormData();
    formData.append('file', file);
    return fetchWithErrorHandling(`${API_BASE_URL}/api/upload-targets`, {
      method: 'POST',
      body: formData,
    });
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
  },

  // Notifications
  async getNotificationSettings() {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/notifications/settings`);
  },

  async updateNotificationSettings(settings) {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/notifications/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
  },

  async testNotification(type) {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/notifications/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });
  }
};

// Экспортируем также для отладки
window.AKUMA_API = api;
window.AKUMA_API_BASE = API_BASE_URL;
