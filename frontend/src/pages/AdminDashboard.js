import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AttendanceReport from '../components/AttendanceReport';
import LeaveRequestWidget from '../components/LeaveRequestWidget';
import AttendanceAnalytics from '../components/AttendanceAnalytics';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    officeToday: 0,
    homeToday: 0,
    leaveToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data.stats);
      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = () => {
    // Refresh dashboard data after leave approval/decline
    fetchDashboardData();
    setRefreshKey(prev => prev + 1);
  };

  if (loading) return <div className="admin-dashboard"><div className="loading">Loading...</div></div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <p className="stat-number">{stats.totalEmployees}</p>
        </div>
        <div className="stat-card">
          <h3>Present Today</h3>
          <p className="stat-number">{stats.presentToday}</p>
        </div>
        <div className="stat-card office-stat">
          <h3>🏢 Office</h3>
          <p className="stat-number">{stats.officeToday}</p>
        </div>
        <div className="stat-card home-stat">
          <h3>🏠 Home</h3>
          <p className="stat-number">{stats.homeToday}</p>
        </div>
        <div className="stat-card leave-stat">
          <h3>📅 Leave</h3>
          <p className="stat-number">{stats.leaveToday}</p>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="leave-section">
          <LeaveRequestWidget key={refreshKey} onApprovalAction={handleApprovalAction} />
        </section>

        <section className="analytics-section">
          <AttendanceAnalytics key={refreshKey} />
        </section>

        <section className="report-section">
          <AttendanceReport />
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
