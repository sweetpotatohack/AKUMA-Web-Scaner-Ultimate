import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewScan.css';
import { API_BASE_URL } from '../config/api';

const NewScan = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    targets: [''],
    scanTypes: ['comprehensive'],
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTargetChange = (index, value) => {
    const newTargets = [...formData.targets];
    newTargets[index] = value;
    setFormData(prev => ({ ...prev, targets: newTargets }));
  };

  const addTarget = () => {
    setFormData(prev => ({ ...prev, targets: [...prev.targets, ''] }));
  };

  const removeTarget = (index) => {
    if (formData.targets.length > 1) {
      const newTargets = formData.targets.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, targets: newTargets }));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const targets = content.split('\n').filter(line => line.trim() !== '');
        setFormData(prev => ({ ...prev, targets }));
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validTargets = formData.targets.filter(target => target.trim() !== '');
    if (validTargets.length === 0) {
      setError('Please enter at least one target');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targets: validTargets,
          scanTypes: formData.scanTypes,
          description: formData.description
        }),
      });

      if (response.ok) {
        const result = await response.json();
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create scan');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-scan">
      <div className="new-scan-header">
        <h2>🎯 Create New Security Scan</h2>
        <p>Configure your cybersecurity assessment</p>
      </div>

      <form onSubmit={handleSubmit} className="scan-form">
        {error && <div className="error-message">❌ {error}</div>}

        <div className="form-section">
          <h3>🎯 Target Configuration</h3>
          
          <div className="targets-section">
            <label>Targets (URLs/IPs):</label>
            {formData.targets.map((target, index) => (
              <div key={index} className="target-input-group">
                <input
                  type="text"
                  value={target}
                  onChange={(e) => handleTargetChange(index, e.target.value)}
                  placeholder="Enter target URL or IP (e.g., example.com, 192.168.1.1)"
                  className="target-input"
                />
                {formData.targets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTarget(index)}
                    className="remove-target-btn"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            
            <div className="target-actions">
              <button type="button" onClick={addTarget} className="add-target-btn">
                ➕ Add Target
              </button>
              
              <div className="file-upload">
                <label htmlFor="file-input" className="file-upload-btn">
                  📁 Upload Target List
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>⚙️ Scan Configuration</h3>
          
          <div className="scan-types">
            <label>Scan Type:</label>
            <div className="scan-type-options">
              <label className="scan-type-option">
                <input
                  type="radio"
                  name="scanType"
                  value="basic"
                  checked={formData.scanTypes.includes('basic')}
                  onChange={(e) => setFormData(prev => ({ ...prev, scanTypes: [e.target.value] }))}
                />
                <span className="option-label">
                  <span className="option-icon">🔍</span>
                  <span className="option-text">
                    <strong>Basic Scan</strong>
                    <br />
                    <small>Port scan and basic vulnerability assessment</small>
                  </span>
                </span>
              </label>
              
              <label className="scan-type-option">
                <input
                  type="radio"
                  name="scanType"
                  value="comprehensive"
                  checked={formData.scanTypes.includes('comprehensive')}
                  onChange={(e) => setFormData(prev => ({ ...prev, scanTypes: [e.target.value] }))}
                />
                <span className="option-label">
                  <span className="option-icon">🛡️</span>
                  <span className="option-text">
                    <strong>Comprehensive Scan</strong>
                    <br />
                    <small>Full security assessment with CMS detection and fuzzing</small>
                  </span>
                </span>
              </label>
              
              <label className="scan-type-option">
                <input
                  type="radio"
                  name="scanType"
                  value="stealth"
                  checked={formData.scanTypes.includes('stealth')}
                  onChange={(e) => setFormData(prev => ({ ...prev, scanTypes: [e.target.value] }))}
                />
                <span className="option-label">
                  <span className="option-icon">👻</span>
                  <span className="option-text">
                    <strong>Stealth Scan</strong>
                    <br />
                    <small>Low-profile scanning to avoid detection</small>
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>📝 Additional Options</h3>
          
          <div className="description-section">
            <label htmlFor="description">Description (Optional):</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter a description for this scan..."
              className="description-input"
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="cancel-btn"
          >
            ↩️ Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? (
              <>🔄 Creating Scan...</>
            ) : (
              <>🚀 Start Scan</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewScan;
