import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    activeScans: 0,
    vulnerabilities: 0,
    criticalIssues: 0
  });
  const [scans, setScans] = useState([]);
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
      const statsResponse = await fetch(`${API_BASE_URL}/api/stats`);
      const statsData = await statsResponse.json();
      console.log("Dashboard stats:", statsData);
      
      // Fetch scans
      const scansResponse = await fetch(`${API_BASE_URL}/api/scans`);
      const scansData = await scansResponse.json();
      console.log("Dashboard scans:", scansData);
      
      // Fetch vulnerabilities
      const vulnsResponse = await fetch(`${API_BASE_URL}/api/vulnerabilities`);
      const vulnsData = await vulnsResponse.json();
      console.log("Dashboard vulns:", vulnsData);
      
      // Calculate real stats
      const totalVulns = scansData.reduce((total, scan) => total + (scan.vulnerabilities?.length || 0), 0);
      
      const realStats = {
        totalScans: scansData.length,
        activeScans: scansData.filter(s => s.status === "running").length,
        vulnerabilities: totalVulns,
        criticalIssues: vulnsData.filter(v => v.severity?.toLowerCase() === "critical").length
      };
      
      setStats(realStats);
      setScans(scansData);
      setLoading(false);
      setError(null);
      
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message);
      setLoading(false);
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
              </div>
              
              <div className="stat-box active">
                <div className="stat-header">ACTIVE_SCANS</div>
                <div className="stat-value">{stats.activeScans}</div>
              </div>
              
              <div className="stat-box vulns">
                <div className="stat-header">VULNERABILITIES</div>
                <div className="stat-value">{stats.vulnerabilities}</div>
              </div>
              
              <div className="stat-box critical">
                <div className="stat-header">CRITICAL_ISSUES</div>
                <div className="stat-value">{stats.criticalIssues}</div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
