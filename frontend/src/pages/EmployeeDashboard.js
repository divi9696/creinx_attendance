import React, { useState } from 'react';
import AttendanceForm from '../components/AttendanceForm';
import LeaveRequestForm from '../components/LeaveRequestForm';
import LeaveStatusWidget from '../components/LeaveStatusWidget';

const EmployeeDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAttendanceSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLeaveSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="employee-portal animate-fade-in">
      <header className="page-header">
        <div className="header-text">
          <h1>My Workspace</h1>
          <p>Creinx Attendance & Leave Management</p>
        </div>
        <div className="status-badge">🟢 ONLINE</div>
      </header>

      <div className="portal-grid">
        <div className="portal-main">
          <div className="glass-panel attendance-container">
            <div className="section-header">
              <span className="icon">⏱️</span>
              <h2>Daily Check-in</h2>
            </div>
            <AttendanceForm onSuccess={handleAttendanceSuccess} />
          </div>

          <div className="glass-panel leave-container">
            <div className="section-header">
              <span className="icon">📅</span>
              <h2>Request Time Off</h2>
            </div>
            <LeaveRequestForm onSuccess={handleLeaveSuccess} />
          </div>
        </div>

        <aside className="portal-sidebar">
          <div className="glass-panel status-container">
            <div className="section-header">
              <span className="icon">📝</span>
              <h2>My Requests</h2>
            </div>
            <LeaveStatusWidget key={refreshKey} />
          </div>
          
          <div className="glass-panel help-card">
            <h3>Need Support?</h3>
            <p>Contact HR for policy inquiries or manual attendance adjustments.</p>
            <button className="help-btn">Contact HR</button>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .employee-portal {
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

        .status-badge {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 800;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .portal-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
        }

        .portal-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .attendance-container, .leave-container, .status-container {
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

        .portal-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .help-card {
          padding: 24px;
          text-align: center;
          background: linear-gradient(135deg, var(--bg-card), rgba(0, 210, 255, 0.05));
        }

        .help-card h3 {
          margin-bottom: 10px;
          font-size: 1rem;
        }

        .help-card p {
          color: var(--text-muted);
          font-size: 0.8rem;
          margin-bottom: 20px;
        }

        .help-btn {
          width: 100%;
          background: transparent;
          border: 1px solid var(--primary-glow);
          color: var(--primary-glow);
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          transition: var(--transition);
          font-weight: 600;
        }

        .help-btn:hover {
          background: var(--primary-glow);
          color: var(--bg-dark);
        }

        @media (max-width: 1000px) {
          .portal-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;
