import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';

const AttendanceAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [view, setView] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [view, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/analytics`, {
        params: {
          view,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data.analytics || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const getTypeLabel = (type) => {
    const labels = {
      work_office: '🏢 Office',
      work_home: '🏠 Home',
      leave: '📅 Leave'
    };
    return labels[type] || type;
  };

  const groupedData = {};
  analytics.forEach(item => {
    const key = view === 'daily'
      ? item.date
      : view === 'weekly'
      ? `Week ${item.week}, ${item.year}`
      : `${item.month}/${item.year}`;

    if (!groupedData[key]) groupedData[key] = {};
    groupedData[key][item.attendance_type] = item.count;
  });

  return (
    <div className="attendance-analytics">
      <h3>Attendance Analytics</h3>

      <div className="analytics-controls">
        <div className="view-toggle">
          <button
            className={view === 'daily' ? 'active' : ''}
            onClick={() => setView('daily')}
          >
            Daily
          </button>
          <button
            className={view === 'weekly' ? 'active' : ''}
            onClick={() => setView('weekly')}
          >
            Weekly
          </button>
          <button
            className={view === 'monthly' ? 'active' : ''}
            onClick={() => setView('monthly')}
          >
            Monthly
          </button>
        </div>

        <div className="date-range">
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
          />
          <span>to</span>
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading analytics...</p>
      ) : Object.keys(groupedData).length === 0 ? (
        <p className="no-data">No attendance data for selected period</p>
      ) : (
        <div className="analytics-table">
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>🏢 Office</th>
                <th>🏠 Home</th>
                <th>📅 Leave</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedData).map(([period, data]) => {
                const office = data.work_office || 0;
                const home = data.work_home || 0;
                const leave = data.leave || 0;
                const total = office + home + leave;

                return (
                  <tr key={period}>
                    <td><strong>{period}</strong></td>
                    <td>{office}</td>
                    <td>{home}</td>
                    <td>{leave}</td>
                    <td><strong>{total}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary stats */}
      {Object.keys(groupedData).length > 0 && (
        <div className="analytics-summary">
          <div className="summary-stat">
            <span>🏢 Total Office:</span>
            <strong>
              {analytics.reduce((sum, item) =>
                item.attendance_type === 'work_office' ? sum + item.count : sum, 0
              )}
            </strong>
          </div>
          <div className="summary-stat">
            <span>🏠 Total Home:</span>
            <strong>
              {analytics.reduce((sum, item) =>
                item.attendance_type === 'work_home' ? sum + item.count : sum, 0
              )}
            </strong>
          </div>
          <div className="summary-stat">
            <span>📅 Total Leave:</span>
            <strong>
              {analytics.reduce((sum, item) =>
                item.attendance_type === 'leave' ? sum + item.count : sum, 0
              )}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceAnalytics;
