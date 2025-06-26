import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scans from './pages/Scans';
import CreateScan from './pages/CreateScan';
import Settings from './pages/Settings';
import { api } from './services/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    // Check backend connection
    const checkConnection = async () => {
      try {
        await api.health();
        setIsBackendConnected(true);
      } catch (error) {
        setIsBackendConnected(false);
        console.error('Backend connection failed:', error);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    if (!isBackendConnected) {
      return (
        <div className="card">
          <h2 style={{ color: '#ff6600' }}>⚠️ Backend Connection Lost</h2>
          <p>Unable to connect to the backend server. Please ensure the backend is running on port 8000.</p>
          <p>Status: <span style={{ color: '#ff0000' }}>Disconnected</span></p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'scans':
        return <Scans />;
      case 'create':
        return <CreateScan />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
