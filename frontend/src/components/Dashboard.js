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
