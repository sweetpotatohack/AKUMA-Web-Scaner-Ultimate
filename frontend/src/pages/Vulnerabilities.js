import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/ScanDetails.css';
import { API_BASE_URL } from '../config/api';

const Vulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  const fetchVulnerabilities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vulnerabilities`);
      if (response.ok) {
        const data = await response.json();
        setVulnerabilities(data);
      } else {
        setError('Failed to fetch vulnerabilities');
      }
    } catch (err) {
      setError('Failed to fetch vulnerabilities');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#ffeb3b';
      case 'low': return '#4caf50';
      case 'info': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '💡';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  const groupVulnerabilitiesBySeverity = (vulns) => {
    return vulns.reduce((acc, vuln) => {
      const severity = vuln.severity?.toLowerCase() || 'unknown';
      if (!acc[severity]) acc[severity] = [];
      acc[severity].push(vuln);
      return acc;
    }, {});
  };

  const filteredVulns = filter === 'all' 
    ? vulnerabilities 
    : vulnerabilities.filter(v => v.severity?.toLowerCase() === filter);

  const groupedVulns = groupVulnerabilitiesBySeverity(filteredVulns);
  const severityOrder = ['critical', 'high', 'medium', 'low', 'info', 'unknown'];

  if (loading) return <div className="loading">🔄 Loading vulnerabilities...</div>;
  if (error) return <div className="error">❌ {error}</div>;

  return (
    <div className="scan-details">
      <div className="scan-details-header">
        <Link to="/dashboard" className="back-button">← Back to Dashboard</Link>
        <h2>🛡️ Vulnerabilities Overview</h2>
        <div className="scan-status">
          <span className="status completed">Total: {vulnerabilities.length}</span>
        </div>
      </div>

      <div className="vulnerabilities-filters">
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All ({vulnerabilities.length})
          </button>
          {['critical', 'high', 'medium', 'low', 'info'].map(severity => {
            const count = vulnerabilities.filter(v => v.severity?.toLowerCase() === severity).length;
            if (count === 0) return null;
            return (
              <button 
                key={severity}
                className={filter === severity ? 'active' : ''} 
                onClick={() => setFilter(severity)}
                style={{ borderColor: getSeverityColor(severity) }}
              >
                {getSeverityIcon(severity)} {severity.charAt(0).toUpperCase() + severity.slice(1)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="tab-content">
        <div className="vulnerabilities-tab">
          <div className="vulnerabilities-by-severity">
            {severityOrder.map(severity => {
              const vulns = groupedVulns[severity];
              if (!vulns || vulns.length === 0) return null;
              
              return (
                <div key={severity} className="severity-section">
                  <h3 className="severity-header" style={{ 
                    color: getSeverityColor(severity),
                    borderColor: getSeverityColor(severity)
                  }}>
                    {getSeverityIcon(severity)} {severity.toUpperCase()} ({vulns.length})
                  </h3>
                  <div className="vulnerabilities-list">
                    {vulns.map((vuln, index) => (
                      <div key={index} className="vulnerability-item">
                        <div className="vuln-header">
                          <span className="severity-badge" style={{ backgroundColor: getSeverityColor(vuln.severity) }}>
                            {getSeverityIcon(vuln.severity)} {vuln.severity?.toUpperCase() || 'UNKNOWN'}
                          </span>
                          <h4>{vuln.title}</h4>
                        </div>
                        <div className="vuln-details">
                          <p><strong>🔗 URL:</strong> {vuln.url}</p>
                          <p><strong>📝 Description:</strong> {vuln.description}</p>
                          <p><strong>🔌 Protocol:</strong> {vuln.protocol}</p>
                          <p><strong>📁 Source:</strong> {vuln.source}</p>
                          {vuln.extra_info && <p><strong>ℹ️ Extra Info:</strong> {vuln.extra_info}</p>}
                          {vuln.scan_id && (
                            <p><strong>🔍 Scan:</strong> 
                              <Link to={`/scan/${vuln.scan_id}`} className="action-link">
                                View Scan Details
                              </Link>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {filteredVulns.length === 0 && (
              <div className="no-data">
                {filter === 'all' 
                  ? 'No vulnerabilities found' 
                  : `No ${filter} vulnerabilities found`
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vulnerabilities;
