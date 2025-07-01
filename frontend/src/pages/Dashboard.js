import React, { useState, useEffect } from "react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [scans, setScans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("☠️ [AKUMA] Fetching intel...");
        
        const statsResponse = await fetch("http://127.0.0.1:8000/api/stats");
        const statsData = await statsResponse.json();
        console.log("📊 [STATS]:", statsData);
        
        const scansResponse = await fetch("http://127.0.0.1:8000/api/scans");
        const scansData = await scansResponse.json();
        console.log("🎯 [SCANS]:", scansData);
        
        setStats(statsData);
        setScans(scansData);
        setLoading(false);
      } catch (err) {
        console.error("💀 [ERROR]:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleViewResult = (scanId) => {
    window.location.href = `/scan/${scanId}`;
  };

  const handleDeleteScan = async (scanId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/scans/${scanId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setScans(scans.filter(scan => scan.id !== scanId));
      }
    } catch (error) {
      console.error("💀 [ERROR] Deleting scan:", error);
    }
  };

  const getStatusIndicator = (status) => {
    const indicators = {
      'running': { symbol: '▶', color: '#ffff00', text: 'RUNNING' },
      'completed': { symbol: '✓', color: '#00ff00', text: 'COMPLETE' },
      'failed': { symbol: '✗', color: '#ff0000', text: 'FAILED' },
      'paused': { symbol: '⏸', color: '#ff9800', text: 'PAUSED' }
    };
    
    const indicator = indicators[status] || { symbol: '?', color: '#888', text: 'UNKNOWN' };
    
    return (
      <span style={{
        color: indicator.color,
        fontFamily: 'Courier New, monospace',
        fontWeight: 'bold'
      }}>
        [{indicator.symbol}] {indicator.text}
      </span>
    );
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': '#ff0000',
      'high': '#ff6600', 
      'medium': '#ffff00',
      'low': '#00ff00',
      'info': '#00ffff'
    };
    return colors[severity?.toLowerCase()] || '#888';
  };

  const formatTime = (dateString) => {
    if (!dateString) return '[UNKNOWN]';
    const date = new Date(dateString);
    return `[${date.toLocaleDateString()}] ${date.toLocaleTimeString()}`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        fontFamily: 'Courier New, monospace',
        color: '#00ff00'
      }}>
        <div style={{ fontSize: '2em', marginBottom: '20px' }}>
          ☠️ AKUMA SCANNER v3.0 ☠️
        </div>
        <div style={{ fontSize: '1.2em' }}>
          [●●●] INITIALIZING SECURITY PROTOCOLS...
        </div>
        <div style={{ marginTop: '10px', color: '#ffff00' }}>
          root@kali-akuma:~# loading dashboard_
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        border: '2px solid #ff0000',
        background: 'rgba(255, 0, 0, 0.1)',
        fontFamily: 'Courier New, monospace',
        color: '#ff0000'
      }}>
        <h3>💀 [FATAL ERROR] {error}</h3>
        <p>root@kali-akuma:~# connection_lost</p>
      </div>
    );
  }

  const runningScans = scans?.filter(scan => scan.status === "running") || [];
  const completedScans = scans?.filter(scan => scan.status === "completed") || [];
  const totalPorts = scans?.reduce((total, scan) => total + (scan.ports?.length || 0), 0) || 0;
  const totalVulns = scans?.reduce((total, scan) => total + (scan.vulnerabilities?.length || 0), 0) || 0;

  return (
    <div style={{ 
      fontFamily: 'Courier New, monospace',
      background: '#0a0a0a',
      color: '#00ff00',
      minHeight: '100vh',
      padding: '20px'
    }}>
      
      {/* Terminal Header */}
      <div style={{
        border: '2px solid #00ff00',
        padding: '15px',
        marginBottom: '20px',
        background: '#000000'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, color: '#00ff00' }}>
              ☠️ AKUMA SECURITY DASHBOARD ☠️
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#ffff00' }}>
              root@kali-akuma:~# akuma --status --verbose
            </p>
          </div>
          <div style={{ textAlign: 'right', color: '#00ffff' }}>
            <div>[{currentTime.toLocaleDateString()}]</div>
            <div>[{currentTime.toLocaleTimeString()}]</div>
          </div>
        </div>
      </div>

      {/* System Stats Terminal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {[
          { label: 'TOTAL_SCANS', value: scans?.length || 0, color: '#00ff00' },
          { label: 'TARGETS_HIT', value: stats?.targets_scanned || 0, color: '#00ffff' },
          { label: 'ACTIVE_RAIDS', value: runningScans.length, color: '#ffff00' },
          { label: 'OPEN_PORTS', value: totalPorts, color: '#ff9800' },
          { label: 'VULNS_FOUND', value: totalVulns, color: '#ff0000' }
        ].map((stat, index) => (
          <div key={index} style={{
            border: `1px solid ${stat.color}`,
            padding: '15px',
            background: 'rgba(0, 0, 0, 0.8)',
            textAlign: 'center'
          }}>
            <div style={{ color: '#888', fontSize: '0.8em' }}>[{stat.label}]</div>
            <div style={{ 
              fontSize: '2em', 
              fontWeight: 'bold',
              color: stat.color,
              textShadow: `0 0 10px ${stat.color}`
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Active Operations */}
      {runningScans.length > 0 && (
        <div style={{
          border: '2px solid #ffff00',
          padding: '15px',
          marginBottom: '20px',
          background: 'rgba(255, 255, 0, 0.05)'
        }}>
          <h3 style={{ color: '#ffff00', marginBottom: '15px' }}>
            ⚡ [ACTIVE OPERATIONS] ⚡
          </h3>
          {runningScans.map(scan => (
            <div key={scan.id} style={{
              border: '1px solid #ffff00',
              padding: '10px',
              margin: '10px 0',
              background: 'rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ color: '#00ff00' }}>TARGET:</span> {scan.target}
                  <br />
                  <span style={{ color: '#00ffff' }}>PHASE:</span> {scan.phase || 'RECON'} 
                  <span style={{ color: '#ffff00', marginLeft: '20px' }}>
                    PROGRESS: {scan.progress || 0}%
                  </span>
                </div>
                <div>{getStatusIndicator(scan.status)}</div>
              </div>
              
              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '4px',
                background: '#333',
                marginTop: '10px',
                position: 'relative'
              }}>
                <div style={{
                  width: `${scan.progress || 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00ff00, #ffff00, #ff0000)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scan History Terminal */}
      <div style={{
        border: '2px solid #00ff00',
        padding: '15px',
        background: 'rgba(0, 0, 0, 0.8)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3 style={{ color: '#00ff00', margin: 0 }}>
            📊 [SCAN_HISTORY.LOG] 📊
          </h3>
          <span style={{ color: '#888' }}>
            [{scans?.length || 0}] ENTRIES FOUND
          </span>
        </div>
        
        {scans && scans.length > 0 ? (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {scans.slice(0, 10).map(scan => (
              <div key={scan.id} style={{
                border: '1px solid #333',
                padding: '12px',
                margin: '8px 0',
                background: 'rgba(0, 0, 0, 0.6)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ color: '#00ff00' }}>┌─[TARGET]:</span> 
                      <span style={{ color: '#00ffff', marginLeft: '10px' }}>{scan.target}</span>
                      <span style={{ marginLeft: '20px' }}>{getStatusIndicator(scan.status)}</span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '0.9em' }}>
                      <div>
                        <span style={{ color: '#888' }}>├─[TIMESTAMP]:</span><br/>
                        <span style={{ color: '#ffff00' }}>{formatTime(scan.created_at)}</span>
                      </div>
                      <div>
                        <span style={{ color: '#888' }}>├─[PORTS_OPEN]:</span><br/>
                        <span style={{ color: '#00ff00' }}>[{scan.ports?.length || 0}]</span>
                      </div>
                      <div>
                        <span style={{ color: '#888' }}>├─[VULNS_FOUND]:</span><br/>
                        <span style={{ color: scan.vulnerabilities?.length > 0 ? '#ff6600' : '#00ff00' }}>
                          [{scan.vulnerabilities?.length || 0}]
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#888' }}>└─[SCAN_TYPE]:</span><br/>
                        <span style={{ color: '#00ffff' }}>{scan.scan_type || 'FULL'}</span>
                      </div>
                    </div>

                    {/* Vulnerability Breakdown */}
                    {scan.vulnerabilities && scan.vulnerabilities.length > 0 && (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #333' }}>
                        <span style={{ color: '#888', fontSize: '0.8em' }}>THREAT_LEVEL: </span>
                        {['critical', 'high', 'medium', 'low'].map(severity => {
                          const count = scan.vulnerabilities.filter(v => v.severity?.toLowerCase() === severity).length;
                          return count > 0 ? (
                            <span key={severity} style={{ 
                              color: getSeverityColor(severity), 
                              fontSize: '0.8em', 
                              marginRight: '12px',
                              fontWeight: 'bold'
                            }}>
                              [{severity.toUpperCase()}:{count}]
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: '15px' }}>
                    <button 
                      onClick={() => handleViewResult(scan.id)}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(45deg, #004400, #006600)',
                        color: '#00ff00',
                        border: '1px solid #00ff00',
                        cursor: 'pointer',
                        fontSize: '0.8em',
                        fontFamily: 'Courier New, monospace',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = 'linear-gradient(45deg, #006600, #008800)';
                        e.target.style.boxShadow = '0 0 10px #00ff00';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'linear-gradient(45deg, #004400, #006600)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      [VIEW_INTEL]
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteScan(scan.id)}
                      style={{
                        padding: '6px 12px',
                        background: 'linear-gradient(45deg, #440000, #660000)',
                        color: '#ff0000',
                        border: '1px solid #ff0000',
                        cursor: 'pointer',
                        fontSize: '0.8em',
                        fontFamily: 'Courier New, monospace',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = 'linear-gradient(45deg, #660000, #880000)';
                        e.target.style.boxShadow = '0 0 10px #ff0000';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'linear-gradient(45deg, #440000, #660000)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      [PURGE]
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#888',
            border: '2px dashed #333',
            background: 'rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontSize: '2em', marginBottom: '10px' }}>💀</div>
            <p>NO SCAN DATA FOUND</p>
            <p style={{ fontSize: '0.9em' }}>root@kali-akuma:~# initiate_first_scan</p>
          </div>
        )}
      </div>

      {/* System Status Footer */}
      <div style={{
        marginTop: '20px',
        padding: '10px',
        border: '1px solid #333',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.8em'
      }}>
        <div style={{ color: '#00ff00' }}>
          [AKUMA_ENGINE]: ONLINE | [DATABASE]: CONNECTED | [NETWORK]: ACTIVE
        </div>
        <div style={{ color: '#ffff00' }}>
          root@kali-akuma:~# _
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
