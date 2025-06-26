import React from 'react';
import { useApi, usePolling } from '../hooks/useApi';
import { api } from '../services/api';

const Dashboard = () => {
  const { data: stats, loading: statsLoading } = usePolling(() => api.getStats(), 5000);
  const { data: scans, loading: scansLoading } = usePolling(() => api.getScans(), 10000);

  if (statsLoading && scansLoading) {
    return <div className="loading">Loading dashboard data</div>;
  }

  const recentScans = scans?.slice(0, 5) || [];
  const runningScans = scans?.filter(scan => scan.status === 'running') || [];

  return (
    <div>
      <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Security Dashboard</h2>
      
      {/* Statistics Grid */}
      <div className="grid">
        <div className="stat-card">
          <div className="stat-number">{stats?.total_scans || 0}</div>
          <div className="stat-label">Total Scans</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.vulnerabilities_found || 0}</div>
          <div className="stat-label">Vulnerabilities Found</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{runningScans.length}</div>
          <div className="stat-label">Active Scans</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.targets_scanned || 0}</div>
          <div className="stat-label">Targets Scanned</div>
        </div>
      </div>

      {/* Running Scans */}
      {runningScans.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>🔄 Active Scans</h3>
          {runningScans.map(scan => (
            <div key={scan.id} style={{ marginBottom: '15px', padding: '15px', background: 'rgba(255, 255, 0, 0.1)', borderRadius: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{scan.name}</strong>
                  <div style={{ fontSize: '0.9em', color: '#00cccc' }}>{scan.target}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#ffff00' }}>Running...</div>
                  <div style={{ fontSize: '0.9em' }}>Started: {new Date(scan.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Scans */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>📊 Recent Scans</h3>
        {recentScans.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
            No scans found. Create your first scan to get started!
          </p>
        ) : (
          recentScans.map(scan => (
            <div key={scan.id} style={{ 
              marginBottom: '15px', 
              padding: '15px', 
              background: 'rgba(0, 0, 0, 0.3)', 
              borderRadius: '5px',
              borderLeft: `4px solid ${getStatusColor(scan.status)}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{scan.name}</strong>
                  <div style={{ fontSize: '0.9em', color: '#00cccc' }}>{scan.target}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`status-indicator status-${scan.status}`}></span>
                  <span style={{ color: getStatusColor(scan.status) }}>
                    {scan.status.toUpperCase()}
                  </span>
                  <div style={{ fontSize: '0.9em', marginTop: '5px' }}>
                    {new Date(scan.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              {scan.vulnerabilities_count > 0 && (
                <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
                  <span style={{ color: '#ff6600' }}>
                    ⚠️ {scan.vulnerabilities_count} vulnerabilities found
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* System Status */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>🖥️ System Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <div style={{ color: '#00cccc' }}>Backend Status</div>
            <div style={{ color: '#00ff00' }}>🟢 Online</div>
          </div>
          <div>
            <div style={{ color: '#00cccc' }}>Scanner Engine</div>
            <div style={{ color: '#00ff00' }}>🟢 Ready</div>
          </div>
          <div>
            <div style={{ color: '#00cccc' }}>Database</div>
            <div style={{ color: '#00ff00' }}>🟢 Connected</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'running': return '#ffff00';
    case 'completed': return '#00ff00';
    case 'failed': return '#ff0000';
    default: return '#888';
  }
};

export default Dashboard;
