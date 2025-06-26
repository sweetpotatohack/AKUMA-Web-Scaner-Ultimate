import React, { useState } from 'react';

const NewScan = ({ onScanCreated }) => {
  const [inputMethod, setInputMethod] = useState('manual');
  const [targets, setTargets] = useState('');
  const [file, setFile] = useState(null);
  const [scanType, setScanType] = useState('comprehensive');
  const [maxDepth, setMaxDepth] = useState(3);
  const [threads, setThreads] = useState(10);
  const [timeout, setTimeout] = useState(30);
  const [rateLimit, setRateLimit] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;
      
      if (inputMethod === 'manual') {
        const targetList = targets.split('\n').map(t => t.trim()).filter(t => t);
        
        response = await fetch('http://localhost:8000/api/scans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targets: targetList,
            scan_type: scanType,
            max_depth: maxDepth,
            threads: threads,
            timeout: timeout,
            rate_limit: rateLimit
          }),
        });
      } else {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('scan_type', scanType);
        formData.append('max_depth', maxDepth);
        formData.append('threads', threads);
        formData.append('timeout', timeout);
        formData.append('rate_limit', rateLimit);

        response = await fetch('http://localhost:8000/api/scans/upload', {
          method: 'POST',
          body: formData,
        });
      }

      if (response.ok) {
        const result = await response.json();
        onScanCreated(result);
        
        // Reset form
        setTargets('');
        setFile(null);
        setScanType('comprehensive');
        setMaxDepth(3);
        setThreads(10);
        setTimeout(30);
        setRateLimit(60);
      } else {
        console.error('Failed to create scan');
      }
    } catch (error) {
      console.error('Error creating scan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new-scan">
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">🎯</div>
            Create New Scan
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Input Method Selection */}
          <div className="form-group">
            <label className="form-label">Input Method</label>
            <div className="input-method-tabs">
              <button
                type="button"
                className={`method-tab ${inputMethod === 'manual' ? 'active' : ''}`}
                onClick={() => setInputMethod('manual')}
              >
                📝 Manual Entry
              </button>
              <button
                type="button"
                className={`method-tab ${inputMethod === 'file' ? 'active' : ''}`}
                onClick={() => setInputMethod('file')}
              >
                📄 File Upload
              </button>
            </div>
          </div>

          {/* Target Input */}
          {inputMethod === 'manual' ? (
            <div className="form-group">
              <label className="form-label">
                Targets (one per line)
                <span className="label-hint">Enter URLs or IP addresses</span>
              </label>
              <textarea
                className="form-textarea"
                value={targets}
                onChange={(e) => setTargets(e.target.value)}
                placeholder="https://example.com&#10;https://test.com&#10;192.168.1.1"
                rows={6}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">
                Upload Target File
                <span className="label-hint">Text file with one target per line</span>
              </label>
              <div className="file-upload-area">
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileChange}
                  className="file-input"
                  id="target-file"
                  required
                />
                <label htmlFor="target-file" className="file-upload-label">
                  <div className="upload-icon">📄</div>
                  <div className="upload-text">
                    {file ? file.name : 'Choose file or drag and drop'}
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Scan Configuration */}
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Scan Type</label>
              <select
                className="form-select"
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
              >
                <option value="quick">Quick Scan</option>
                <option value="standard">Standard Scan</option>
                <option value="comprehensive">Comprehensive Scan</option>
                <option value="custom">Custom Scan</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Max Depth
                <span className="label-hint">Directory traversal depth</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={maxDepth}
                onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                min="1"
                max="10"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Threads
                <span className="label-hint">Concurrent connections</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={threads}
                onChange={(e) => setThreads(parseInt(e.target.value))}
                min="1"
                max="50"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Timeout (seconds)
                <span className="label-hint">Request timeout</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={timeout}
                onChange={(e) => setTimeout(parseInt(e.target.value))}
                min="5"
                max="120"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Rate Limit (req/min)
                <span className="label-hint">Requests per minute</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={rateLimit}
                onChange={(e) => setRateLimit(parseInt(e.target.value))}
                min="1"
                max="300"
              />
            </div>
          </div>

          {/* Scan Preview */}
          <div className="scan-preview">
            <h4>Scan Configuration Preview</h4>
            <div className="preview-grid">
              <div className="preview-item">
                <span className="preview-label">Type:</span>
                <span className="preview-value">{scanType}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Depth:</span>
                <span className="preview-value">{maxDepth}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Threads:</span>
                <span className="preview-value">{threads}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Rate:</span>
                <span className="preview-value">{rateLimit} req/min</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || (inputMethod === 'manual' && !targets.trim()) || (inputMethod === 'file' && !file)}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner" style={{width: '16px', height: '16px'}}></div>
                  Starting Scan...
                </>
              ) : (
                <>
                  🚀 Start Scan
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Styles */}
      <style jsx>{`
        .input-method-tabs {
          display: flex;
          gap: 4px;
          background: var(--bg-tertiary);
          border-radius: 8px;
          padding: 4px;
        }

        .method-tab {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 12px 20px;
          cursor: pointer;
          font-family: inherit;
          font-size: 1rem;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .method-tab:hover {
          color: var(--text-primary);
          background: var(--bg-secondary);
        }

        .method-tab.active {
          background: var(--accent-cyan);
          color: var(--bg-primary);
        }

        .label-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: normal;
          margin-left: 8px;
        }

        .file-upload-area {
          position: relative;
        }

        .file-input {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .file-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          border: 2px dashed var(--border-primary);
          border-radius: 8px;
          background: var(--bg-tertiary);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .file-upload-label:hover {
          border-color: var(--accent-cyan);
          background: var(--bg-secondary);
        }

        .upload-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .upload-text {
          color: var(--text-secondary);
          text-align: center;
        }

        .scan-preview {
          background: var(--bg-primary);
          padding: 1.5rem;
          border-radius: 8px;
          margin: 1.5rem 0;
          border: 1px solid var(--border-primary);
        }

        .scan-preview h4 {
          margin: 0 0 1rem 0;
          color: var(--accent-cyan);
        }

        .preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .preview-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: var(--bg-tertiary);
          border-radius: 4px;
        }

        .preview-label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .preview-value {
          color: var(--text-primary);
          font-weight: bold;
        }

        .form-actions {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }

        .btn-primary {
          background: var(--gradient-primary);
          padding: 15px 30px;
          font-size: 1.1rem;
          min-width: 200px;
        }

        @media (max-width: 768px) {
          .input-method-tabs {
            flex-direction: column;
          }
          
          .preview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default NewScan;
