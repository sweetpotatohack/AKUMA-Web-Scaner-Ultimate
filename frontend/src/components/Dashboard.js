import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    activeScans: 0,
    vulnerabilities: 0,
    criticalIssues: 0
  });
  const [scans, setScans] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchScans();
    fetchVulnerabilities();
    
    const interval = setInterval(() => {
      fetchStats();
      fetchScans();
      fetchVulnerabilities();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Устанавливаем реальные значения из текущих данных
      setStats({
        totalScans: scans.length,
        activeScans: scans.filter(s => s.status === 'running').length,
        vulnerabilities: vulnerabilities.length,
        criticalIssues: vulnerabilities.filter(v => v.severity?.toLowerCase() === 'critical').length
      });
    }
  };

  const fetchScans = async () => {
    try {
      const response = await fetch('/api/scans');
      if (response.ok) {
        const data = await response.json();
        setScans(data);
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    }
  };

  const fetchVulnerabilities = async () => {
    try {
      const response = await fetch('/api/vulnerabilities');
      if (response.ok) {
        const data = await response.json();
        setVulnerabilities(data.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error);
    }
  };

  const handleScanDelete = async (scanId) => {
    if (window.confirm('Delete scan? [y/N]')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/scans/${scanId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setScans(prev => prev.filter(scan => scan.id !== scanId));
        }
      } catch (error) {
        console.error('Error deleting scan:', error);
      }
    }
  };

  // Chart data for vulnerabilities analysis
  const severityStats = vulnerabilities.reduce((acc, vuln) => {
    const severity = vuln.severity?.toLowerCase() || 'unknown';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  const severityChartData = {
    labels: Object.keys(severityStats).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [
      {
        data: Object.values(severityStats),
        backgroundColor: [
          '#DC2626', // critical - red
          '#EA580C', // high - orange
          '#EAB308', // medium - yellow
          '#16A34A', // low - green
          '#2563EB', // info - blue
        ],
        borderColor: '#00ff00',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff',
      },
    ],
  };

  const scanStatusData = {
    labels: ['Completed', 'Running', 'Failed'],
    datasets: [
      {
        label: 'Scans',
        data: [
          scans.filter(s => s.status === 'completed').length,
          scans.filter(s => s.status === 'running').length,
          scans.filter(s => s.status === 'failed').length,
        ],
        backgroundColor: ['#16A34A', '#EAB308', '#DC2626'],
        borderColor: '#00ff00',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#00ff00',
          font: {
            family: 'Courier New',
            size: 11,
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#00ff00',
          font: {
            family: 'Courier New',
          },
        },
        grid: {
          color: '#333',
        },
      },
      x: {
        ticks: {
          color: '#00ff00',
          font: {
            family: 'Courier New',
          },
        },
        grid: {
          color: '#333',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#00ff00',
          font: {
            family: 'Courier New',
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((context.parsed / total) * 100);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#EAB308';
      case 'low': return '#16A34A';
      case 'info': return '#2563EB';
      default: return '#666';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Вычисляем реальные статистики
  const realStats = {
    totalScans: scans.length,
    activeScans: scans.filter(s => s.status === 'running').length,
    vulnerabilities: vulnerabilities.length,
    criticalIssues: vulnerabilities.filter(v => v.severity?.toLowerCase() === 'critical').length
  };

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
                <div className="stat-value">{realStats.totalScans}</div>
                <div className="stat-bar">
                  <div className="stat-fill" style={{width: `${Math.min(realStats.totalScans * 10, 100)}%`}}></div>
                </div>
              </div>
              
              <div className="stat-box active">
                <div className="stat-header">ACTIVE_SCANS</div>
                <div className="stat-value">{realStats.activeScans}</div>
                <div className="stat-bar">
                  <div className="stat-fill active" style={{width: `${Math.min(realStats.activeScans * 25, 100)}%`}}></div>
                </div>
              </div>
              
              <div className="stat-box vulns">
                <div className="stat-header">VULNERABILITIES</div>
                <div className="stat-value">{realStats.vulnerabilities}</div>
                <div className="stat-bar">
                  <div className="stat-fill vulns" style={{width: `${Math.min(realStats.vulnerabilities * 2, 100)}%`}}></div>
                </div>
              </div>
              
              <div className="stat-box critical">
                <div className="stat-header">CRITICAL_ISSUES</div>
                <div className="stat-value">{realStats.criticalIssues}</div>
                <div className="stat-bar">
                  <div className="stat-fill critical" style={{width: `${Math.min(realStats.criticalIssues * 20, 100)}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="dashboard-grid">
        <div className="terminal-window chart-window">
          <div className="terminal-header">
            <div className="terminal-title">VULNERABILITY ANALYSIS</div>
            <div className="terminal-controls">●●●</div>
          </div>
          <div className="terminal-body">
            <div className="chart-container">
              {Object.keys(severityStats).length > 0 ? (
                <Doughnut data={severityChartData} options={doughnutOptions} />
              ) : (
                <div className="no-data">
                  <div className="ascii-art">
    ┌─────────────────┐
    │   NO DATA YET   │
    │                 │
    │   RUN A SCAN    │
    │   TO SEE STATS  │
    └─────────────────┘
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="terminal-window chart-window">
          <div className="terminal-header">
            <div className="terminal-title">SCAN STATUS OVERVIEW</div>
            <div className="terminal-controls">●●●</div>
          </div>
          <div className="terminal-body">
            <div className="chart-container">
              {scans.length > 0 ? (
                <Bar data={scanStatusData} options={chartOptions} />
              ) : (
                <div className="no-data">
                  <div className="ascii-art">
    ┌─────────────────┐
    │   NO SCANS YET  │
    │                 │
    │   START FIRST   │
    │   SCAN BELOW    │
    └─────────────────┘
                  </div>
                </div>
              )}
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
              <div style={{color: '#666', marginTop: '10px'}}>
                total 0<br/>
                drwxr-xr-x 2 root root 4096 {formatDate(new Date())} .<br/>
                drwxr-xr-x 3 root root 4096 {formatDate(new Date())} ..<br/>
                <br/>
                No scan results found. Run './new-scan' to begin.
              </div>
            </div>
          ) : (
            <div className="scans-list">
              <div className="prompt" style={{marginBottom: '15px'}}>
                root@kali-akuma:~# cat /var/log/akuma/recent_scans.log
              </div>
              {scans.slice(0, 8).map((scan) => (
                <div key={scan.id} className="scan-entry">
                  <div className="scan-line">
                    <span className="timestamp">[{formatDate(scan.created_at)}]</span>
                    <span className={`status-indicator status-${scan.status}`}>●</span>
                    <span className="scan-target">{scan.target}</span>
                    <span className="scan-status">{scan.status.toUpperCase()}</span>
                    {scan.status === 'running' && (
                      <span className="progress">({scan.progress}%)</span>
                    )}
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

      {/* Recent Vulnerabilities */}
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-title">RECENT VULNERABILITIES</div>
          <div className="terminal-controls">
            <Link to="/vulnerabilities" className="terminal-button">VIEW_ALL</Link>
          </div>
        </div>
        <div className="terminal-body">
          {vulnerabilities.length === 0 ? (
            <div className="no-data">
              <div className="prompt">root@kali-akuma:~# tail -f /var/log/akuma/vulnerabilities.log</div>
              <div style={{color: '#666', marginTop: '10px'}}>
                No vulnerabilities detected yet.<br/>
                System secure. Monitoring continues...
              </div>
            </div>
          ) : (
            <div className="vulns-list">
              <div className="prompt" style={{marginBottom: '15px'}}>
                root@kali-akuma:~# grep -i "CRITICAL\|HIGH" /var/log/akuma/vulns.log | tail -10
              </div>
              {vulnerabilities.map((vuln, index) => (
                <div key={index} className="vuln-entry">
                  <div className="vuln-line">
                    <span 
                      className="severity-badge"
                      style={{ color: getSeverityColor(vuln.severity) }}
                    >
                      [{vuln.severity?.toUpperCase() || 'UNKNOWN'}]
                    </span>
                    <span className="vuln-title">{vuln.title}</span>
                    <span className="vuln-target">@ {vuln.target}</span>
                  </div>
                  <div className="vuln-url">{vuln.url}</div>
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
