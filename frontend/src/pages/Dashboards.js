import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import AttendanceAnalytics from '../components/AttendanceAnalytics';

const Dashboards = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loading">Initializing Dashboard...</div>;

  const stats = [
    { label: 'Total Staff', value: data?.stats?.totalEmployees || 0, icon: '👥', color: 'blue' },
    { label: 'Present Today', value: data?.stats?.presentToday || 0, icon: '✅', color: 'cyan' },
    { label: 'Office Presence', value: data?.stats?.officeToday || 0, icon: '🏢', color: 'purple' },
    { label: 'Remote / Home', value: data?.stats?.homeToday || 0, icon: '🏠', color: 'green' },
  ];

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="dashboard-content">
        <header className="page-header">
          <div className="header-text">
            <h1>Executive Overview</h1>
            <p>Welcome to the Creinx Command Center</p>
          </div>
          <div className="header-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </header>

        <section className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-panel stat-card">
              <div className={`stat-icon icon-${stat.color}`}>{stat.icon}</div>
              <div className="stat-info">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="analytics-section">
          <div className="glass-panel chart-container">
            <div className="container-header">
              <h2>Attendance Trends</h2>
              <div className="badge">LIVE</div>
            </div>
            <AttendanceAnalytics />
          </div>

          <div className="glass-panel activity-container">
            <div className="container-header">
              <h2>Pending Approvals</h2>
              <button className="view-all-btn">Manage All</button>
            </div>
            <div className="activity-list">
              {data?.pendingLeaves?.length > 0 ? (
                data.pendingLeaves.map((leave, idx) => (
                  <div key={idx} className="activity-item">
                    <div className="activity-avatar">{leave.employee_name?.[0] || 'E'}</div>
                    <div className="activity-details">
                      <p className="activity-title">{leave.employee_name}</p>
                      <p className="activity-sub">{leave.reason}</p>
                    </div>
                    <div className="activity-status status-pending">Pending</div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No pending approvals</div>
              )}
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .dashboard-page {
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
          margin-bottom: 4px;
          letter-spacing: -1px;
        }

        .header-text p {
          color: var(--text-muted);
        }

        .header-date {
          background: var(--bg-card);
          padding: 10px 20px;
          border-radius: 30px;
          font-size: 0.85rem;
          border: 1px solid var(--glass-border);
          color: var(--primary-glow);
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: var(--transition);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.05);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .icon-blue { background: rgba(59, 130, 246, 0.15); }
        .icon-cyan { background: rgba(6, 182, 212, 0.15); }
        .icon-purple { background: rgba(168, 85, 247, 0.15); }
        .icon-green { background: rgba(34, 197, 94, 0.15); }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          color: var(--text-muted);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 800;
          color: white;
        }

        .analytics-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .chart-container, .activity-container {
          padding: 24px;
        }

        .container-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .container-header h2 {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .badge {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 800;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid transparent;
          transition: var(--transition);
        }

        .activity-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--glass-border);
        }

        .activity-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--accent-blue), var(--primary-glow));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.8rem;
        }

        .activity-details {
          flex: 1;
        }

        .activity-title {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .activity-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .activity-status {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 12px;
        }

        .status-pending { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }

        .view-all-btn {
          background: transparent;
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .view-all-btn:hover {
          color: white;
          border-color: var(--primary-glow);
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default Dashboards;
