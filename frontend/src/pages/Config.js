import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/ScanDetails.css';
import { API_BASE_URL } from '../config/api';

const Config = () => {
  const [config, setConfig] = useState({
    scan_timeout: 3600,
    max_concurrent_scans: 3,
    nmap_options: '-sS -sV -O',
    dirsearch_wordlist: '/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt',
    user_agent: 'AKUMA-Scanner/2.0',
    request_delay: 0.1,
    thread_count: 10,
    enable_aggressive_scan: false,
    enable_service_detection: true,
    enable_os_detection: true,
    save_raw_output: true,
    auto_update_wordlists: false,
    notification_email: '',
    webhook_url: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/config`);
      if (response.ok) {
        const data = await response.json();
        setConfig({ ...config, ...data });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        setMessage('✅ Configuration saved successfully!');
      } else {
        setMessage('❌ Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage('❌ Error saving configuration');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const resetToDefaults = () => {
    setConfig({
      scan_timeout: 3600,
      max_concurrent_scans: 3,
      nmap_options: '-sS -sV -O',
      dirsearch_wordlist: '/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt',
      user_agent: 'AKUMA-Scanner/2.0',
      request_delay: 0.1,
      thread_count: 10,
      enable_aggressive_scan: false,
      enable_service_detection: true,
      enable_os_detection: true,
      save_raw_output: true,
      auto_update_wordlists: false,
      notification_email: '',
      webhook_url: ''
    });
    setMessage('🔄 Configuration reset to defaults');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleInputChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) return <div className="loading">🔄 Loading configuration...</div>;

  return (
    <div className="scan-details">
      <div className="scan-details-header">
        <Link to="/dashboard" className="back-button">← Back to Dashboard</Link>
        <h2>⚙️ Scanner Configuration</h2>
        <div className="scan-status">
          <span className="status completed">Configuration Panel</span>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="config-content">
        <div className="config-grid">
          <div className="config-section">
            <h3>🔧 General Settings</h3>
            
            <div className="config-item">
              <label>Scan Timeout (seconds):</label>
              <input 
                type="number" 
                value={config.scan_timeout}
                onChange={(e) => handleInputChange('scan_timeout', parseInt(e.target.value))}
                min="60"
                max="7200"
              />
              <small>Maximum time allowed for a single scan</small>
            </div>

            <div className="config-item">
              <label>Max Concurrent Scans:</label>
              <input 
                type="number" 
                value={config.max_concurrent_scans}
                onChange={(e) => handleInputChange('max_concurrent_scans', parseInt(e.target.value))}
                min="1"
                max="10"
              />
              <small>Number of scans that can run simultaneously</small>
            </div>

            <div className="config-item">
              <label>Thread Count:</label>
              <input 
                type="number" 
                value={config.thread_count}
                onChange={(e) => handleInputChange('thread_count', parseInt(e.target.value))}
                min="1"
                max="50"
              />
              <small>Number of threads for scanning operations</small>
            </div>

            <div className="config-item">
              <label>Request Delay (seconds):</label>
              <input 
                type="number" 
                step="0.1"
                value={config.request_delay}
                onChange={(e) => handleInputChange('request_delay', parseFloat(e.target.value))}
                min="0"
                max="5"
              />
              <small>Delay between HTTP requests to avoid rate limiting</small>
            </div>
          </div>

          <div className="config-section">
            <h3>🌐 Network Scanning</h3>
            
            <div className="config-item">
              <label>Nmap Options:</label>
              <input 
                type="text" 
                value={config.nmap_options}
                onChange={(e) => handleInputChange('nmap_options', e.target.value)}
                placeholder="-sS -sV -O"
              />
              <small>Nmap command line options for port scanning</small>
            </div>

            <div className="config-item">
              <label>User Agent:</label>
              <input 
                type="text" 
                value={config.user_agent}
                onChange={(e) => handleInputChange('user_agent', e.target.value)}
                placeholder="AKUMA-Scanner/2.0"
              />
              <small>User agent string for HTTP requests</small>
            </div>

            <div className="config-item checkbox-item">
              <label>
                <input 
                  type="checkbox" 
                  checked={config.enable_service_detection}
                  onChange={(e) => handleInputChange('enable_service_detection', e.target.checked)}
                />
                Enable Service Detection
              </label>
              <small>Detect services running on open ports</small>
            </div>

            <div className="config-item checkbox-item">
              <label>
                <input 
                  type="checkbox" 
                  checked={config.enable_os_detection}
                  onChange={(e) => handleInputChange('enable_os_detection', e.target.checked)}
                />
                Enable OS Detection
              </label>
              <small>Attempt to identify target operating system</small>
            </div>

            <div className="config-item checkbox-item">
              <label>
                <input 
                  type="checkbox" 
                  checked={config.enable_aggressive_scan}
                  onChange={(e) => handleInputChange('enable_aggressive_scan', e.target.checked)}
                />
                Enable Aggressive Scanning
              </label>
              <small>Use more intensive scanning techniques (may be detected)</small>
            </div>
          </div>

          <div className="config-section">
            <h3>📁 Directory Fuzzing</h3>
            
            <div className="config-item">
              <label>Dirsearch Wordlist:</label>
              <input 
                type="text" 
                value={config.dirsearch_wordlist}
                onChange={(e) => handleInputChange('dirsearch_wordlist', e.target.value)}
                placeholder="/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt"
              />
              <small>Path to wordlist file for directory fuzzing</small>
            </div>

            <div className="config-item checkbox-item">
              <label>
                <input 
                  type="checkbox" 
                  checked={config.auto_update_wordlists}
                  onChange={(e) => handleInputChange('auto_update_wordlists', e.target.checked)}
                />
                Auto-update Wordlists
              </label>
              <small>Automatically download and update wordlists</small>
            </div>
          </div>

          <div className="config-section">
            <h3>💾 Output & Logging</h3>
            
            <div className="config-item checkbox-item">
              <label>
                <input 
                  type="checkbox" 
                  checked={config.save_raw_output}
                  onChange={(e) => handleInputChange('save_raw_output', e.target.checked)}
                />
                Save Raw Tool Output
              </label>
              <small>Keep original output from scanning tools</small>
            </div>
          </div>

          <div className="config-section">
            <h3>📧 Notifications</h3>
            
            <div className="config-item">
              <label>Notification Email:</label>
              <input 
                type="email" 
                value={config.notification_email}
                onChange={(e) => handleInputChange('notification_email', e.target.value)}
                placeholder="admin@example.com"
              />
              <small>Email address for scan completion notifications</small>
            </div>

            <div className="config-item">
              <label>Webhook URL:</label>
              <input 
                type="url" 
                value={config.webhook_url}
                onChange={(e) => handleInputChange('webhook_url', e.target.value)}
                placeholder="https://hooks.slack.com/..."
              />
              <small>Webhook URL for external notifications</small>
            </div>
          </div>
        </div>

        <div className="config-actions">
          <button 
            className="save-button"
            onClick={saveConfig}
            disabled={saving}
          >
            {saving ? '💾 Saving...' : '💾 Save Configuration'}
          </button>
          
          <button 
            className="reset-button"
            onClick={resetToDefaults}
            disabled={saving}
          >
            🔄 Reset to Defaults
          </button>
        </div>

        <div className="config-info">
          <h3>ℹ️ Configuration Info</h3>
          <div className="info-grid">
            <div className="info-item">
              <span>Config File:</span>
              <code>/etc/akuma/scanner.conf</code>
            </div>
            <div className="info-item">
              <span>Log Directory:</span>
              <code>/var/log/akuma/</code>
            </div>
            <div className="info-item">
              <span>Wordlists Directory:</span>
              <code>/usr/share/wordlists/</code>
            </div>
            <div className="info-item">
              <span>Tools Directory:</span>
              <code>/opt/akuma/tools/</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Config;
