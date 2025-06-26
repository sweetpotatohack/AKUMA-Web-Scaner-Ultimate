import React, { useState } from 'react';
import { usePolling } from '../hooks/useApi';
import { api } from '../services/api';

const Scans = () => {
  const { data: scans, loading, error, refetch } = usePolling(() => api.getScans(), 5000);
  const [selectedScan, setSelectedScan] = useState(null);
  const [scanDetails, setScanDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleScanClick = async (scan) => {
    setSelectedScan(scan);
    setLoadingDetails(true);
    setScanDetails(null);

    try {
      const [details, progress, results] = await Promise.all([
        api.getScan(scan.id),
        api.getScanProgress(scan.id),
        scan.status === 'completed' ? api.getScanResults(scan.id) : Promise.resolve(null)
      ]);

      setScanDetails({
        ...details,
        progress,
        results
      });
    } catch (error) {
      console.error('Failed to load scan details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const generateReport = async (scanId, format = 'html') => {
    try {
      const report = await api.generateReport(scanId, format);
      
      if (format === 'html') {
        const blob = new Blob([report], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scan-${scanId}-report.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading scans</div>;
  }

  if (error) {
    return (
      <div className="card">
        <h3 style={{ color: '#ff0000' }}>❌ Error Loading Scans</h3>
        <p>{error}</p>
        <button onClick={refetch} className="btn">🔄 Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>📊 Scan Management</h2>

      <div style={{ display: 'grid', gridTemplateColumns: selectedScan ? '1fr 1fr' : '1fr', gap: '20px' }}>
        {/* Scans List */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>All Scans ({scans?.length || 0})</h3>
          
          {!scans || scans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              <p>No scans found.</p>
              <p>Create your first scan to get started!</p>
            </div>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {scans.map(scan => (
                <div
                  key={scan.id}
                  onClick={() => handleScanClick(scan)}
                  style={{
                    padding: '15px',
                    marginBottom: '10px',
                    background: selectedScan?.id === scan.id ? 'rgba(0, 255, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    border: selectedScan?.id === scan.id ? '2px solid #00ff00' : '1px solid #333',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{scan.name}</div>
                      <div style={{ fontSize: '0.9em', color: '#00cccc', marginBottom: '5px' }}>
                        🎯 {scan.target.length > 50 ? scan.target.substring(0, 50) + '...' : scan.target}
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#888' }}>
                        {new Date(scan.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                        <span className={`status-indicator status-${scan.status}`}></span>
                        <span style={{ color: getStatusColor(scan.status), fontWeight: 'bold' }}>
                          {scan.status.toUpperCase()}
                        </span>
                      </div>
                      {scan.vulnerabilities_count > 0 && (
                        <div style={{ fontSize: '0.8em', color: '#ff6600' }}>
                          ⚠️ {scan.vulnerabilities_count} issues
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scan Details */}
        {selectedScan && (
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>🔍 Scan Details</h3>
            
            {loadingDetails ? (
              <div className="loading">Loading scan details</div>
            ) : scanDetails ? (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#00ff00' }}>{scanDetails.name}</h4>
                  <p style={{ color: '#00cccc', margin: '5px 0' }}>
                    <strong>Target:</strong> {scanDetails.target}
                  </p>
                  <p style={{ color: '#00cccc', margin: '5px 0' }}>
                    <strong>Type:</strong> {scanDetails.scan_type}
                  </p>
                  <p style={{ color: '#00cccc', margin: '5px 0' }}>
                    <strong>Status:</strong> 
                    <span style={{ color: getStatusColor(scanDetails.status), marginLeft: '10px' }}>
                      {scanDetails.status.toUpperCase()}
                    </span>
                  </p>
                  <p style={{ color: '#00cccc', margin: '5px 0' }}>
                    <strong>Created:</strong> {new Date(scanDetails.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Progress Bar */}
                {scanDetails.status === 'running' && scanDetails.progress && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px' }}>📈 Progress</h4>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${scanDetails.progress.percentage}%` }}
                      ></div>
                    </div>
                    <p style={{ textAlign: 'center', margin: '10px 0' }}>
                      {scanDetails.progress.percentage}% - {scanDetails.progress.current_step}
                    </p>
                    <div style={{ fontSize: '0.9em', color: '#888' }}>
                      <p>URLs Scanned: {scanDetails.progress.urls_scanned}</p>
                      <p>Vulnerabilities Found: {scanDetails.progress.vulnerabilities_found}</p>
                    </div>
                  </div>
                )}

                {/* Vulnerabilities */}
                {scanDetails.results && scanDetails.results.vulnerabilities && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '15px' }}>🚨 Vulnerabilities Found</h4>
                    {scanDetails.results.vulnerabilities.length === 0 ? (
                      <p style={{ color: '#00ff00', textAlign: 'center', padding: '20px' }}>
                        ✅ No vulnerabilities detected!
                      </p>
                    ) : (
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {scanDetails.results.vulnerabilities.map((vuln, index) => (
                          <div key={index} className={`vulnerability-item vuln-${vuln.severity.toLowerCase()}`}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                              {getSeverityIcon(vuln.severity)} {vuln.title}
                            </div>
                            <div style={{ fontSize: '0.9em', marginBottom: '5px', color: '#ccc' }}>
                              <strong>URL:</strong> {vuln.url}
                            </div>
                            <div style={{ fontSize: '0.9em', marginBottom: '5px', color: '#ccc' }}>
                              <strong>Type:</strong> {vuln.type}
                            </div>
                            <div style={{ fontSize: '0.9em', color: '#ccc' }}>
                              {vuln.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {scanDetails.status === 'completed' && (
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => generateReport(scanDetails.id, 'html')}
                      className="btn"
                      style={{ marginRight: '10px' }}
                    >
                      📄 Download HTML Report
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p>Failed to load scan details.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'running': return '#ffff00';
    case 'completed': return '#00ff00';
    case 'failed': return '#ff0000';
    case 'pending': return '#888';
    default: return '#888';
  }
};

const getSeverityIcon = (severity) => {
  switch (severity.toLowerCase()) {
    case 'critical': return '🔴';
    case 'high': return '🟠';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
};

export default Scans;
