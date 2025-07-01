import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const NewScan = () => {
  const navigate = useNavigate();
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState('comprehensive');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!target.trim()) {
      setError('Please enter a target URL');
      return;
    }

    setLoading(true);
    try {
      const scanData = {
        targets: [target.trim()],
        scan_types: [scanType],
        config: {
          max_depth: 3,
          timeout: 5000,
          user_agent: 'AKUMA Scanner v3.0'
        }
      };

      console.log('Submitting scan:', scanData);

      const response = await fetch(`${API_BASE_URL}/api/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scanData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Scan created:', result);
      
      // Navigate to dashboard or scan details
      navigate('/');
      
    } catch (err) {
      console.error('Failed to create scan:', err);
      setError(err.message || 'Failed to create scan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-scan">
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-title">🎯 CREATE NEW SCAN</div>
        </div>
        <div className="terminal-body">
          <form onSubmit={handleSubmit} className="scan-form">
            {error && (
              <div className="error-message" style={{ color: '#ff4757', marginBottom: '1rem' }}>
                ❌ {error}
              </div>
            )}

            <div className="form-section">
              <h3>🎯 Target</h3>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="https://example.com"
                className="form-input"
                style={{ width: '100%', padding: '10px', marginBottom: '1rem' }}
              />
            </div>

            <div className="form-section">
              <h3>🔍 Scan Type</h3>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '10px', marginBottom: '1rem' }}
              >
                <option value="comprehensive">Comprehensive Scan</option>
                <option value="quick">Quick Scan</option>
                <option value="deep">Deep Scan</option>
              </select>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ 
                  padding: '15px 30px', 
                  fontSize: '1.1rem',
                  background: loading ? '#666' : '#00ff88',
                  color: '#000',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '🔄 Starting Scan...' : '🚀 Start Scan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewScan;
