import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles/App.css";

// Pages
import Dashboard from "./pages/Dashboard";
import CreateScan from "./pages/CreateScan";
import ScanResult from "./pages/ScanResult";
import Scans from "./pages/Scans";
import Vulnerabilities from "./pages/Vulnerabilities";
import Reports from "./pages/Reports";
import Config from "./pages/Config";
import Settings from "./pages/Settings";

// Components
import Navigation from "./components/Navigation";

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
                <div className="logo-subtitle">Kali Terminal v3.0</div>
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
            <Route path="/scan/:scanId" element={<ScanResult />} />
            <Route path="/new-scan" element={<CreateScan />} />
            <Route path="/create-scan" element={<CreateScan />} />
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
  );
}

export default App;
