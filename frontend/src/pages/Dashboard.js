import React, { useState, useEffect } from "react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [scans, setScans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching dashboard data...");
        
        const statsResponse = await fetch("http://127.0.0.1:8000/api/stats");
        const statsData = await statsResponse.json();
        console.log("Stats:", statsData);
        
        const scansResponse = await fetch("http://127.0.0.1:8000/api/scans");
        const scansData = await scansResponse.json();
        console.log("Scans:", scansData);
        
        setStats(statsData);
        setScans(scansData);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard error:", err);
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
        // Обновляем список сканов
        setScans(scans.filter(scan => scan.id !== scanId));
      }
    } catch (error) {
      console.error("Error deleting scan:", error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'running': { color: '#ffeb3b', text: '🔄 Running', bg: 'rgba(255, 235, 59, 0.1)' },
      'completed': { color: '#4caf50', text: '✅ Completed', bg: 'rgba(76, 175, 80, 0.1)' },
      'failed': { color: '#f44336', text: '❌ Failed', bg: 'rgba(244, 67, 54, 0.1)' },
      'paused': { color: '#ff9800', text: '⏸️ Paused', bg: 'rgba(255, 152, 0, 0.1)' }
    };
    
    const badge = badges[status] || { color: '#888', text: '❓ Unknown', bg: 'rgba(136, 136, 136, 0.1)' };
    
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.8em',
        fontWeight: 'bold',
        color: badge.color,
        backgroundColor: badge.bg,
        border: `1px solid ${badge.color}`
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

  if (loading) {
    return <div className="loading">🔄 Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <h3 style={{ color: "#ff0000" }}>❌ Error: {error}</h3>
      </div>
    );
  }

  const runningScans = scans?.filter(scan => scan.status === "running") || [];
  const completedScans = scans?.filter(scan => scan.status === "completed") || [];
  const totalPorts = scans?.reduce((total, scan) => total + (scan.ports?.length || 0), 0) || 0;
  const totalVulns = scans?.reduce((total, scan) => total + (scan.vulnerabilities?.length || 0), 0) || 0;

  return (
    <div>
      <h2 style={{ marginBottom: "30px", textAlign: "center" }}>🔥 AKUMA Dashboard</h2>
      
      {/* Statistics */}
      <div className="grid">
        <div className="stat-card">
          <div className="stat-number">{scans?.length || 0}</div>
          <div className="stat-label">Total Scans</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{runningScans.length}</div>
          <div className="stat-label">Active Scans</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalPorts}</div>
          <div className="stat-label">Open Ports</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalVulns}</div>
          <div className="stat-label">Vulnerabilities</div>
        </div>
      </div>

      {/* Active Scans */}
      {runningScans.length > 0 && (
        <div className="card">
          <h3>🔄 Active Scans</h3>
          {runningScans.map(scan => (
            <div key={scan.id} style={{ 
              padding: "15px", 
              margin: "10px 0", 
              background: "rgba(255, 235, 59, 0.1)", 
              borderRadius: "8px",
              border: "1px solid #ffeb3b"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "1.1em" }}>{scan.target}</strong>
                  <div style={{ fontSize: "0.9em", color: "#ccc", marginTop: "5px" }}>
                    Phase: {scan.phase} • Progress: {scan.progress}%
                  </div>
                </div>
                <div>
                  {getStatusBadge(scan.status)}
                </div>
              </div>
              <div style={{ 
                background: "rgba(0,0,0,0.3)", 
                borderRadius: "10px", 
                height: "8px", 
                marginTop: "10px",
                overflow: "hidden"
              }}>
                <div style={{
                  background: "linear-gradient(90deg, #4caf50, #ffeb3b, #ff9800)",
                  height: "100%",
                  width: `${scan.progress}%`,
                  transition: "width 0.3s ease"
                }}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Scans */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3>📊 Recent Scan Operations</h3>
          <span style={{ color: "#888", fontSize: "0.9em" }}>
            Total: {scans?.length || 0} scans
          </span>
        </div>
        
        {scans && scans.length > 0 ? (
          <div style={{ display: "grid", gap: "15px" }}>
            {scans.slice(0, 10).map(scan => (
              <div key={scan.id} style={{ 
                padding: "15px", 
                background: "rgba(0, 0, 0, 0.3)", 
                borderRadius: "8px",
                border: `2px solid ${scan.status === "completed" ? "#4caf50" : scan.status === "running" ? "#ffeb3b" : "#f44336"}`,
                transition: "all 0.3s ease"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <strong style={{ fontSize: "1.1em", color: "#00ff00" }}>
                        🎯 {scan.target}
                      </strong>
                      {getStatusBadge(scan.status)}
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px", fontSize: "0.9em", color: "#ccc" }}>
                      <div>
                        <span style={{ color: "#888" }}>📅 Created:</span><br/>
                        {formatDate(scan.created_at)}
                      </div>
                      <div>
                        <span style={{ color: "#888" }}>🔌 Ports:</span><br/>
                        <span style={{ color: "#4caf50", fontWeight: "bold" }}>{scan.ports?.length || 0}</span>
                      </div>
                      <div>
                        <span style={{ color: "#888" }}>⚠️ Vulnerabilities:</span><br/>
                        <span style={{ 
                          color: scan.vulnerabilities?.length > 0 ? "#ff9800" : "#4caf50", 
                          fontWeight: "bold" 
                        }}>
                          {scan.vulnerabilities?.length || 0}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "#888" }}>🔧 Type:</span><br/>
                        {scan.scan_type || 'comprehensive'}
                      </div>
                    </div>

                    {/* Vulnerabilities summary */}
                    {scan.vulnerabilities && scan.vulnerabilities.length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <span style={{ color: "#888", fontSize: "0.8em" }}>Severity breakdown: </span>
                        {['critical', 'high', 'medium', 'low'].map(severity => {
                          const count = scan.vulnerabilities.filter(v => v.severity?.toLowerCase() === severity).length;
                          return count > 0 ? (
                            <span key={severity} style={{ 
                              color: getSeverityColor(severity), 
                              fontSize: "0.8em", 
                              marginRight: "8px",
                              fontWeight: "bold"
                            }}>
                              {severity}: {count}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* Progress bar for running scans */}
                    {scan.status === "running" && (
                      <div style={{ marginTop: "10px" }}>
                        <div style={{ fontSize: "0.8em", color: "#888", marginBottom: "5px" }}>
                          {scan.phase} • {scan.progress}%
                        </div>
                        <div style={{ 
                          background: "rgba(0,0,0,0.5)", 
                          borderRadius: "10px", 
                          height: "6px",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            background: "linear-gradient(90deg, #4caf50, #ffeb3b, #ff9800)",
                            height: "100%",
                            width: `${scan.progress}%`,
                            transition: "width 0.3s ease"
                          }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginLeft: "15px" }}>
                    <button 
                      onClick={() => handleViewResult(scan.id)}
                      style={{
                        padding: "8px 16px",
                        background: "linear-gradient(45deg, #4caf50, #45a049)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.9em",
                        fontWeight: "bold",
                        transition: "all 0.3s ease"
                      }}
                      onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                      onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                    >
                      👁️ View Results
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteScan(scan.id)}
                      style={{
                        padding: "8px 16px",
                        background: "linear-gradient(45deg, #f44336, #d32f2f)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.9em",
                        fontWeight: "bold",
                        transition: "all 0.3s ease"
                      }}
                      onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                      onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: "center", 
            padding: "40px", 
            color: "#888",
            background: "rgba(0,0,0,0.2)",
            borderRadius: "8px",
            border: "2px dashed #444"
          }}>
            <div style={{ fontSize: "3em", marginBottom: "10px" }}>🔍</div>
            <p>No scans found</p>
            <p style={{ fontSize: "0.9em" }}>Start your first scan to see results here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
