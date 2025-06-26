import React, { useState } from 'react';

const Reports = ({ scans }) => {
  const [selectedScans, setSelectedScans] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState(null);

  const toggleSelectScan = (scanId) => {
    setSelectedScans((prevSelected) => {
      if (prevSelected.includes(scanId)) {
        return prevSelected.filter(id => id !== scanId);
      } else {
        return [...prevSelected, scanId];
      }
    });
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReportUrl(null);

    try {
      const response = await fetch('http://localhost:8000/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedScans),
      });

      if (response.ok) {
        const reportHtml = await response.text();

        // Create a Blob URL for the report
        const blob = new Blob([reportHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setReportUrl(url);
      } else {
        console.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearSelection = () => {
    setSelectedScans([]);
  };

  return (
    <div className="reports">
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">📋</div>
            Generate Reports
          </div>
        </div>

        <div className="scan-selection">
          {scans.map((scan) => (
            <label key={scan.id} className="scan-option">
              <input
                type="checkbox"
                checked={selectedScans.includes(scan.id)}
                onChange={() => toggleSelectScan(scan.id)}
              />
              <span className="option-label">{scan.target} ({scan.status})</span>
            </label>
          ))}
        </div>

        <div className="form-actions">
          <button
            className="btn btn-primary"
            onClick={handleGenerateReport}
            disabled={selectedScans.length === 0 || isGenerating}
          >
            {isGenerating ? 'Generating Report...' : 'Generate Report'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={clearSelection}
            disabled={selectedScans.length === 0}
          >
            Clear Selection
          </button>
        </div>

        {reportUrl && (
          <div className="report-viewer">
            <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="btn btn-success">
              View Report
            </a>
          </div>
        )}
      </div>

      <style jsx>{`
        .scan-selection {
          max-height: 300px;
          overflow-y: auto;
          background: var(--bg-primary);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid var(--border-primary);
          margin-top: 1rem;
        }

        .scan-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0;
        }

        .option-label {
          color: var(--text-primary);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin: 2rem 0;
        }

        .report-viewer {
          text-align: center;
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .scan-selection {
            max-height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default Reports;
