import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, WS_URL } from '../config/api';
import './ScanDetails.css';

const ScanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [logs, setLogs] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [ports, setPorts] = useState([]);
  const [dirsearchResults, setDirsearchResults] = useState({});
  const [scannerResults, setScannerResults] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    fetchScanDetails();
    fetchLogs();
    fetchVulnerabilities();
    fetchPorts();
    fetchDirsearchResults();
    fetchScannerResults();
    
    // Настройка WebSocket для real-time обновлений
    const ws = new WebSocket(`${WS_URL}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log' && data.scan_id === id) {
        setLogs(prev => [...prev, data.message]);
      }
    };

    return () => {
      ws.close();
    };
  }, [id]);

  const fetchScanDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/scans/${id}`);
      setScan(response.data);
    } catch (err) {
      setError('Failed to fetch scan details');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/scans/${id}/logs`);
      setLogs(response.data);
    } catch (err) {
      console.error('Failed to fetch logs');
    }
  };

  const fetchVulnerabilities = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/scans/${id}/vulnerabilities`);
      setVulnerabilities(response.data);
    } catch (err) {
      console.error('Failed to fetch vulnerabilities');
    }
  };

  const fetchPorts = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/scans/${id}/ports`);
      setPorts(response.data);
    } catch (err) {
      console.error('Failed to fetch ports');
    }
  };

  const fetchDirsearchResults = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/scans/${id}/dirsearch`);
      setDirsearchResults(response.data);
    } catch (err) {
      console.error('Failed to fetch dirsearch results');
    }
  };

  const fetchScannerResults = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/scans/${id}/scanner-results`);
      setScannerResults(response.data);
    } catch (err) {
      console.error('Failed to fetch scanner results');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#ffeb3b';
      case 'low': return '#4caf50';
      case 'info': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '💡';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  const groupVulnerabilitiesBySeverity = (vulns) => {
    return vulns.reduce((acc, vuln) => {
      const severity = vuln.severity?.toLowerCase() || 'unknown';
      if (!acc[severity]) acc[severity] = [];
      acc[severity].push(vuln);
      return acc;
    }, {});
  };

  if (loading) return <div className="loading">🔄 Loading scan details...</div>;
  if (error) return <div className="error">❌ {error}</div>;
  if (!scan) return <div className="error">❌ Scan not found</div>;

  const groupedVulns = groupVulnerabilitiesBySeverity(vulnerabilities);

  return (
    <div className="scan-details">
      <div className="scan-details-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
        <h2>🔍 Scan Results: {scan.target}</h2>
        <div className="scan-status">
          <span className={`status ${scan.status}`}>{scan.status}</span>
          <span className="phase">{scan.phase}</span>
          <span className="progress">{scan.progress}%</span>
        </div>
      </div>

      <div className="scan-info">
        <div className="info-grid">
          <div className="info-item">
            <label>🆔 Scan ID:</label>
            <span>{scan.id}</span>
          </div>
          <div className="info-item">
            <label>🎯 Target:</label>
            <span>{scan.target}</span>
          </div>
          <div className="info-item">
            <label>📊 Scan Type:</label>
            <span>{scan.scan_type}</span>
          </div>
          <div className="info-item">
            <label>📅 Created:</label>
            <span>{new Date(scan.created_at).toLocaleString()}</span>
          </div>
          <div className="info-item">
            <label>🔧 CMS Detected:</label>
            <span>{scan.cms_detected || 'None'}</span>
          </div>
          <div className="info-item">
            <label>🛡️ Vulnerabilities:</label>
            <span>{vulnerabilities.length}</span>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === 'vulnerabilities' ? 'active' : ''} 
          onClick={() => setActiveTab('vulnerabilities')}
        >
          🛡️ Vulnerabilities ({vulnerabilities.length})
        </button>
        <button 
          className={activeTab === 'ports' ? 'active' : ''} 
          onClick={() => setActiveTab('ports')}
        >
          🔌 Ports ({ports.length})
        </button>
        <button 
          className={activeTab === 'fuzzing-dir' ? 'active' : ''} 
          onClick={() => setActiveTab('fuzzing-dir')}
        >
          🔍 Fuzzing Dir
        </button>
        <button 
          className={activeTab === 'scanner-results' ? 'active' : ''} 
          onClick={() => setActiveTab('scanner-results')}
        >
          🎯 Scanner Results
        </button>
        <button 
          className={activeTab === 'logs' ? 'active' : ''} 
          onClick={() => setActiveTab('logs')}
        >
          📝 Logs ({logs.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>🛡️ Vulnerabilities</h3>
                <div className="stat-value">{vulnerabilities.length}</div>
                <div className="severity-breakdown">
                  {Object.entries(groupedVulns).map(([severity, vulns]) => (
                    <div key={severity} className="severity-item">
                      <span style={{ color: getSeverityColor(severity) }}>
                        {getSeverityIcon(severity)} {severity}: {vulns.length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="stat-card">
                <h3>🔌 Open Ports</h3>
                <div className="stat-value">{ports.length}</div>
                <div className="port-list">
                  {ports.slice(0, 5).map((port, index) => (
                    <div key={index} className="port-item">
                      {port.port}/{port.protocol} - {port.service}
                    </div>
                  ))}
                  {ports.length > 5 && <div className="more-ports">+{ports.length - 5} more...</div>}
                </div>
              </div>
              <div className="stat-card">
                <h3>📊 Scan Progress</h3>
                <div className="progress-container">
                  <div className="progress-bar-kali">
                    <div 
                      className="progress-fill-kali" 
                      style={{ width: `${scan.progress}%` }}
                    ></div>
                    <div className="progress-glitch"></div>
                  </div>
                  <div className="progress-text">{scan.progress}% - {scan.phase}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vulnerabilities' && (
          <div className="vulnerabilities-tab">
            <div className="vulnerabilities-by-severity">
              {Object.entries(groupedVulns).sort(([a], [b]) => {
                const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
                return (order[a] || 999) - (order[b] || 999);
              }).map(([severity, vulns]) => (
                <div key={severity} className="severity-section">
                  <h3 className="severity-header" style={{ 
                    color: getSeverityColor(severity),
                    borderColor: getSeverityColor(severity)
                  }}>
                    {getSeverityIcon(severity)} {severity.toUpperCase()} ({vulns.length})
                  </h3>
                  <div className="vulnerabilities-list">
                    {vulns.map((vuln, index) => (
                      <div key={index} className="vulnerability-item">
                        <div className="vuln-header">
                          <span className="severity-badge" style={{ backgroundColor: getSeverityColor(vuln.severity) }}>
                            {getSeverityIcon(vuln.severity)} {vuln.severity?.toUpperCase() || 'UNKNOWN'}
                          </span>
                          <h4>{vuln.title}</h4>
                        </div>
                        <div className="vuln-details">
                          <p><strong>🔗 URL:</strong> {vuln.url}</p>
                          <p><strong>📝 Description:</strong> {vuln.description}</p>
                          <p><strong>🔌 Protocol:</strong> {vuln.protocol}</p>
                          <p><strong>📁 Source:</strong> {vuln.source}</p>
                          {vuln.extra_info && <p><strong>ℹ️ Extra Info:</strong> {vuln.extra_info}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {vulnerabilities.length === 0 && (
                <div className="no-data">No vulnerabilities found</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ports' && (
          <div className="ports-tab">
            <div className="ports-list">
              {ports.length === 0 ? (
                <div className="no-data">No open ports found</div>
              ) : (
                <table className="ports-table">
                  <thead>
                    <tr>
                      <th>Port</th>
                      <th>Protocol</th>
                      <th>Status</th>
                      <th>Service</th>
                      <th>Version</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ports.map((port, index) => (
                      <tr key={index}>
                        <td>{port.port}</td>
                        <td>{port.protocol}</td>
                        <td><span className="status open">{port.status}</span></td>
                        <td>{port.service}</td>
                        <td>{port.version}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'fuzzing-dir' && (
          <div className="fuzzing-dir-tab">
            {Object.keys(dirsearchResults).length === 0 ? (
              <div className="no-data">No directory fuzzing results available</div>
            ) : (
              <div className="dirsearch-section">
                <h3>🔍 Directory Search Results (dirsearch)</h3>
                <div className="dirsearch-results">
                  {dirsearchResults.results && dirsearchResults.results.map((result, index) => (
                    <div key={index} className="dirsearch-item">
                      <span className="status-code" style={{
                        backgroundColor: result.status >= 200 && result.status < 300 ? '#4caf50' : 
                                       result.status >= 300 && result.status < 400 ? '#ff9800' : '#f44336'
                      }}>
                        {result.status}
                      </span>
                      <span className="url">{result.url}</span>
                      <span className="size">{result.size} bytes</span>
                    </div>
                  ))}
                  {dirsearchResults.raw_output && (
                    <div className="raw-output">
                      <h4>Raw Output:</h4>
                      <pre className="dirsearch-output">{dirsearchResults.raw_output}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scanner-results' && (
          <div className="scanner-results-tab">
            {Object.keys(scannerResults).length === 0 ? (
              <div className="no-data">No scanner results available</div>
            ) : (
              <div className="scanner-sections">
                {scannerResults.bitrix_scan && (
                  <div className="scanner-section">
                    <h3>🎯 Bitrix Scanner Results</h3>
                    <pre className="scanner-output">{scannerResults.bitrix_scan}</pre>
                  </div>
                )}
                
                {scannerResults.wpscan && (
                  <div className="scanner-section">
                    <h3>📝 WPScan Results</h3>
                    <pre className="scanner-output">{scannerResults.wpscan}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-tab">
            <div className="logs-container">
              {logs.length === 0 ? (
                <div className="no-data">No logs available</div>
              ) : (
                <div className="logs-list">
                  {logs.map((log, index) => (
                    <div key={index} className="log-entry">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanDetails;
