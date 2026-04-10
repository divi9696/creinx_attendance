import React, { useState, useEffect } from 'react';
import AttendanceReport from '../components/AttendanceReport';
import AttendanceAnalytics from '../components/AttendanceAnalytics';

const Reports = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="reports-page animate-fade-in">
      <header className="page-header">
        <div className="header-text">
          <h1>Intelligence Hub</h1>
          <p>Deep dive into your organization's attendance metrics</p>
        </div>
        <div className="header-actions">
           <button onClick={() => window.print()} className="btn-secondary">Export PDF</button>
           <button onClick={() => setRefreshKey(k => k + 1)} className="btn-primary">Sync Data</button>
        </div>
      </header>

      <div className="reports-grid">
        <div className="glass-panel analytics-container">
          <div className="section-header">
            <span className="icon">📈</span>
            <h2>Statistical Distribution</h2>
          </div>
          <AttendanceAnalytics key={refreshKey} />
        </div>

        <div className="glass-panel detailed-report-container">
          <div className="section-header">
            <span className="icon">📄</span>
            <h2>Filtered Logs</h2>
          </div>
          <AttendanceReport />
        </div>
      </div>

      <style jsx>{`
        .reports-page {
          padding: 40px 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }

        .header-text h1 {
          font-size: 2.5rem;
          letter-spacing: -1px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .reports-grid {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .analytics-container, .detailed-report-container {
          padding: 30px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 15px;
        }

        .section-header .icon {
          font-size: 1.5rem;
        }

        .section-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
        }

        @media print {
          .navbar-glass, .header-actions { display: none; }
          .reports-page { padding: 0; }
          .glass-panel { border: none; box-shadow: none; background: white; color: black; }
          body { background: white; color: black; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
