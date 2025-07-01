import React from 'react';
import { useParams } from 'react-router-dom';

const ScanDetails = ({ scan, onBack }) => {
  const { id } = useParams();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="scan-details">
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-title">🔍 SCAN DETAILS</div>
          <div className="terminal-controls">
            <button onClick={handleBack} className="terminal-button">
              ← BACK
            </button>
          </div>
        </div>
        <div className="terminal-body">
          <h2>Scan Details</h2>
          <p>Scan ID: {id}</p>
          <p>Scan details will be displayed here...</p>
        </div>
      </div>
    </div>
  );
};

export default ScanDetails;
