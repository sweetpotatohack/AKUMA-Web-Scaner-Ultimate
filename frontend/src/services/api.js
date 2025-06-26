const API_BASE = 'http://localhost:8000';

export const api = {
  // Health check
  async health() {
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
  },

  // Scans
  async getScans() {
    const response = await fetch(`${API_BASE}/scans`);
    return response.json();
  },

  async createScan(data) {
    const response = await fetch(`${API_BASE}/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
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
  },

  // Statistics
  async getStats() {
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
  },

  // Reports
  async generateReport(scanId, format = 'html') {
    const response = await fetch(`${API_BASE}/scans/${scanId}/report?format=${format}`);
    if (format === 'html') {
      return response.text();
    }
    return response.blob();
  },

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
