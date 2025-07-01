import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

const Scans = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scans`);
      const data = await response.json();
      setScans(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) return <div>Loading scans...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="scans-page">
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-title">SCAN HISTORY</div>
        </div>
        <div className="terminal-body">
          {scans.length === 0 ? (
            <div>No scans found.</div>
          ) : (
            <div>
              {scans.map((scan) => (
                <div key={scan.id} className="scan-entry">
                  <div>{scan.target} - {scan.status} - {formatDate(scan.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scans;
