import React, { useState } from 'react';
import { api } from '../services/api';

const CreateScan = () => {
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    scan_type: 'basic',
    options: {
      max_depth: 3,
      threads: 10,
      timeout: 30,
      include_subdomains: false,
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [targetFile, setTargetFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('options.')) {
      const optionName = name.replace('options.', '');
      setFormData(prev => ({
        ...prev,
        options: {
          ...prev.options,
          [optionName]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setTargetFile(file);
    try {
      const result = await api.uploadTargets(file);
      if (result.targets && result.targets.length > 0) {
        setFormData(prev => ({
          ...prev,
          target: result.targets.join('\n')
        }));
        setSubmitResult({
          type: 'success',
          message: `Successfully loaded ${result.targets.length} targets from file`
        });
      }
    } catch (error) {
      setSubmitResult({
        type: 'error',
        message: `Failed to upload targets: ${error.message}`
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const scanData = {
        ...formData,
        target: formData.target.trim()
      };

      const result = await api.createScan(scanData);
      
      setSubmitResult({
        type: 'success',
        message: `Scan "${result.name}" created successfully! ID: ${result.id}`
      });

      // Reset form
      setFormData({
        name: '',
        target: '',
        scan_type: 'basic',
        options: {
          max_depth: 3,
          threads: 10,
          timeout: 30,
          include_subdomains: false,
        }
      });
      setTargetFile(null);

    } catch (error) {
      setSubmitResult({
        type: 'error',
        message: `Failed to create scan: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>🔍 Create New Scan</h2>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label htmlFor="name">Scan Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="e.g., Production Website Security Audit"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="target">Target URL(s) *</label>
          <textarea
            id="target"
            name="target"
            value={formData.target}
            onChange={handleInputChange}
            className="form-input"
            rows="4"
            placeholder="https://example.com&#10;https://api.example.com&#10;192.168.1.100"
            required
            style={{ resize: 'vertical', minHeight: '100px' }}
          />
          <div style={{ marginTop: '10px' }}>
            <label htmlFor="targetFile" className="btn" style={{ cursor: 'pointer', display: 'inline-block' }}>
              📁 Upload Targets File
            </label>
            <input
              type="file"
              id="targetFile"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            {targetFile && (
              <span style={{ marginLeft: '10px', color: '#00cccc' }}>
                Selected: {targetFile.name}
              </span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="scan_type">Scan Type</label>
          <select
            id="scan_type"
            name="scan_type"
            value={formData.scan_type}
            onChange={handleInputChange}
            className="form-input"
          >
            <option value="basic">Basic Security Scan</option>
            <option value="comprehensive">Comprehensive Assessment</option>
            <option value="quick">Quick Vulnerability Check</option>
            <option value="deep">Deep Penetration Test</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label htmlFor="max_depth">Max Crawl Depth</label>
            <input
              type="number"
              id="max_depth"
              name="options.max_depth"
              value={formData.options.max_depth}
              onChange={handleInputChange}
              className="form-input"
              min="1"
              max="10"
            />
          </div>

          <div className="form-group">
            <label htmlFor="threads">Thread Count</label>
            <input
              type="number"
              id="threads"
              name="options.threads"
              value={formData.options.threads}
              onChange={handleInputChange}
              className="form-input"
              min="1"
              max="50"
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeout">Request Timeout (seconds)</label>
            <input
              type="number"
              id="timeout"
              name="options.timeout"
              value={formData.options.timeout}
              onChange={handleInputChange}
              className="form-input"
              min="5"
              max="120"
            />
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="options.include_subdomains"
              checked={formData.options.include_subdomains}
              onChange={handleInputChange}
              style={{ marginRight: '10px' }}
            />
            Include Subdomains in Scan
          </label>
        </div>

        {submitResult && (
          <div style={{
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
            background: submitResult.type === 'success' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
            border: `2px solid ${submitResult.type === 'success' ? '#00ff00' : '#ff0000'}`,
            color: submitResult.type === 'success' ? '#00ff00' : '#ff0000'
          }}>
            {submitResult.message}
          </div>
        )}

        <button type="submit" className="btn" disabled={isSubmitting} style={{ width: '100%' }}>
          {isSubmitting ? '🔄 Creating Scan...' : '🚀 Launch Scan'}
        </button>
      </form>

      <div className="card">
        <h3 style={{ marginBottom: '15px' }}>📋 Scan Types Overview</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          <div style={{ padding: '15px', background: 'rgba(0, 255, 0, 0.05)', borderRadius: '5px' }}>
            <strong style={{ color: '#00ff00' }}>Basic Security Scan</strong>
            <p style={{ margin: '5px 0', color: '#cccccc' }}>
              Standard vulnerability assessment including common security flaws, SSL issues, and basic misconfigurations.
            </p>
          </div>
          <div style={{ padding: '15px', background: 'rgba(0, 255, 255, 0.05)', borderRadius: '5px' }}>
            <strong style={{ color: '#00ffff' }}>Comprehensive Assessment</strong>
            <p style={{ margin: '5px 0', color: '#cccccc' }}>
              In-depth security analysis with advanced vulnerability detection, authentication testing, and business logic flaws.
            </p>
          </div>
          <div style={{ padding: '15px', background: 'rgba(255, 255, 0, 0.05)', borderRadius: '5px' }}>
            <strong style={{ color: '#ffff00' }}>Quick Vulnerability Check</strong>
            <p style={{ margin: '5px 0', color: '#cccccc' }}>
              Fast scan focusing on critical vulnerabilities and common attack vectors. Ideal for regular monitoring.
            </p>
          </div>
          <div style={{ padding: '15px', background: 'rgba(255, 0, 255, 0.05)', borderRadius: '5px' }}>
            <strong style={{ color: '#ff00ff' }}>Deep Penetration Test</strong>
            <p style={{ margin: '5px 0', color: '#cccccc' }}>
              Thorough security assessment simulating real-world attacks with advanced exploitation techniques.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateScan;
