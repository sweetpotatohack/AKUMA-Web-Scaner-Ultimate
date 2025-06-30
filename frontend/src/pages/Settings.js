import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await api.getNotificationSettings();
        setSettings(result);
      } catch (err) {
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateNotificationSettings(settings);
      alert('Settings saved successfully');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: '#888', textAlign: 'center' }}>Loading settings...</div>;
  }

  if (error) {
    return <div style={{ color: '#ff0000', textAlign: 'center' }}>{error}</div>;
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>⚙️ Notification Settings</h2>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="email_notifications"
            checked={settings.email_notifications || false}
            onChange={handleChange}
            style={{ marginRight: '10px' }}
          />
          Email Notifications
        </label>
      </div>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="telegram_notifications"
            checked={settings.telegram_notifications || false}
            onChange={handleChange}
            style={{ marginRight: '10px' }}
          />
          Telegram Notifications
        </label>
      </div>
      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          name="email"
          value={settings.email || ''}
          onChange={handleChange}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Telegram Chat ID</label>
        <input
          type="text"
          name="telegram_chat_id"
          value={settings.telegram_chat_id || ''}
          onChange={handleChange}
          className="form-input"
        />
      </div>
      <button type="button" className="btn" onClick={handleSave} disabled={isSaving} style={{ width: '100%' }}>
        {isSaving ? 'Saving...' : 'Save Settings'}
      </button>
      {error && <p style={{ color: '#ff0000', textAlign: 'center', marginTop: '20px' }}>{error}</p>}
    </div>
  );
};

export default Settings;
