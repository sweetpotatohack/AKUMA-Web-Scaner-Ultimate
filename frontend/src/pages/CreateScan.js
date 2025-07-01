import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const CreateScan = () => {
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    scan_type: 'full',
    options: {
      max_depth: 3,
      threads: 10,
      timeout: 30,
      include_subdomains: false,
      aggressive_mode: false,
      stealth_mode: false,
      custom_wordlist: false,
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [targetFile, setTargetFile] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [commandHistory, setCommandHistory] = useState([
    'root@kali-akuma:~# akuma --init',
    '[INFO] AKUMA Scanner v3.0 initialized',
    '[INFO] Loading target acquisition module...',
    '[READY] Awaiting target configuration'
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const addToHistory = (command, result = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setCommandHistory(prev => [
      ...prev,
      `[${timestamp}] ${command}`,
      ...(result ? [`[RESULT] ${result}`] : [])
    ]);
  };

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
    addToHistory(`akuma --load-targets ${file.name}`);
    
    try {
      const result = await api.uploadTargets(file);
      if (result.targets && result.targets.length > 0) {
        setFormData(prev => ({
          ...prev,
          target: result.targets.join('\n')
        }));
        addToHistory('', `Successfully loaded ${result.targets.length} targets`);
        setSubmitResult({
          type: 'success',
          message: `[TARGET_LOADED] ${result.targets.length} targets acquired from ${file.name}`
        });
      }
    } catch (error) {
      addToHistory('', `Error loading targets: ${error.message}`);
      setSubmitResult({
        type: 'error',
        message: `[ERROR] Failed to load targets: ${error.message}`
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    const scanCommand = `akuma --scan ${formData.target} --type ${formData.scan_type}`;
    addToHistory(scanCommand);

    try {
      const scanData = {
        ...formData,
        target: formData.target.trim()
      };

      const result = await api.createScan(scanData);
      
      addToHistory('', `Scan "${formData.name}" initiated with ID: ${result.scan_id}`);
      setSubmitResult({
        type: 'success',
        message: `[SCAN_INITIATED] "${formData.name}" - ID: ${result.scan_id}`
      });

      // Reset form
      setFormData({
        name: '',
        target: '',
        scan_type: 'full',
        options: {
          max_depth: 3,
          threads: 10,
          timeout: 30,
          include_subdomains: false,
          aggressive_mode: false,
          stealth_mode: false,
          custom_wordlist: false,
        }
      });
      setTargetFile(null);

    } catch (error) {
      addToHistory('', `FATAL: ${error.message}`);
      setSubmitResult({
        type: 'error',
        message: `[FATAL_ERROR] Failed to initiate scan: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scanTypes = [
    { value: 'quick', name: 'QUICK_SCAN', desc: 'Fast reconnaissance + critical vulns' },
    { value: 'full', name: 'FULL_SPECTRUM', desc: 'Deep penetration testing + fuzzing' }
  ];

  return (
    <div style={{ 
      fontFamily: 'Courier New, monospace',
      background: '#0a0a0a',
      color: '#00ff00',
      minHeight: '100vh',
      padding: '20px'
    }}>
      
      {/* Terminal Header */}
      <div style={{
        border: '2px solid #00ff00',
        padding: '15px',
        marginBottom: '20px',
        background: '#000000'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, color: '#00ff00' }}>
              ⚡ AKUMA TARGET ACQUISITION SYSTEM v3.0 ⚡
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#ffff00' }}>
              root@kali-akuma:~# akuma --new-scan --interactive
            </p>
          </div>
          <div style={{ textAlign: 'right', color: '#00ffff' }}>
            <div>[{currentTime.toLocaleDateString()}]</div>
            <div>[{currentTime.toLocaleTimeString()}]</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
        
        {/* Main Configuration Panel */}
        <div style={{
          border: '2px solid #00ff00',
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.8)'
        }}>
          <h3 style={{ color: '#00ff00', marginBottom: '20px' }}>
            🎯 [SCAN_CONFIGURATION] 🎯
          </h3>

          <form onSubmit={handleSubmit}>
            
            {/* Scan Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                color: '#00ffff', 
                marginBottom: '8px',
                fontSize: '0.9em'
              }}>
                ┌─[OPERATION_NAME] *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#000000',
                  border: '1px solid #00ff00',
                  color: '#00ff00',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '1em'
                }}
                placeholder="e.g., OPERATION_DARKWEB_RECON"
                required
              />
            </div>

            {/* Target Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                color: '#00ffff', 
                marginBottom: '8px',
                fontSize: '0.9em'
              }}>
                ├─[TARGET_ACQUISITION] *
              </label>
              <textarea
                name="target"
                value={formData.target}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '10px',
                  background: '#000000',
                  border: '1px solid #00ff00',
                  color: '#00ff00',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '0.9em',
                  resize: 'vertical'
                }}
                placeholder={`https://target.com
192.168.1.100
subdomain.target.com
10.0.0.0/24`}
                required
              />
              
              {/* File Upload */}
              <div style={{ marginTop: '10px' }}>
                <label 
                  htmlFor="targetFile" 
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: 'linear-gradient(45deg, #003366, #004488)',
                    border: '1px solid #00ffff',
                    color: '#00ffff',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.boxShadow = '0 0 10px #00ffff'}
                  onMouseOut={(e) => e.target.style.boxShadow = 'none'}
                >
                  📁 [LOAD_TARGET_LIST]
                </label>
                <input
                  type="file"
                  id="targetFile"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                {targetFile && (
                  <span style={{ marginLeft: '15px', color: '#ffff00' }}>
                    [LOADED]: {targetFile.name}
                  </span>
                )}
              </div>
            </div>

            {/* Scan Type */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                color: '#00ffff', 
                marginBottom: '8px',
                fontSize: '0.9em'
              }}>
                ├─[ATTACK_VECTOR]
              </label>
              <select
                name="scan_type"
                value={formData.scan_type}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#000000',
                  border: '1px solid #00ff00',
                  color: '#00ff00',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '1em'
                }}
              >
                {scanTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    [{type.name}] - {type.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Options */}
            <div style={{ 
              border: '1px solid #ffff00',
              padding: '15px',
              marginBottom: '20px',
              background: 'rgba(255, 255, 0, 0.05)'
            }}>
              <h4 style={{ color: '#ffff00', marginBottom: '15px' }}>
                ⚙️ [ADVANCED_PARAMETERS] ⚙️
              </h4>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <label style={{ color: '#888', fontSize: '0.8em' }}>MAX_DEPTH</label>
                  <input
                    type="number"
                    name="options.max_depth"
                    value={formData.options.max_depth}
                    onChange={handleInputChange}
                    min="1" max="10"
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: '#000000',
                      border: '1px solid #888',
                      color: '#ffff00',
                      fontFamily: 'Courier New, monospace'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#888', fontSize: '0.8em' }}>THREAD_COUNT</label>
                  <input
                    type="number"
                    name="options.threads"
                    value={formData.options.threads}
                    onChange={handleInputChange}
                    min="1" max="100"
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: '#000000',
                      border: '1px solid #888',
                      color: '#ffff00',
                      fontFamily: 'Courier New, monospace'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#888', fontSize: '0.8em' }}>TIMEOUT (sec)</label>
                  <input
                    type="number"
                    name="options.timeout"
                    value={formData.options.timeout}
                    onChange={handleInputChange}
                    min="5" max="300"
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: '#000000',
                      border: '1px solid #888',
                      color: '#ffff00',
                      fontFamily: 'Courier New, monospace'
                    }}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {[
                  { key: 'include_subdomains', label: 'SUBDOMAIN_ENUM' },
                  { key: 'aggressive_mode', label: 'AGGRESSIVE_MODE' },
                  { key: 'stealth_mode', label: 'STEALTH_MODE' },
                  { key: 'custom_wordlist', label: 'CUSTOM_WORDLIST' }
                ].map(option => (
                  <label key={option.key} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    color: formData.options[option.key] ? '#00ff00' : '#888'
                  }}>
                    <input
                      type="checkbox"
                      name={`options.${option.key}`}
                      checked={formData.options[option.key]}
                      onChange={handleInputChange}
                      style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                    />
                    [{option.label}]
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '15px',
                background: isSubmitting 
                  ? 'linear-gradient(45deg, #666600, #888800)' 
                  : 'linear-gradient(45deg, #006600, #008800)',
                border: `2px solid ${isSubmitting ? '#ffff00' : '#00ff00'}`,
                color: isSubmitting ? '#ffff00' : '#00ff00',
                fontSize: '1.2em',
                fontWeight: 'bold',
                fontFamily: 'Courier New, monospace',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                textShadow: isSubmitting ? '0 0 10px #ffff00' : '0 0 10px #00ff00'
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.target.style.boxShadow = '0 0 20px #00ff00';
                  e.target.style.transform = 'scale(1.02)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'scale(1)';
              }}
            >
              {isSubmitting ? '⚡ [INITIATING_SCAN...] ⚡' : '🚀 [LAUNCH_ATTACK] 🚀'}
            </button>
          </form>

          {/* Result Message */}
          {submitResult && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              border: `2px solid ${submitResult.type === 'success' ? '#00ff00' : '#ff0000'}`,
              background: submitResult.type === 'success' 
                ? 'rgba(0, 255, 0, 0.1)' 
                : 'rgba(255, 0, 0, 0.1)',
              color: submitResult.type === 'success' ? '#00ff00' : '#ff0000'
            }}>
              {submitResult.message}
            </div>
          )}
        </div>

        {/* Terminal Output Panel */}
        <div style={{
          border: '2px solid #888',
          background: '#000000',
          height: 'fit-content'
        }}>
          <div style={{
            background: '#333',
            padding: '8px 15px',
            borderBottom: '1px solid #555',
            color: '#fff',
            fontSize: '0.9em'
          }}>
            🖥️ [TERMINAL_OUTPUT]
          </div>
          
          <div style={{
            padding: '15px',
            height: '400px',
            overflowY: 'auto',
            fontSize: '0.8em',
            lineHeight: '1.4'
          }}>
            {commandHistory.map((line, index) => (
              <div key={index} style={{ 
                marginBottom: '2px',
                color: line.includes('[ERROR]') || line.includes('FATAL') ? '#ff0000' :
                      line.includes('[INFO]') || line.includes('[RESULT]') ? '#00ffff' :
                      line.includes('[READY]') ? '#00ff00' : '#ffff00'
              }}>
                {line}
              </div>
            ))}
            <div style={{ color: '#00ff00' }}>
              root@kali-akuma:~# <span className="cursor">_</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Types Info */}
      <div style={{
        marginTop: '20px',
        border: '1px solid #333',
        padding: '15px',
        background: 'rgba(0, 0, 0, 0.5)'
      }}>
        <h3 style={{ color: '#00ffff', marginBottom: '15px' }}>
          📋 [ATTACK_VECTOR_REFERENCE] 📋
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '15px' }}>
          <div style={{
            padding: '15px',
            border: '1px solid #ffff00',
            background: 'rgba(255, 255, 0, 0.05)'
          }}>
            <div style={{ color: '#ffff00', fontWeight: 'bold', marginBottom: '10px' }}>
              [QUICK_SCAN] - Fast Reconnaissance
            </div>
            <div style={{ color: '#888', fontSize: '0.9em' }}>
              • nmap -sS -T4 -p-<br/>
              • httpx -silent -follow-redirects -title<br/>
              • whatweb --color=never<br/>
              • nuclei -severity critical,high,medium<br/>
              • CMS detection & specialized scans
            </div>
          </div>
          
          <div style={{
            padding: '15px',
            border: '1px solid #ff6600',
            background: 'rgba(255, 102, 0, 0.05)'
          }}>
            <div style={{ color: '#ff6600', fontWeight: 'bold', marginBottom: '10px' }}>
              [FULL_SPECTRUM] - Deep Penetration Testing
            </div>
            <div style={{ color: '#888', fontSize: '0.9em' }}>
              • nmap -sS -sV -sC -O --min-rate=5000 -p-<br/>
              • httpx -silent -follow-redirects -title -tech-detect<br/>
              • whatweb --log-verbose<br/>
              • nuclei -severity critical,high,medium,low<br/>
              • dirsearch + gobuster directory fuzzing<br/>
              • Bitrix/WordPress specialized scanners
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '20px',
        padding: '10px',
        border: '1px solid #333',
        background: 'rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
        fontSize: '0.8em',
        color: '#888'
      }}>
        [WARNING] Use responsibly. Unauthorized scanning is illegal. AKUMA Scanner v3.0
      </div>
    </div>
  );
};

export default CreateScan;
