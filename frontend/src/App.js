<<<<<<< HEAD
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles/App.css";

// Components
import Dashboard from "./components/Dashboard";
import NewScan from "./components/NewScan";
import ScanDetails from "./components/ScanDetails";
import Navigation from "./components/Navigation";

// Pages
import Scans from "./pages/Scans";
import Vulnerabilities from "./pages/Vulnerabilities";
import Reports from "./pages/Reports";
import Config from "./pages/Config";
import Settings from "./components/Settings";

function App() {
  return (
    <Router>
      <div className="App">
        {/* Terminal Header */}
        <header className="app-header">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">💀</div>
              <div>
                <h1>AKUMA-SCANNER</h1>
                <div className="logo-subtitle">Kali Terminal v2.0</div>
              </div>
            </div>
            <div className="terminal-info">
              root@kali-akuma:~$
            </div>
          </div>
        </header>

        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <main className="main-content fade-in">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scans" element={<Scans />} />
            <Route path="/scan/:id" element={<ScanDetails />} />
            <Route path="/new-scan" element={<NewScan />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/vulns" element={<Vulnerabilities />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/report" element={<Reports />} />
            <Route path="/config" element={<Config />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
=======
import React, { useState, useEffect } from 'react';
import './styles/App.css';

// Components
import Dashboard from './components/Dashboard';
import NewScan from './components/NewScan';
import ScanDetails from './components/ScanDetails';
import Vulnerabilities from './components/Vulnerabilities';
import Reports from './components/Reports';
import Settings from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalScans: 0,
    activeScans: 0,
    vulnerabilities: 0,
    criticalIssues: 0
  });
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);

  // Fetch stats and scans on component mount
  useEffect(() => {
    fetchStats();
    fetchScans();
    
    // Set up periodic updates
    const interval = setInterval(() => {
      fetchStats();
      fetchScans();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchScans = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/scans');
      if (response.ok) {
        const data = await response.json();
        setScans(data);
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    }
  };

  const handleScanCreated = (newScan) => {
    setScans(prev => [newScan, ...prev]);
    setActiveTab('dashboard');
  };

  const handleScanSelect = (scan) => {
    setSelectedScan(scan);
    setActiveTab('scan-details');
  };

  const handleScanDelete = async (scanId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/scans/${scanId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setScans(prev => prev.filter(scan => scan.id !== scanId));
        if (selectedScan && selectedScan.id === scanId) {
          setSelectedScan(null);
          setActiveTab('dashboard');
        }
      }
    } catch (error) {
      console.error('Error deleting scan:', error);
    }
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'new-scan', label: '🎯 New Scan', icon: '🎯' },
    { id: 'vulnerabilities', label: '🛡️ Vulnerabilities', icon: '🛡️' },
    { id: 'reports', label: '📋 Reports', icon: '📋' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
  ];

  if (activeTab === 'scan-details' && selectedScan) {
    tabs.push({ 
      id: 'scan-details', 
      label: `🔍 ${selectedScan.target}`, 
      icon: '🔍' 
    });
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats} 
            scans={scans} 
            onScanSelect={handleScanSelect}
            onScanDelete={handleScanDelete}
          />
        );
      case 'new-scan':
        return <NewScan onScanCreated={handleScanCreated} />;
      case 'scan-details':
        return (
          <ScanDetails 
            scan={selectedScan} 
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'vulnerabilities':
        return <Vulnerabilities />;
      case 'reports':
        return <Reports scans={scans} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard stats={stats} scans={scans} onScanSelect={handleScanSelect} />;
    }
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🔥</div>
            <h1>AKUMA Scanner</h1>
          </div>
          
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.totalScans}</div>
              <div className="stat-label">Total Scans</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.activeScans}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.vulnerabilities}</div>
              <div className="stat-label">Vulnerabilities</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.criticalIssues}</div>
              <div className="stat-label">Critical</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="main-content fade-in">
        {renderContent()}
      </main>
    </div>
>>>>>>> 7679d51fe1c7f06685c0b2d81391ae0a6c9638b8
  );
}

export default App;
