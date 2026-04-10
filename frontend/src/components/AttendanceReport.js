import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';

const AttendanceReport = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/report`, {
        params: dateRange,
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(response.data.report || []);
    } catch (err) {
      console.error('Failed to fetch report', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (type) => {
    const badges = {
      work_office: { label: 'OFFICE', class: 'badge-office' },
      work_home: { label: 'HOME', class: 'badge-home' },
      leave: { label: 'LEAVE', class: 'badge-leave' }
    };
    const badge = badges[type] || { label: type, class: 'badge-default' };
    return <span className={`report-badge ${badge.class}`}>{badge.label}</span>;
  };

  return (
    <div className="report-hub">
      <div className="hub-filters">
        <div className="filter-group">
          <label>Range Start</label>
          <input 
            type="date" 
            className="glass-input small" 
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
          />
        </div>
        <div className="filter-group">
          <label>Range End</label>
          <input 
            type="date" 
            className="glass-input small" 
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="premium-table">
          <thead>
            <tr>
              <th>LOG IDENTITY</th>
              <th>CHECK-IN TIMESTAMP</th>
              <th>WORK MODE</th>
              <th>VERIFIED IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="status-cell">Decrypting Logs...</td></tr>
            ) : report.length === 0 ? (
              <tr><td colSpan="4" className="status-cell">No activity records found for this period</td></tr>
            ) : (
              report.map((log, idx) => (
                <tr key={idx} className="table-row">
                  <td>
                    <div className="user-info">
                      <span className="name">{log.employee_name}</span>
                      <span className="email">{log.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="time-info">
                       <span className="date">{new Date(log.check_in).toLocaleDateString()}</span>
                       <span className="time">{new Date(log.check_in).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(log.attendance_type)}</td>
                  <td><code className="ip-addr">{log.ip_address || '0.0.0.0'}</code></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .report-hub { width: 100%; }
        .hub-filters { display: flex; gap: 20px; margin-bottom: 30px; }
        .filter-group { display: flex; flex-direction: column; gap: 8px; }
        .filter-group label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
        .glass-input.small { padding: 8px 12px; font-size: 0.8rem; }
        .premium-table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 15px; font-size: 0.7rem; color: var(--text-muted); border-bottom: 1px solid var(--glass-border); }
        .table-row { border-bottom: 1px solid var(--glass-border); transition: var(--transition); }
        .table-row:hover { background: rgba(255, 255, 255, 0.02); }
        .table-row td { padding: 15px; }
        .status-cell { text-align: center; padding: 40px; color: var(--text-muted); }
        .user-info { display: flex; flex-direction: column; }
        .name { font-weight: 600; font-size: 0.9rem; }
        .email { font-size: 0.75rem; color: var(--text-muted); }
        .time-info { display: flex; flex-direction: column; }
        .date { font-weight: 500; font-size: 0.85rem; }
        .time { font-size: 0.75rem; color: var(--primary-glow); }
        .report-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; letter-spacing: 1px; }
        .badge-office { background: rgba(0, 210, 255, 0.1); color: var(--primary-glow); }
        .badge-home { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
        .badge-leave { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .ip-addr { font-size: 0.75rem; background: rgba(255, 255, 255, 0.05); padding: 2px 6px; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default AttendanceReport;
