import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const ScanResult = () => {
  const { scanId } = useParams();
  const [scan, setScan] = useState(null);
  const [ports, setPorts] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [logs, setLogs] = useState([]);
  const [fuzzing, setFuzzing] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchScanData = async () => {
      try {
        console.log("Fetching scan data for ID:", scanId);
        
        // Получаем основную информацию о скане
        const scanResponse = await fetch(`http://127.0.0.1:8000/api/scans/${scanId}`);
        if (!scanResponse.ok) {
          throw new Error("Scan not found");
        }
        const scanData = await scanResponse.json();
        setScan(scanData);

        // Получаем порты
        const portsResponse = await fetch(`http://127.0.0.1:8000/api/scans/${scanId}/ports`);
        const portsData = await portsResponse.json();
        setPorts(portsData);

        // Получаем уязвимости
        const vulnResponse = await fetch(`http://127.0.0.1:8000/api/scans/${scanId}/vulnerabilities`);
        const vulnData = await vulnResponse.json();
        setVulnerabilities(vulnData);

        // Получаем логи
        const logsResponse = await fetch(`http://127.0.0.1:8000/api/scans/${scanId}/logs`);
        const logsData = await logsResponse.json();
        setLogs(logsData);

        // Получаем результаты фаззинга
        const fuzzingResponse = await fetch(`http://127.0.0.1:8000/api/scans/${scanId}/fuzzing`);
        const fuzzingData = await fuzzingResponse.json();
        setFuzzing(fuzzingData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching scan data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (scanId) {
      fetchScanData();
    }
  }, [scanId]);

  const getStatusBadge = (status) => {
    const badges = {
      'running': { color: '#ffeb3b', text: '🔄 Running', bg: 'rgba(255, 235, 59, 0.1)' },
      'completed': { color: '#4caf50', text: '✅ Completed', bg: 'rgba(76, 175, 80, 0.1)' },
      'failed': { color: '#f44336', text: '❌ Failed', bg: 'rgba(244, 67, 54, 0.1)' }
    };
    
    const badge = badges[status] || { color: '#888', text: '❓ Unknown', bg: 'rgba(136, 136, 136, 0.1)' };
    
    return (
      <span style={{
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '0.9em',
        fontWeight: 'bold',
        color: badge.color,
        backgroundColor: badge.bg,
        border: `2px solid ${badge.color}`
      }}>
        {badge.text}
      </span>
    );
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': '#ff0000',
      'high': '#ff9800', 
      'medium': '#ffeb3b',
      'low': '#4caf50',
      'info': '#2196f3'
    };
    return colors[severity?.toLowerCase()] || '#888';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    background: isActive ? 'linear-gradient(45deg, #4caf50, #45a049)' : 'rgba(0,0,0,0.3)',
    color: isActive ? 'white' : '#ccc',
    border: 'none',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    marginRight: '5px'
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '3em', marginBottom: '20px' }}>🔄</div>
        <h2>Loading scan results...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '3em', marginBottom: '20px' }}>❌</div>
        <h2 style={{ color: '#ff0000' }}>Error: {error}</h2>
        <button onClick={() => window.history.back()} style={{
          padding: '10px 20px',
          background: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, color: '#00ff00' }}>🔍 Scan Results: {scan?.target}</h1>
            <p style={{ margin: '10px 0 0 0', color: '#888' }}>
              Scan ID: {scanId} • Created: {formatDate(scan?.created_at)}
            </p>
          </div>
          <div>
            {getStatusBadge(scan?.status)}
          </div>
        </div>
        
        {scan?.status === 'running' && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ fontSize: '0.9em', color: '#888', marginBottom: '5px' }}>
              Current Phase: {scan.phase} • Progress: {scan.progress}%
            </div>
            <div style={{ 
              background: 'rgba(0,0,0,0.5)', 
              borderRadius: '10px', 
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #4caf50, #ffeb3b, #ff9800)',
                height: '100%',
                width: `${scan.progress}%`,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          style={tabStyle(activeTab === 'overview')}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          style={tabStyle(activeTab === 'vulnerabilities')}
          onClick={() => setActiveTab('vulnerabilities')}
        >
          🛡️ Vulnerabilities ({vulnerabilities.length})
        </button>
        <button 
          style={tabStyle(activeTab === 'ports')}
          onClick={() => setActiveTab('ports')}
        >
          🔌 Ports ({ports.length})
        </button>
        <button 
          style={tabStyle(activeTab === 'fuzzing')}
          onClick={() => setActiveTab('fuzzing')}
        >
          🔍 Fuzzing Dir
        </button>
        <button 
          style={tabStyle(activeTab === 'scanner')}
          onClick={() => setActiveTab('scanner')}
        >
          🎯 Scanner Results
        </button>
        <button 
          style={tabStyle(activeTab === 'logs')}
          onClick={() => setActiveTab('logs')}
        >
          📋 Logs ({logs.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'overview' && (
          <div>
            <h3>📊 Scan Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div className="stat-card">
                <div className="stat-number">{vulnerabilities.length}</div>
                <div className="stat-label">Vulnerabilities</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{ports.length}</div>
                <div className="stat-label">Open Ports</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{scan?.scan_type || 'comprehensive'}</div>
                <div className="stat-label">Scan Type</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{scan?.cms_detected || 'None'}</div>
                <div className="stat-label">CMS Detected</div>
              </div>
            </div>

            {/* Vulnerability Summary */}
            <h4>🛡️ Vulnerability Breakdown</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {['critical', 'high', 'medium', 'low', 'info'].map(severity => {
                const count = vulnerabilities.filter(v => v.severity?.toLowerCase() === severity).length;
                return (
                  <div key={severity} style={{
                    padding: '10px',
                    textAlign: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    border: `2px solid ${getSeverityColor(severity)}`
                  }}>
                    <div style={{ color: getSeverityColor(severity), fontWeight: 'bold', fontSize: '1.5em' }}>{count}</div>
                    <div style={{ textTransform: 'capitalize', fontSize: '0.9em' }}>{severity}</div>
                  </div>
                );
              })}
            </div>

            {/* Quick Port Overview */}
            <h4>🔌 Top Open Ports</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {ports.slice(0, 6).map((port, index) => (
                <div key={index} style={{
                  padding: '10px',
                  background: 'rgba(0,255,0,0.1)',
                  border: '1px solid #4caf50',
                  borderRadius: '5px'
                }}>
                  <strong>{port.port}/{port.protocol}</strong><br/>
                  <small>{port.service}</small><br/>
                  <small style={{ color: '#888' }}>{port.version}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'vulnerabilities' && (
          <div>
            <h3>🛡️ Vulnerabilities Found</h3>
            {vulnerabilities.length > 0 ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {vulnerabilities.map((vuln, index) => (
                  <div key={index} style={{
                    padding: '15px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    borderLeft: `5px solid ${getSeverityColor(vuln.severity)}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 10px 0', color: getSeverityColor(vuln.severity) }}>
                          {vuln.title || 'Unknown Vulnerability'}
                        </h4>
                        <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                          <strong>URL:</strong> {vuln.url || 'N/A'}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                          <strong>Method:</strong> {vuln.method || 'N/A'}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#ccc' }}>
                          {vuln.description || 'No description available'}
                        </p>
                        {vuln.extra_info && (
                          <p style={{ margin: '5px 0', fontSize: '0.8em', color: '#888' }}>
                            <strong>Details:</strong> {vuln.extra_info}
                          </p>
                        )}
                      </div>
                      <div style={{
                        padding: '5px 10px',
                        borderRadius: '12px',
                        backgroundColor: getSeverityColor(vuln.severity),
                        color: 'white',
                        fontSize: '0.8em',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {vuln.severity || 'unknown'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <div style={{ fontSize: '3em', marginBottom: '10px' }}>🛡️</div>
                <p>No vulnerabilities found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ports' && (
          <div>
            <h3>🔌 Open Ports & Services</h3>
            {ports.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {ports.map((port, index) => (
                  <div key={index} style={{
                    padding: '15px',
                    background: 'rgba(0,255,0,0.1)',
                    border: '1px solid #4caf50',
                    borderRadius: '8px',
                    display: 'grid',
                    gridTemplateColumns: '100px 120px 150px 1fr',
                    gap: '15px',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong style={{ color: '#4caf50', fontSize: '1.2em' }}>
                        {port.port}/{port.protocol}
                      </strong>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9em', color: '#888' }}>Service</div>
                      <div style={{ fontWeight: 'bold' }}>{port.service || 'unknown'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9em', color: '#888' }}>Status</div>
                      <div style={{ 
                        color: port.status === 'open' ? '#4caf50' : '#ff9800',
                        fontWeight: 'bold'
                      }}>
                        {port.status || 'unknown'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9em', color: '#888' }}>Version</div>
                      <div style={{ fontSize: '0.9em' }}>{port.version || 'unknown'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <div style={{ fontSize: '3em', marginBottom: '10px' }}>🔌</div>
                <p>No open ports found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fuzzing' && (
          <div>
            <h3>🔍 Directory Fuzzing Results</h3>
            <pre style={{ 
              background: 'rgba(0,0,0,0.5)', 
              padding: '20px', 
              borderRadius: '8px', 
              overflow: 'auto',
              maxHeight: '500px',
              fontSize: '0.9em'
            }}>
              {Object.keys(fuzzing).length > 0 ? JSON.stringify(fuzzing, null, 2) : 'No fuzzing results available'}
            </pre>
          </div>
        )}

        {activeTab === 'scanner' && (
          <div>
            <h3>🎯 Specialized Scanner Results</h3>
            <div style={{ fontSize: '0.9em', color: '#888', marginBottom: '15px' }}>
              Results from specialized scanners (Bitrix scanner, WPScan, etc.)
            </div>
            <pre style={{ 
              background: 'rgba(0,0,0,0.5)', 
              padding: '20px', 
              borderRadius: '8px', 
              overflow: 'auto',
              maxHeight: '500px',
              fontSize: '0.9em'
            }}>
              {scan?.cms_detected ? `CMS Detected: ${scan.cms_detected}` : 'No specialized scanner results available'}
            </pre>
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <h3>📋 Scan Logs</h3>
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '8px',
              maxHeight: '600px',
              overflow: 'auto'
            }}>
              {logs.length > 0 ? logs.map((log, index) => (
                <div key={index} style={{
                  padding: '8px 15px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                  color: log.includes('✅') ? '#4caf50' : 
                        log.includes('❌') ? '#f44336' : 
                        log.includes('⚠️') ? '#ff9800' : '#ccc'
                }}>
                  {log}
                </div>
              )) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                  No logs available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanResult;
