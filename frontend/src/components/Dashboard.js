import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    activeScans: 0,
    vulnerabilities: 0,
    criticalIssues: 0
  });
  const [scans, setScans] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      console.log("Dashboard: Fetching data...");
      
      // Fetch stats
      const statsResponse = await fetch("http://127.0.0.1:8000/api/stats");
      const statsData = await statsResponse.json();
      console.log("Dashboard stats:", statsData);
      
      // Fetch scans
      const scansResponse = await fetch("http://127.0.0.1:8000/api/scans");
      const scansData = await scansResponse.json();
      console.log("Dashboard scans:", scansData);
      
      // Fetch vulnerabilities
      const vulnsResponse = await fetch("http://127.0.0.1:8000/api/vulnerabilities");
      const vulnsData = await vulnsResponse.json();
      console.log("Dashboard vulns:", vulnsData);
      
      // Calculate real stats
      const totalPorts = scansData.reduce((total, scan) => total + (scan.ports?.length || 0), 0);
      const totalVulns = scansData.reduce((total, scan) => total + (scan.vulnerabilities?.length || 0), 0);
      
      const realStats = {
        totalScans: scansData.length,
        activeScans: scansData.filter(s => s.status === "running").length,
        vulnerabilities: totalVulns,
        criticalIssues: vulnsData.filter(v => v.severity?.toLowerCase() === "critical").length
      };
      
      setStats(realStats);
      setScans(scansData);
      setVulnerabilities(vulnsData.slice(0, 10));
      setLoading(false);
      setError(null);
      
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleScanDelete = async (scanId) => {
    if (window.confirm("Delete scan? [y/N]")) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/scans/${scanId}`, {
          method: "DELETE"
        });
        if (response.ok) {
          setScans(prev => prev.filter(scan => scan.id !== scanId));
        }
      } catch (error) {
        console.error("Error deleting scan:", error);
      }
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "#DC2626";
      case "high": return "#EA580C";
      case "medium": return "#EAB308";
      case "low": return "#16A34A";
      case "info": return "#2563EB";
      default: return "#666";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-title">LOADING...</div>
          </div>
          <div className="terminal-body">
            <div>Loading dashboard data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-title">ERROR</div>
          </div>
          <div className="terminal-body">
            <div style={{ color: "#ff0000" }}>❌ Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Terminal Header */}
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-title">SYSTEM STATUS</div>
          <div className="terminal-controls">●●●</div>
        </div>
        <div className="terminal-body">
          <div className="system-overview">
            <div className="ascii-banner">
╔═══════════════════════════════════════════════════════════════╗
║  AKUMA SCANNER - REAL-TIME MONITORING DASHBOARD              ║
║  System: ONLINE  │  Status: OPERATIONAL  │  Uptime: 99.9%   ║
╚═══════════════════════════════════════════════════════════════╝
            </div>
            
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-header">TOTAL_SCANS</div>
                <div className="stat-value">{stats.totalScans}</div>
                <div className="stat-bar">
                  <div className="stat-fill" style={{width: `${Math.min(stats.totalScans * 10, 100)}%`}}></div>
                </div>
              </div>
              
              <div className="stat-box active">
                <div className="stat-header">ACTIVE_SCANS</div>
                <div className="stat-value">{stats.activeScans}</div>
                <div className="stat-bar">
                  <div className="stat-fill active" style={{width: `${Math.min(stats.activeScans * 25, 100)}%`}}></div>
                </div>
              </div>
              
              <div className="stat-box vulns">
                <div className="stat-header">VULNERABILITIES</div>
                <div className="stat-value">{stats.vulnerabilities}</div>
                <div className="stat-bar">
                  <div className="stat-fill vulns" style={{width: `${Math.min(stats.vulnerabilities * 2, 100)}%`}}></div>
                </div>
              </div>
              
              <div className="stat-box critical">
                <div className="stat-header">CRITICAL_ISSUES</div>
                <div className="stat-value">{stats.criticalIssues}</div>
                <div className="stat-bar">
                  <div className="stat-fill critical" style={{width: `${Math.min(stats.criticalIssues * 20, 100)}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-title">RECENT SCAN OPERATIONS</div>
          <div className="terminal-controls">
            <Link to="/new-scan" className="terminal-button">+ NEW_SCAN</Link>
          </div>
        </div>
        <div className="terminal-body">
          {scans.length === 0 ? (
            <div className="no-data">
              <div className="prompt">root@kali-akuma:~# ls -la /scans/</div>
              <div style={{color: "#666", marginTop: "10px"}}>
                total 0<br/>
                drwxr-xr-x 2 root root 4096 {formatDate(new Date())} .<br/>
                drwxr-xr-x 3 root root 4096 {formatDate(new Date())} ..<br/>
                <br/>
                No scan results found. Run "./new-scan" to begin.
              </div>
            </div>
          ) : (
            <div className="scans-list">
              <div className="prompt" style={{marginBottom: "15px"}}>
                root@kali-akuma:~# cat /var/log/akuma/recent_scans.log
              </div>
              {scans.slice(0, 8).map((scan) => (
                <div key={scan.id} className="scan-entry">
                  <div className="scan-line">
                    <span className="timestamp">[{formatDate(scan.created_at)}]</span>
                    <span className={`status-indicator status-${scan.status}`}>●</span>
                    <span className="scan-target">{scan.target}</span>
                    <span className="scan-status">{scan.status.toUpperCase()}</span>
                    {scan.status === "running" && (
                      <span className="progress">({scan.progress}%)</span>
                    )}
                    <span className="scan-info">
                      🔌 {scan.ports?.length || 0} ports | ⚠️ {scan.vulnerabilities?.length || 0} vulns
                    </span>
                  </div>
                  <div className="scan-actions">
                    <Link to={`/scan/${scan.id}`} className="action-link">
                      ./view_results
                    </Link>
                    <button 
                      onClick={() => handleScanDelete(scan.id)}
                      className="action-link danger"
                    >
                      rm -rf
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-title">DEBUG INFO</div>
        </div>
        <div className="terminal-body">
          <pre style={{ fontSize: "0.8em", color: "#888" }}>
            API Data:
            - Total scans: {scans.length}
            - Running scans: {scans.filter(s => s.status === "running").length}
            - Completed scans: {scans.filter(s => s.status === "completed").length}
            - Total vulnerabilities: {stats.vulnerabilities}
            - Critical issues: {stats.criticalIssues}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
