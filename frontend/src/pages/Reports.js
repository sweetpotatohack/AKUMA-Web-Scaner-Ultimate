import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../components/ScanDetails.css';
import { API_BASE_URL } from '../config/api';

const Reports = () => {
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [reportType, setReportType] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scans`);
      if (response.ok) {
        const data = await response.json();
        setScans(data.filter(scan => scan.status === 'completed'));
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedScan) return;
    
    setGenerating(true);
    try {
      const response = await fetch(`http://localhost:8000/api/scans/${selectedScan.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format: reportType })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `akuma_report_${selectedScan.target}_${reportType}.${reportType === 'pdf' ? 'pdf' : 'html'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) return <div className="loading">🔄 Loading scans...</div>;

  return (
    <div className="scan-details">
      <div className="scan-details-header">
        <Link to="/dashboard" className="back-button">← Back to Dashboard</Link>
        <h2>📊 Reports Generation</h2>
        <div className="scan-status">
          <span className="status completed">Available Scans: {scans.length}</span>
        </div>
      </div>

      <div className="reports-content">
        <div className="reports-grid">
          <div className="scans-selection">
            <h3>🔍 Select Scan for Report</h3>
            <div className="scans-list">
              {scans.length === 0 ? (
                <div className="no-data">
                  No completed scans available for reporting.<br/>
                  Complete a scan first to generate reports.
                </div>
              ) : (
                scans.map(scan => (
                  <div 
                    key={scan.id} 
                    className={`scan-item ${selectedScan?.id === scan.id ? 'selected' : ''}`}
                    onClick={() => setSelectedScan(scan)}
                  >
                    <div className="scan-info">
                      <div className="scan-target">{scan.target}</div>
                      <div className="scan-meta">
                        <span className="scan-type">{scan.scan_type}</span>
                        <span className="scan-date">{formatDate(scan.created_at)}</span>
                      </div>
                      <div className="scan-stats">
                        <span className="vulns-count">🛡️ {scan.vulnerabilities_count || 0} vulns</span>
                        <span className="ports-count">🔌 {scan.ports_count || 0} ports</span>
                      </div>
                    </div>
                    {selectedScan?.id === scan.id && (
                      <div className="selected-indicator">✓</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="report-options">
            <h3>📋 Report Configuration</h3>
            
            <div className="report-type-selection">
              <h4>Report Type:</h4>
              <div className="radio-group">
                <label className={reportType === 'summary' ? 'active' : ''}>
                  <input 
                    type="radio" 
                    value="summary" 
                    checked={reportType === 'summary'}
                    onChange={(e) => setReportType(e.target.value)}
                  />
                  📝 Summary Report
                  <small>Overview with key findings and statistics</small>
                </label>
                
                <label className={reportType === 'detailed' ? 'active' : ''}>
                  <input 
                    type="radio" 
                    value="detailed" 
                    checked={reportType === 'detailed'}
                    onChange={(e) => setReportType(e.target.value)}
                  />
                  📖 Detailed Report
                  <small>Complete analysis with all vulnerabilities</small>
                </label>
                
                <label className={reportType === 'executive' ? 'active' : ''}>
                  <input 
                    type="radio" 
                    value="executive" 
                    checked={reportType === 'executive'}
                    onChange={(e) => setReportType(e.target.value)}
                  />
                  👔 Executive Summary
                  <small>High-level overview for management</small>
                </label>
              </div>
            </div>

            <div className="report-preview">
              {selectedScan && (
                <>
                  <h4>📄 Report Preview:</h4>
                  <div className="preview-content">
                    <div className="preview-header">
                      <h5>AKUMA Scanner Report</h5>
                      <p><strong>Target:</strong> {selectedScan.target}</p>
                      <p><strong>Scan Type:</strong> {selectedScan.scan_type}</p>
                      <p><strong>Date:</strong> {formatDate(selectedScan.created_at)}</p>
                      <p><strong>Status:</strong> {selectedScan.status}</p>
                    </div>
                    
                    <div className="preview-sections">
                      <div className="section">
                        <h6>📊 Executive Summary</h6>
                        <p>Security assessment completed for {selectedScan.target}</p>
                      </div>
                      
                      <div className="section">
                        <h6>🛡️ Vulnerability Analysis</h6>
                        <p>Detailed analysis of identified security issues</p>
                      </div>
                      
                      <div className="section">
                        <h6>🔌 Network Analysis</h6>
                        <p>Open ports and service enumeration results</p>
                      </div>
                      
                      <div className="section">
                        <h6>💡 Recommendations</h6>
                        <p>Security recommendations and remediation steps</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="generate-button-container">
              <button 
                className="generate-button"
                onClick={generateReport}
                disabled={!selectedScan || generating}
              >
                {generating ? (
                  <>🔄 Generating Report...</>
                ) : (
                  <>📤 Generate Report</>
                )}
              </button>
              
              {selectedScan && (
                <div className="button-help">
                  Report will be downloaded automatically when ready
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
