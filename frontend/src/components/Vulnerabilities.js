import React from 'react';

const Vulnerabilities = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>🛡️ Vulnerabilities</h2>
      <p>Vulnerability management coming soon...</p>
import React, { useState, useEffect } from 'react';

const Vulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [filteredVulns, setFilteredVulns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('severity');

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  useEffect(() => {
    filterAndSortVulnerabilities();
  }, [vulnerabilities, severityFilter, searchTerm, sortBy]);

  const fetchVulnerabilities = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/vulnerabilities');
      if (response.ok) {
        const data = await response.json();
        setVulnerabilities(data);
      }
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortVulnerabilities = () => {
    let filtered = vulnerabilities.filter(vuln => {
      const matchesSeverity = severityFilter === 'all' || vuln.severity === severityFilter;
      const matchesSearch = vuln.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vuln.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vuln.url.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSeverity && matchesSearch;
    });

    // Sort vulnerabilities
    filtered.sort((a, b) => {
      if (sortBy === 'severity') {
        const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'target') {
        return a.target.localeCompare(b.target);
      }
      return 0;
    });

    setFilteredVulns(filtered);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'var(--error)';
      case 'high': return 'var(--warning)';
      case 'medium': return 'var(--info)';
      case 'low': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getVulnerabilityStats = () => {
    const stats = vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
      return acc;
    }, {});
    
    return {
      critical: stats.critical || 0,
      high: stats.high || 0,
      medium: stats.medium || 0,
      low: stats.low || 0,
      total: vulnerabilities.length
    };
  };

  const stats = getVulnerabilityStats();

  if (loading) {
    return (
      <div className="vulnerabilities">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading vulnerabilities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vulnerabilities">
      {/* Statistics Overview */}
      <div className="grid grid-4 mb-3">
        <div className="card stat-card">
          <div className="stat-content">
            <div className="stat-icon">🔴</div>
            <div className="stat-info">
              <div className="stat-value">{stats.critical}</div>
              <div className="stat-label">Critical</div>
            </div>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-content">
            <div className="stat-icon">🟠</div>
            <div className="stat-info">
              <div className="stat-value">{stats.high}</div>
              <div className="stat-label">High</div>
            </div>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-content">
            <div className="stat-icon">🟡</div>
            <div className="stat-info">
              <div className="stat-value">{stats.medium}</div>
              <div className="stat-label">Medium</div>
            </div>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-content">
            <div className="stat-icon">🟢</div>
            <div className="stat-info">
              <div className="stat-value">{stats.low}</div>
              <div className="stat-label">Low</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-3">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">🔍</div>
            Filter Vulnerabilities
          </div>
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search vulnerabilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label className="form-label">Severity</label>
            <select
              className="form-select"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="severity">Severity</option>
              <option value="title">Title</option>
              <option value="target">Target</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vulnerabilities List */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">🛡️</div>
            Vulnerabilities ({filteredVulns.length})
          </div>
        </div>

        {filteredVulns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛡️</div>
            <h3>No vulnerabilities found</h3>
            <p>
              {vulnerabilities.length === 0 
                ? "No vulnerabilities have been discovered yet" 
                : "No vulnerabilities match your current filters"
              }
            </p>
          </div>
        ) : (
          <div className="vulnerabilities-list">
            {filteredVulns.map((vuln, index) => (
              <div key={index} className="vulnerability-item">
                <div className="vulnerability-header">
                  <div className="vulnerability-main">
                    <div className="severity-indicator">
                      <span className="severity-icon">{getSeverityIcon(vuln.severity)}</span>
                      <span 
                        className="severity-label"
                        style={{ color: getSeverityColor(vuln.severity) }}
                      >
                        {vuln.severity?.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="vulnerability-title">{vuln.title}</h4>
                  </div>
                  <div className="vulnerability-meta">
                    <span className="target-info">{vuln.target}</span>
                  </div>
                </div>

                <div className="vulnerability-details">
                  <p className="vulnerability-description">{vuln.description}</p>
                  
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>URL:</strong>
                      <a href={vuln.url} target="_blank" rel="noopener noreferrer" className="url-link">
                        {vuln.url}
                      </a>
                    </div>
                    
                    {vuln.method && (
                      <div className="detail-item">
                        <strong>Method:</strong>
                        <span className="method-badge">{vuln.method}</span>
                      </div>
                    )}
                    
                    {vuln.parameter && (
                      <div className="detail-item">
                        <strong>Parameter:</strong>
                        <code className="parameter-code">{vuln.parameter}</code>
                      </div>
                    )}
                    
                    {vuln.payload && (
                      <div className="detail-item payload-item">
                        <strong>Payload:</strong>
                        <code className="payload-code">{vuln.payload}</code>
                      </div>
                    )}
                    
                    {vuln.solution && (
                      <div className="detail-item solution-item">
                        <strong>Solution:</strong>
                        <p className="solution-text">{vuln.solution}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 255, 255, 0.1);
        }

        .stat-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .filters {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1rem;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
        }

        .vulnerabilities-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .vulnerability-item {
          background: var(--bg-primary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .vulnerability-item:hover {
          border-color: var(--accent-cyan);
          box-shadow: 0 4px 15px rgba(0, 255, 255, 0.1);
        }

        .vulnerability-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .vulnerability-main {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .severity-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .severity-icon {
          font-size: 1.2rem;
        }

        .severity-label {
          font-size: 0.8rem;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
        }

        .vulnerability-title {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.2rem;
        }

        .vulnerability-meta {
          text-align: right;
        }

        .target-info {
          color: var(--text-secondary);
          font-size: 0.9rem;
          background: var(--bg-tertiary);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .vulnerability-description {
          color: var(--text-secondary);
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .detail-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item strong {
          color: var(--accent-cyan);
          font-size: 0.9rem;
        }

        .url-link {
          color: var(--accent-orange);
          text-decoration: none;
          word-break: break-all;
        }

        .url-link:hover {
          text-decoration: underline;
        }

        .method-badge {
          background: var(--accent-blue);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .parameter-code {
          background: var(--bg-tertiary);
          color: var(--accent-green);
          padding: 4px 8px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }

        .payload-code {
          background: var(--bg-tertiary);
          color: var(--accent-orange);
          padding: 8px 12px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          white-space: pre-wrap;
          word-break: break-all;
          border-left: 3px solid var(--accent-orange);
        }

        .solution-text {
          background: var(--bg-tertiary);
          color: var(--success);
          padding: 8px 12px;
          border-radius: 4px;
          margin: 0;
          border-left: 3px solid var(--success);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
        }

        @media (max-width: 768px) {
          .filters {
            grid-template-columns: 1fr;
          }
          
          .vulnerability-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .vulnerability-main {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Vulnerabilities;
