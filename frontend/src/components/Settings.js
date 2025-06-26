import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    webhookUrl: '',
    scanDefaults: {
      maxDepth: 3,
      threads: 10,
      timeout: 30,
      rateLimit: 60
    },
    reportFormat: 'html',
    autoSchedule: false,
    scheduleTime: '02:00'
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('akuma_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('akuma_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  return (
    <div className="settings">
      <div className="grid grid-2">
        {/* Notification Settings */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">🔔</div>
              Notifications
            </div>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({
                  ...settings,
                  emailNotifications: e.target.checked
                })}
              />
              Email Notifications
            </label>
          </div>
          
          <div className="form-group">
            <label className="form-label">Webhook URL</label>
            <input
              type="url"
              className="form-input"
              value={settings.webhookUrl}
              onChange={(e) => setSettings({
                ...settings,
                webhookUrl: e.target.value
              })}
              placeholder="https://hooks.slack.com/..."
            />
          </div>
        </div>

        {/* Scan Defaults */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">🎯</div>
              Scan Defaults
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Max Depth</label>
            <input
              type="number"
              className="form-input"
              value={settings.scanDefaults.maxDepth}
              onChange={(e) => setSettings({
                ...settings,
                scanDefaults: {
                  ...settings.scanDefaults,
                  maxDepth: parseInt(e.target.value)
                }
              })}
              min="1"
              max="10"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Threads</label>
            <input
              type="number"
              className="form-input"
              value={settings.scanDefaults.threads}
              onChange={(e) => setSettings({
                ...settings,
                scanDefaults: {
                  ...settings.scanDefaults,
                  threads: parseInt(e.target.value)
                }
              })}
              min="1"
              max="50"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Rate Limit (req/min)</label>
            <input
              type="number"
              className="form-input"
              value={settings.scanDefaults.rateLimit}
              onChange={(e) => setSettings({
                ...settings,
                scanDefaults: {
                  ...settings.scanDefaults,
                  rateLimit: parseInt(e.target.value)
                }
              })}
              min="1"
              max="300"
            />
          </div>
        </div>

        {/* Report Settings */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">📊</div>
              Reports
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Default Format</label>
            <select
              className="form-select"
              value={settings.reportFormat}
              onChange={(e) => setSettings({
                ...settings,
                reportFormat: e.target.value
              })}
            >
              <option value="html">HTML</option>
              <option value="pdf">PDF</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>

        {/* Schedule Settings */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">⏰</div>
              Scheduling
            </div>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.autoSchedule}
                onChange={(e) => setSettings({
                  ...settings,
                  autoSchedule: e.target.checked
                })}
              />
              Auto Schedule Daily Scans
            </label>
          </div>
          
          <div className="form-group">
            <label className="form-label">Schedule Time</label>
            <input
              type="time"
              className="form-input"
              value={settings.scheduleTime}
              onChange={(e) => setSettings({
                ...settings,
                scheduleTime: e.target.value
              })}
              disabled={!settings.autoSchedule}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="form-actions">
        <button 
          className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
          onClick={handleSave}
        >
          {saved ? '✅ Settings Saved!' : '💾 Save Settings'}
        </button>
      </div>

      <style jsx>{`
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: var(--text-primary);
        }

        .form-actions {
          text-align: center;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
};

export default Settings;
