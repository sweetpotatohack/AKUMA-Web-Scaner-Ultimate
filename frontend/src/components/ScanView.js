import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ScanView.css';

const ScanView = () => {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);
  const logsEndRef = useRef(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  useEffect(() => {
    const fetchScanData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/scans/${scanId}`);
        if (response.ok) {
          const scanData = await response.json();
          setScan(scanData);
        }
      } catch (error) {
        console.error('Error fetching scan data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScanData();
    
    // Устанавливаем WebSocket соединение для логов в реальном времени
    const connectWebSocket = () => {
      wsRef.current = new WebSocket('ws://localhost:8000/ws');
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'log' && data.scan_id === scanId) {
          setLogs(prevLogs => [...prevLogs, data.message]);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        setTimeout(connectWebSocket, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connectWebSocket();

    // Периодическое обновление данных сканирования
    const interval = setInterval(fetchScanData, 2000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [scanId]);

  const handleClearLogs = () => {
    setLogs([]);
  };

  if (loading) {
    return (
      <div className="scan-view">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading scan details...</p>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="scan-view">
        <div className="error">
          <h2>Scan not found</h2>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="overview-tab">
      <div className="scan-header">
        <div className="scan-info">
          <h2>{scan.target}</h2>
          <div className="scan-meta">
            <span className={`status ${scan.status}`}>{scan.status.toUpperCase()}</span>
            <span className="scan-type">{scan.scan_type}</span>
            <span className="created-at">Created: {new Date(scan.created_at).toLocaleString()}</span>
            {scan.completed_at && (
              <span className="completed-at">Completed: {new Date(scan.completed_at).toLocaleString()}</span>
            )}
          </div>
        </div>
        
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${scan.progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{scan.progress}%</span>
          {scan.phase && <span className="phase-text">Phase: {scan.phase}</span>}
        </div>
      </div>

      <div className="summary-cards">
        <div className="card">
          <h3>Vulnerabilities</h3>
          <div className="card-number">{scan.vulnerabilities?.length || 0}</div>
        </div>
        <div className="card">
          <h3>Open Ports</h3>
          <div className="card-number">{scan.ports?.length || 0}</div>
        </div>
        <div className="card">
          <h3>CMS Detected</h3>
          <div className="card-text">{scan.cms_detected || 'None'}</div>
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="logs-tab">
      <div className="logs-header">
        <h3>🔥 Real-time Logs</h3>
        <button onClick={handleClearLogs} className="btn btn-secondary">
          Clear Logs
        </button>
      </div>
      <div className="logs-container">
        {logs.length === 0 ? (
          <div className="no-logs">
            <div className="logs-icon">📝</div>
            <p>No logs available yet</p>
            {scan.status === 'running' && <p>Waiting for scan output...</p>}
          </div>
        ) : (
          <div className="logs-content">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-text">{log}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );

  const renderVulnerabilities = () => (
    <div className="vulnerabilities-tab">
      <h3>🚨 Vulnerabilities ({scan.vulnerabilities?.length || 0})</h3>
      {!scan.vulnerabilities || scan.vulnerabilities.length === 0 ? (
        <div className="no-data">
          <div className="no-data-icon">🛡️</div>
          <p>No vulnerabilities found yet</p>
        </div>
      ) : (
        <div className="vulnerabilities-list">
          {scan.vulnerabilities.map((vuln, index) => (
            <div key={index} className={`vulnerability-item ${vuln.severity}`}>
              <div className="vuln-header">
                <h4>{vuln.title}</h4>
                <span className={`severity ${vuln.severity}`}>{vuln.severity}</span>
              </div>
              <p className="vuln-description">{vuln.description}</p>
              {vuln.url && <p className="vuln-url">URL: {vuln.url}</p>}
              {vuln.method && <p className="vuln-method">Method: {vuln.method}</p>}
              {vuln.parameter && <p className="vuln-parameter">Parameter: {vuln.parameter}</p>}
              {vuln.payload && <p className="vuln-payload">Payload: <code>{vuln.payload}</code></p>}
              {vuln.solution && <p className="vuln-solution">Solution: {vuln.solution}</p>}
              {vuln.source && <p className="vuln-source">Source: {vuln.source}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPorts = () => (
    <div className="ports-tab">
      <h3>🌐 Open Ports ({scan.ports?.length || 0})</h3>
      {!scan.ports || scan.ports.length === 0 ? (
        <div className="no-data">
          <div className="no-data-icon">🔌</div>
          <p>No open ports found yet</p>
        </div>
      ) : (
        <div className="ports-list">
          {scan.ports.map((port, index) => (
            <div key={index} className="port-item">
              <div className="port-number">{port.port}/{port.protocol}</div>
              <div className="port-details">
                <span className="port-service">{port.service}</span>
                {port.version && <span className="port-version">{port.version}</span>}
                <span className={`port-status ${port.status}`}>{port.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="scan-view">
      <div className="scan-view-header">
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          ← Back to Dashboard
        </button>
        <h1>Scan Details</h1>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'overview' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === 'logs' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('logs')}
        >
          📝 Logs {logs.length > 0 && `(${logs.length})`}
        </button>
        <button 
          className={activeTab === 'vulnerabilities' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('vulnerabilities')}
        >
          🚨 Vulnerabilities {scan.vulnerabilities && `(${scan.vulnerabilities.length})`}
        </button>
        <button 
          className={activeTab === 'ports' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('ports')}
        >
          🌐 Ports {scan.ports && `(${scan.ports.length})`}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'logs' && renderLogs()}
        {activeTab === 'vulnerabilities' && renderVulnerabilities()}
        {activeTab === 'ports' && renderPorts()}
      </div>
    </div>
  );
};

export default ScanView;
