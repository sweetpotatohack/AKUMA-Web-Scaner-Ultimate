import React, { useState, useEffect } from "react";

const Scans = () => {
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [scanDetails, setScanDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScans();
    const interval = setInterval(fetchScans, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchScans = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/scans");
      const data = await response.json();
      console.log("Scans page data:", data);
      setScans(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Scans error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleScanClick = async (scan) => {
    setSelectedScan(scan);
    try {
      const [details, logs, ports, vulns] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/scans/${scan.id}`).then(r => r.json()),
        fetch(`http://127.0.0.1:8000/api/scans/${scan.id}/logs`).then(r => r.json()),
        fetch(`http://127.0.0.1:8000/api/scans/${scan.id}/ports`).then(r => r.json()),
        fetch(`http://127.0.0.1:8000/api/scans/${scan.id}/vulnerabilities`).then(r => r.json())
      ]);

      setScanDetails({
        ...details,
        logs,
        ports,
        vulnerabilities: vulns
      });
    } catch (error) {
      console.error("Failed to load scan details:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "running": return "#ffff00";
      case "completed": return "#00ff00";
      case "failed": return "#ff0000";
      default: return "#888";
    }
  };

  if (loading) {
    return <div className="loading">Loading scans...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <h3 style={{ color: "#ff0000" }}>❌ Error Loading Scans</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: "30px", textAlign: "center" }}>📊 Scan Management</h2>

      <div style={{ display: "grid", gridTemplateColumns: selectedScan ? "1fr 1fr" : "1fr", gap: "20px" }}>
        {/* Scans List */}
        <div className="card">
          <h3 style={{ marginBottom: "20px" }}>All Scans ({scans.length})</h3>
          
          {scans.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
              <p>No scans found.</p>
              <p>Create your first scan to get started!</p>
            </div>
          ) : (
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {scans.map(scan => (
                <div
                  key={scan.id}
                  onClick={() => handleScanClick(scan)}
                  style={{
                    padding: "15px",
                    marginBottom: "10px",
                    background: selectedScan?.id === scan.id ? "rgba(0, 255, 0, 0.1)" : "rgba(0, 0, 0, 0.3)",
                    borderRadius: "5px",
                    cursor: "pointer",
                    border: selectedScan?.id === scan.id ? "2px solid #00ff00" : "1px solid #333",
                    transition: "all 0.3s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{scan.target}</div>
                      <div style={{ fontSize: "0.9em", color: "#00cccc", marginBottom: "5px" }}>
                        🎯 Type: {scan.scan_type}
                      </div>
                      <div style={{ fontSize: "0.8em", color: "#888" }}>
                        {new Date(scan.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                        <span style={{ color: getStatusColor(scan.status), fontWeight: "bold" }}>
                          {scan.status.toUpperCase()}
                        </span>
                      </div>
                      {scan.status === "running" && (
                        <div style={{ fontSize: "0.8em", color: "#ffff00" }}>
                          {scan.phase} ({scan.progress}%)
                        </div>
                      )}
                      {scan.ports && scan.ports.length > 0 && (
                        <div style={{ fontSize: "0.8em", color: "#00cccc" }}>
                          🔌 {scan.ports.length} ports
                        </div>
                      )}
                      {scan.vulnerabilities && scan.vulnerabilities.length > 0 && (
                        <div style={{ fontSize: "0.8em", color: "#ff6600" }}>
                          ⚠️ {scan.vulnerabilities.length} vulns
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scan Details */}
        {selectedScan && (
          <div className="card">
            <h3 style={{ marginBottom: "20px" }}>🔍 Scan Details</h3>
            
            {scanDetails ? (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ color: "#00ff00" }}>{scanDetails.target}</h4>
                  <p style={{ color: "#00cccc", margin: "5px 0" }}>
                    <strong>Type:</strong> {scanDetails.scan_type}
                  </p>
                  <p style={{ color: "#00cccc", margin: "5px 0" }}>
                    <strong>Status:</strong> 
                    <span style={{ color: getStatusColor(scanDetails.status), marginLeft: "10px" }}>
                      {scanDetails.status.toUpperCase()}
                    </span>
                  </p>
                  <p style={{ color: "#00cccc", margin: "5px 0" }}>
                    <strong>Created:</strong> {new Date(scanDetails.created_at).toLocaleString()}
                  </p>
                  {scanDetails.status === "running" && (
                    <p style={{ color: "#00cccc", margin: "5px 0" }}>
                      <strong>Phase:</strong> {scanDetails.phase} ({scanDetails.progress}%)
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                {scanDetails.status === "running" && (
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ marginBottom: "10px" }}>📈 Progress</h4>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${scanDetails.progress}%` }}
                      ></div>
                    </div>
                    <p style={{ textAlign: "center", margin: "10px 0" }}>
                      {scanDetails.progress}% - {scanDetails.phase}
                    </p>
                  </div>
                )}

                {/* Ports */}
                {scanDetails.ports && scanDetails.ports.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ marginBottom: "15px" }}>🔌 Open Ports ({scanDetails.ports.length})</h4>
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {scanDetails.ports.map((port, index) => (
                        <div key={index} style={{ 
                          padding: "8px", 
                          margin: "5px 0", 
                          background: "rgba(0, 255, 255, 0.1)", 
                          borderRadius: "3px",
                          fontSize: "0.9em"
                        }}>
                          Port {port.port}/{port.protocol} - {port.service || "Unknown"}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vulnerabilities */}
                {scanDetails.vulnerabilities && (
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ marginBottom: "15px" }}>🚨 Vulnerabilities ({scanDetails.vulnerabilities.length})</h4>
                    {scanDetails.vulnerabilities.length === 0 ? (
                      <p style={{ color: "#00ff00", textAlign: "center", padding: "20px" }}>
                        ✅ No vulnerabilities detected!
                      </p>
                    ) : (
                      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {scanDetails.vulnerabilities.map((vuln, index) => (
                          <div key={index} style={{
                            padding: "10px",
                            margin: "5px 0",
                            background: "rgba(255, 100, 100, 0.1)",
                            borderRadius: "3px",
                            fontSize: "0.9em"
                          }}>
                            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                              {vuln.title}
                            </div>
                            <div style={{ fontSize: "0.8em", color: "#ccc" }}>
                              <strong>Severity:</strong> {vuln.severity} | <strong>URL:</strong> {vuln.url}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Logs */}
                {scanDetails.logs && scanDetails.logs.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ marginBottom: "15px" }}>📝 Scan Logs</h4>
                    <div style={{ 
                      maxHeight: "200px", 
                      overflowY: "auto", 
                      background: "rgba(0, 0, 0, 0.5)", 
                      padding: "10px", 
                      borderRadius: "5px",
                      fontFamily: "monospace",
                      fontSize: "0.8em"
                    }}>
                      {scanDetails.logs.slice(-50).map((log, index) => (
                        <div key={index} style={{ margin: "2px 0" }}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p>Loading scan details...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scans;
