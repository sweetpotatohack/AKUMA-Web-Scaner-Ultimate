import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';
import { API_BASE_URL } from '../config/api';

const Navigation = () => {
  const location = useLocation();
  const [stats, setStats] = useState({
    totalScans: 0,
    activeScans: 0,
    vulnerabilities: 0,
    criticalIssues: 0
  });

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Устанавливаем дефолтные значения если API недоступно
      setStats({
        totalScans: 0,
        activeScans: 0,
        vulnerabilities: 0,
        criticalIssues: 0
      });
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'dashboard', path: '/dashboard', icon: '📊' },
    { id: 'new-scan', label: 'new-scan', path: '/new-scan', icon: '🎯' },
    { id: 'vulnerabilities', label: 'vulns', path: '/vulnerabilities', icon: '🛡️' },
    { id: 'reports', label: 'reports', path: '/reports', icon: '📋' },
    { id: 'config', label: 'config', path: '/config', icon: '⚙️' }
  ];

  return (
    <>
      {/* System Stats Bar */}
      <div className="system-stats">
        <div className="stat-group">
          <span className="stat-label">SCANS:</span>
          <span className="stat-value">{stats.totalScans}</span>
        </div>
        <div className="stat-group">
          <span className="stat-label">ACTIVE:</span>
          <span className="stat-value active">{stats.activeScans}</span>
        </div>
        <div className="stat-group">
          <span className="stat-label">VULNS:</span>
          <span className="stat-value vulns">{stats.vulnerabilities}</span>
        </div>
        <div className="stat-group">
          <span className="stat-label">CRITICAL:</span>
          <span className="stat-value critical">{stats.criticalIssues}</span>
        </div>
        <div className="system-time">
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Terminal Navigation */}
      <nav className="terminal-nav">
        <div className="nav-prompt">
          <span className="prompt">root@kali-akuma:~#</span>
        </div>
        <div className="nav-tabs">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`nav-command ${location.pathname === tab.path ? 'active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="nav-cursor">
          <span className="cursor">█</span>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
