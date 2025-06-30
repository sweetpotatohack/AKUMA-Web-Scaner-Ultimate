import React from 'react';

const Layout = ({ children, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'scans', label: 'Scans' },
    { id: 'create', label: 'Create Scan' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="container">
      <div className="cyber-bg"></div>
      <div className="cyber-grid"></div>
      
      <header className="header">
        <h1>AKUMA Web Scanner v2.0</h1>
        <p>Advanced Cybersecurity Vulnerability Assessment</p>
      </header>

      <nav className="nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;
