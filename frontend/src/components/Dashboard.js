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
import React, { useState, useEffect } from 'react';

const Dashboard = ({ stats, scans, onScanSelect, onScanDelete }) => {
  const [sortBy, setSortBy] = useState('created_at');
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'running': return 'status-running';
      case 'completed': return 'status-completed';
      case 'failed': return 'status-failed';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'running': return '⚡';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const filteredScans = scans
    .filter(scan => filterStatus === 'all' || scan.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'created_at') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return a[sortBy]?.localeCompare(b[sortBy]) || 0;
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getProgressWidth = (scan) => {
    if (!scan.progress) return 0;
    return Math.min(scan.progress, 100);
  };

  // Calculate vulnerability statistics
  const vulnerabilityStats = scans.reduce((acc, scan) => {
    if (scan.vulnerabilities) {
      scan.vulnerabilities.forEach(vuln => {
        const severity = vuln.severity || 'unknown';
        acc[severity] = (acc[severity] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const totalVulns = Object.values(vulnerabilityStats).reduce((a, b) => a + b, 0);

  return (
    <div className="dashboard">
      {/* Overview Cards */}
      <div className="grid grid-4 mb-3">
        <div className="card bounce-in">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">📊</div>
              Overview
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-large">
              <div className="stat-value text-accent">{stats.totalScans}</div>
              <div className="stat-label">Total Scans</div>
            </div>
            <div className="stat-large">
              <div className="stat-value text-warning">{stats.activeScans}</div>
              <div className="stat-label">Active Scans</div>
            </div>
          </div>
        </div>

        <div className="card bounce-in">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">🛡️</div>
              Security
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-large">
              <div className="stat-value text-error">{vulnerabilityStats.critical || 0}</div>
              <div className="stat-label">Critical</div>
            </div>
            <div className="stat-large">
              <div className="stat-value text-warning">{vulnerabilityStats.high || 0}</div>
              <div className="stat-label">High</div>
            </div>
          </div>
        </div>

        <div className="card bounce-in">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">📈</div>
              Findings
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-large">
              <div className="stat-value text-info">{totalVulns}</div>
              <div className="stat-label">Total Issues</div>
            </div>
            <div className="stat-large">
              <div className="stat-value text-success">{vulnerabilityStats.low || 0}</div>
              <div className="stat-label">Low Risk</div>
            </div>
          </div>
        </div>

        <div className="card bounce-in">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">🎯</div>
              Targets
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-large">
              <div className="stat-value text-accent">{scans.length}</div>
              <div className="stat-label">Scanned</div>
            </div>
            <div className="stat-large">
              <div className="stat-value text-success">
                {scans.filter(s => s.status === 'completed').length}
              </div>
              <div className="stat-label">Completed</div>
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
      {/* Vulnerability Distribution Chart */}
      {totalVulns > 0 && (
        <div className="card mb-3 fade-in">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">📊</div>
              Vulnerability Distribution
            </div>
          </div>
          <div className="vulnerability-chart">
            <div className="chart-bars">
              {Object.entries(vulnerabilityStats).map(([severity, count]) => (
                <div key={severity} className="chart-bar-container">
                  <div className="chart-label">{severity}</div>
                  <div className="chart-bar-wrapper">
                    <div 
                      className={`chart-bar chart-bar-${severity}`}
                      style={{ 
                        height: `${(count / Math.max(...Object.values(vulnerabilityStats))) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="chart-value">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scan Management */}
      <div className="card fade-in">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">🔍</div>
            Recent Scans
          </div>
          <div className="scan-controls">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
              style={{ marginRight: '10px', width: 'auto' }}
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ width: 'auto' }}
            >
              <option value="created_at">Date Created</option>
              <option value="target">Target</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {filteredScans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No scans found</h3>
            <p>Create your first scan to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Vulnerabilities</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.map((scan) => (
                  <tr key={scan.id} className="scan-row">
                    <td>
                      <div className="target-info">
                        <div className="target-url">{scan.target}</div>
                        {scan.scan_type && (
                          <div className="target-type">{scan.scan_type}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(scan.status)}`}>
                        <span>{getStatusIcon(scan.status)}</span>
                        {scan.status}
                      </span>
                    </td>
                    <td>
                      <div className="progress-container">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${getProgressWidth(scan)}%` }}
                        ></div>
                        <div className="progress-text">
                          {getProgressWidth(scan)}%
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="vulnerability-summary">
                        {scan.vulnerabilities ? (
                          <>
                            <span className="vuln-count critical">
                              {scan.vulnerabilities.filter(v => v.severity === 'critical').length}
                            </span>
                            <span className="vuln-count high">
                              {scan.vulnerabilities.filter(v => v.severity === 'high').length}
                            </span>
                            <span className="vuln-count medium">
                              {scan.vulnerabilities.filter(v => v.severity === 'medium').length}
                            </span>
                            <span className="vuln-count low">
                              {scan.vulnerabilities.filter(v => v.severity === 'low').length}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted">No data</span>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(scan.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => onScanSelect(scan)}
                        >
                          🔍 View
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => onScanDelete(scan.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Additional Styles */}
      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stat-large {
          text-align: center;
          padding: 1rem;
        }

        .stat-large .stat-value {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .stat-large .stat-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .vulnerability-chart {
          padding: 2rem;
        }

        .chart-bars {
          display: flex;
          justify-content: space-around;
          align-items: end;
          height: 200px;
          gap: 1rem;
        }

        .chart-bar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .chart-bar-wrapper {
          height: 150px;
          width: 40px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          display: flex;
          align-items: end;
          margin: 0.5rem 0;
        }

        .chart-bar {
          width: 100%;
          border-radius: 4px;
          transition: height 0.5s ease;
        }

        .chart-bar-critical {
          background: linear-gradient(to top, var(--error), #ff6b7a);
        }

        .chart-bar-high {
          background: linear-gradient(to top, var(--warning), #ffb84d);
        }

        .chart-bar-medium {
          background: linear-gradient(to top, var(--info), #5352ed);
        }

        .chart-bar-low {
          background: linear-gradient(to top, var(--success), #26d665);
        }

        .chart-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-transform: capitalize;
          font-weight: 500;
        }

        .chart-value {
          font-size: 1.2rem;
          font-weight: bold;
          color: var(--text-primary);
        }

        .scan-controls {
          display: flex;
          gap: 10px;
        }

        .target-info {
          display: flex;
          flex-direction: column;
        }

        .target-url {
          font-weight: 500;
          color: var(--text-primary);
        }

        .target-type {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .vulnerability-summary {
          display: flex;
          gap: 8px;
        }

        .vuln-count {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
          min-width: 20px;
          text-align: center;
        }

        .vuln-count.critical {
          background: rgba(255, 71, 87, 0.2);
          color: var(--error);
        }

        .vuln-count.high {
          background: rgba(255, 165, 2, 0.2);
          color: var(--warning);
        }

        .vuln-count.medium {
          background: rgba(74, 158, 255, 0.2);
          color: var(--info);
        }

        .vuln-count.low {
          background: rgba(46, 213, 115, 0.2);
          color: var(--success);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 0.8rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .scan-row:hover {
          background: var(--bg-secondary);
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .chart-bars {
            gap: 0.5rem;
          }
          
          .chart-bar-wrapper {
            width: 30px;
          }
          
          .scan-controls {
            flex-direction: column;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
