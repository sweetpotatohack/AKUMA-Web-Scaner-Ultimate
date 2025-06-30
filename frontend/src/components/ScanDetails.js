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
import React, { useState, useEffect, useRef } from 'react';

const ScanDetails = ({ scan, onBack }) => {
  const [scanData, setScanData] = useState(scan);
  const [logs, setLogs] = useState([]);
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [ports, setPorts] = useState([]);
  const logsEndRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!scan?.id) return;

    // Connect to WebSocket for real-time updates
    const wsUrl = `ws://localhost:8000/ws/scan/${scan.id}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected for scan:', scan.id);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'log') {
        setLogs(prev => [...prev, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          level: data.level || 'info',
          message: data.message,
          phase: data.phase
        }]);
      } else if (data.type === 'progress') {
        setScanData(prev => ({
          ...prev,
          progress: data.progress,
          status: data.status,
          current_phase: data.current_phase
        }));
      } else if (data.type === 'vulnerability') {
        setScanData(prev => ({
          ...prev,
          vulnerabilities: [...(prev.vulnerabilities || []), data.vulnerability]
        }));
      } else if (data.type === 'ports') {
        setPorts(data.ports || []);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Fetch initial scan data
    fetchScanDetails();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [scan?.id]);

  useEffect(() => {
    // Auto-scroll logs to bottom
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const fetchScanDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/scans/${scan.id}`);
      if (response.ok) {
        const data = await response.json();
        setScanData(data);
        
        // Fetch ports
        const portsResponse = await fetch(`http://localhost:8000/api/scans/${scan.id}/ports`);
        if (portsResponse.ok) {
          const portsData = await portsResponse.json();
          setPorts(portsData);
        }
      }
    } catch (error) {
      console.error('Error fetching scan details:', error);
    }
  };

  const getLogLevelClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'error': return 'log-error';
      case 'warning': return 'log-warning';
      case 'success': return 'log-success';
      case 'info': return 'log-info';
      default: return 'log-default';
    }
  };

  const getLogIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📝';
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
      case 'critical': return 'var(--error)';
      case 'high': return 'var(--warning)';
      case 'medium': return 'var(--info)';
      case 'low': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getPortStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'var(--success)';
      case 'closed': return 'var(--error)';
      case 'filtered': return 'var(--warning)';
      default: return 'var(--text-secondary)';
    }
  };

  if (!scanData) {
    return (
      <div className="scan-details">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading scan details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scan-details">
      {/* Header */}
      <div className="card mb-3">
        <div className="card-header">
          <div className="scan-header">
            <button className="btn btn-outline" onClick={onBack}>
              ← Back to Dashboard
            </button>
            <div className="scan-title">
              <h2>{scanData.target}</h2>
              <span className={`status-badge ${scanData.status === 'running' ? 'status-running' : 
                scanData.status === 'completed' ? 'status-completed' : 'status-failed'}`}>
                {scanData.status}
              </span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        {scanData.status === 'running' && (
          <div className="progress-section">
            <div className="progress-info">
              <span>Progress: {scanData.progress || 0}%</span>
              <span>Phase: {scanData.current_phase || 'Initializing'}</span>
            </div>
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${scanData.progress || 0}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="detail-tabs mb-3">
        {['overview', 'logs', 'vulnerabilities', 'ports'].map(tab => (
          <button
            key={tab}
            className={`detail-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '📊'} 
            {tab === 'logs' && '📜'} 
            {tab === 'vulnerabilities' && '🛡️'} 
            {tab === 'ports' && '🔌'} 
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon">📋</div>
                Scan Information
              </div>
            </div>
            <div className="scan-info">
              <div className="info-row">
                <span className="info-label">Target:</span>
                <span className="info-value">{scanData.target}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Scan Type:</span>
                <span className="info-value">{scanData.scan_type || 'Web Vulnerability'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Created:</span>
                <span className="info-value">
                  {new Date(scanData.created_at).toLocaleString()}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Duration:</span>
                <span className="info-value">
                  {scanData.completed_at 
                    ? `${Math.round((new Date(scanData.completed_at) - new Date(scanData.created_at)) / 1000)}s`
                    : 'In progress'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon">📊</div>
                Statistics
              </div>
            </div>
            <div className="stats-overview">
              <div className="stat-item">
                <div className="stat-value text-error">
                  {scanData.vulnerabilities?.filter(v => v.severity === 'critical').length || 0}
                </div>
                <div className="stat-label">Critical</div>
              </div>
              <div className="stat-item">
                <div className="stat-value text-warning">
                  {scanData.vulnerabilities?.filter(v => v.severity === 'high').length || 0}
                </div>
                <div className="stat-label">High</div>
              </div>
              <div className="stat-item">
                <div className="stat-value text-info">
                  {scanData.vulnerabilities?.filter(v => v.severity === 'medium').length || 0}
                </div>
                <div className="stat-label">Medium</div>
              </div>
              <div className="stat-item">
                <div className="stat-value text-success">
                  {scanData.vulnerabilities?.filter(v => v.severity === 'low').length || 0}
                </div>
                <div className="stat-label">Low</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">📜</div>
              Real-time Logs
            </div>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setLogs([])}
            >
              Clear Logs
            </button>
          </div>
          <div className="logs-container">
            {logs.length === 0 ? (
              <div className="empty-logs">
                <div className="empty-icon">📜</div>
                <p>No logs available yet</p>
              </div>
            ) : (
              <div className="logs-list">
                {logs.map(log => (
                  <div key={log.id} className={`log-entry ${getLogLevelClass(log.level)}`}>
                    <div className="log-header">
                      <span className="log-icon">{getLogIcon(log.level)}</span>
                      <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                      {log.phase && <span className="log-phase">{log.phase}</span>}
                    </div>
                    <div className="log-message">{log.message}</div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'vulnerabilities' && (
        <div className="vulnerabilities-section">
          {!scanData.vulnerabilities || scanData.vulnerabilities.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">🛡️</div>
                <h3>No vulnerabilities found</h3>
                <p>This scan hasn't discovered any security issues yet</p>
              </div>
            </div>
          ) : (
            <div className="vulnerabilities-grid">
              {scanData.vulnerabilities.map((vuln, index) => (
                <div key={index} className="card vulnerability-card">
                  <div className="vulnerability-header">
                    <div className="vulnerability-title">
                      <span 
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(vuln.severity) }}
                      >
                        {vuln.severity}
                      </span>
                      <h4>{vuln.title || vuln.name}</h4>
                    </div>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedVuln(selectedVuln === index ? null : index)}
                    >
                      {selectedVuln === index ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>
                  
                  <p className="vulnerability-description">
                    {vuln.description}
                  </p>
                  
                  {selectedVuln === index && (
                    <div className="vulnerability-details">
                      {vuln.url && (
                        <div className="detail-item">
                          <strong>URL:</strong> {vuln.url}
                        </div>
                      )}
                      {vuln.method && (
                        <div className="detail-item">
                          <strong>Method:</strong> {vuln.method}
                        </div>
                      )}
                      {vuln.parameter && (
                        <div className="detail-item">
                          <strong>Parameter:</strong> {vuln.parameter}
                        </div>
                      )}
                      {vuln.payload && (
                        <div className="detail-item">
                          <strong>Payload:</strong> 
                          <code className="payload-code">{vuln.payload}</code>
                        </div>
                      )}
                      {vuln.solution && (
                        <div className="detail-item">
                          <strong>Solution:</strong> {vuln.solution}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ports' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">🔌</div>
              Open Ports
            </div>
          </div>
          {ports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔌</div>
              <h3>No port information</h3>
              <p>Port scanning data is not available for this scan</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
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
                      <td><strong>{port.port}</strong></td>
                      <td>{port.protocol || 'TCP'}</td>
                      <td>
                        <span 
                          className="port-status"
                          style={{ color: getPortStatusColor(port.status) }}
                        >
                          {port.status}
                        </span>
                      </td>
                      <td>{port.service || 'Unknown'}</td>
                      <td>{port.version || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .scan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .scan-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .scan-title h2 {
          margin: 0;
          color: var(--text-primary);
        }

        .progress-section {
          padding: 1rem 0 0;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .detail-tabs {
          display: flex;
          gap: 2px;
          background: var(--bg-secondary);
          border-radius: 8px;
          padding: 4px;
        }

        .detail-tab {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 12px 20px;
          cursor: pointer;
          font-family: inherit;
          font-size: 1rem;
          border-radius: 6px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .detail-tab:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .detail-tab.active {
          background: var(--accent-cyan);
          color: var(--bg-primary);
        }

        .scan-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-primary);
        }

        .info-label {
          font-weight: 500;
          color: var(--text-secondary);
        }

        .info-value {
          color: var(--text-primary);
          font-weight: 500;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: 8px;
        }

        .stat-item .stat-value {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .stat-item .stat-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .logs-container {
          max-height: 500px;
          overflow-y: auto;
          background: var(--bg-primary);
          border-radius: 8px;
          padding: 1rem;
        }

        .logs-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .log-entry {
          padding: 0.75rem;
          border-radius: 6px;
          border-left: 4px solid var(--border-primary);
        }

        .log-error {
          background: rgba(255, 71, 87, 0.1);
          border-left-color: var(--error);
        }

        .log-warning {
          background: rgba(255, 165, 2, 0.1);
          border-left-color: var(--warning);
        }

        .log-success {
          background: rgba(46, 213, 115, 0.1);
          border-left-color: var(--success);
        }

        .log-info {
          background: rgba(74, 158, 255, 0.1);
          border-left-color: var(--info);
        }

        .log-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .log-timestamp {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .log-phase {
          font-size: 0.8rem;
          color: var(--accent-cyan);
          background: rgba(0, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .log-message {
          font-size: 0.9rem;
          color: var(--text-primary);
          font-family: 'Courier New', monospace;
        }

        .vulnerabilities-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .vulnerability-card {
          border-left: 4px solid var(--accent-cyan);
        }

        .vulnerability-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .vulnerability-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .vulnerability-title h4 {
          margin: 0;
          color: var(--text-primary);
        }

        .severity-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
          color: white;
          text-transform: uppercase;
        }

        .vulnerability-description {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .vulnerability-details {
          background: var(--bg-primary);
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .detail-item {
          margin-bottom: 0.75rem;
        }

        .detail-item strong {
          color: var(--accent-cyan);
          display: inline-block;
          min-width: 100px;
        }

        .payload-code {
          background: var(--bg-tertiary);
          padding: 0.5rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          display: block;
          margin-top: 0.5rem;
          color: var(--accent-orange);
        }

        .port-status {
          font-weight: bold;
        }

        .empty-logs {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
        }

        @media (max-width: 768px) {
          .scan-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .detail-tabs {
            overflow-x: auto;
          }

          .stats-overview {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ScanDetails;
