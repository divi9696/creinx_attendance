import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { Download, Search, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AttendanceReport = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const exportToPDF = () => {
    if (report.length === 0) { alert('No data to export'); return; }
    const doc = new jsPDF();
    doc.text('Creinx Attendance Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 14, 22);
    
    const tableColumn = ["Employee", "Email", "Date", "Time", "Mode", "IP Address"];
    const tableRows = report.map(log => [
      log.employee_name,
      log.email,
      new Date(log.check_in).toLocaleDateString(),
      new Date(log.check_in).toLocaleTimeString(),
      log.attendance_type.replace('work_', '').toUpperCase(),
      log.ip_address || '0.0.0.0'
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [0, 86, 255] }
    });
    doc.save(`creinx-attendance-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    if (report.length === 0) { alert('No data to export'); return; }
    const headers = ['Employee Name', 'Email', 'Check-in Date', 'Check-in Time', 'Work Mode', 'IP Address'];
    const rows = report.map(log => [
      log.employee_name,
      log.email,
      new Date(log.check_in).toLocaleDateString(),
      new Date(log.check_in).toLocaleTimeString(),
      log.attendance_type,
      log.ip_address || '0.0.0.0'
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `creinx-report-${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReport = report.filter(log =>
    log.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="report-hub">
      <div className="hub-controls">
        <div className="hub-filters">
          <div className="filter-group">
            <label>Range Start</label>
            <input
              type="date"
              className="date-input"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
          </div>
          <div className="filter-group">
            <label>Range End</label>
            <input
              type="date"
              className="date-input"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
        </div>

        <div className="hub-actions">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="export-btn pdf" onClick={exportToPDF}>
            <FileText size={16} />
            <span>Export PDF</span>
          </button>
          <button className="export-btn excel" onClick={exportToExcel}>
            <FileSpreadsheet size={16} />
            <span>Export Excel</span>
          </button>
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
            ) : filteredReport.length === 0 ? (
              <tr><td colSpan="4" className="status-cell">No activity records found for this period</td></tr>
            ) : (
              filteredReport.map((log, idx) => (
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

        .hub-controls { display: flex; flex-direction: column; gap: 24px; margin-bottom: 30px; }

        .hub-filters { display: flex; gap: 20px; align-items: flex-end; flex-wrap: wrap; }
        .filter-group { display: flex; flex-direction: column; gap: 8px; }
        .filter-group label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }

        .date-input {
          padding: 12px 16px;
          font-size: 0.85rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          color: #fff;
          transition: all 0.3s ease;
          font-family: inherit;
          cursor: pointer;
        }

        .date-input:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .date-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(77, 234, 255, 0.5);
          box-shadow: 0 0 15px rgba(77, 234, 255, 0.1);
        }

        .hub-actions { display: flex; gap: 16px; align-items: center; }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          transition: all 0.3s ease;
          min-width: 250px;
        }

        .search-box:focus-within {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 0 15px rgba(77, 234, 255, 0.1);
        }

        .search-input {
          background: none;
          border: none;
          color: #fff;
          font-size: 0.85rem;
          outline: none;
          width: 100%;
          font-family: inherit;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          background: linear-gradient(135deg, rgba(77, 234, 255, 0.15), rgba(77, 234, 255, 0.05));
          border: 1.5px solid rgba(77, 234, 255, 0.3);
          border-radius: 10px;
          color: #4deaff;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .export-btn:hover {
          transform: translateY(-2px);
        }

        .export-btn.pdf {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }
        .export-btn.pdf:hover {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(239, 68, 68, 0.1));
          border-color: #ef4444;
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.15);
        }

        .export-btn.excel {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
          border-color: rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }
        .export-btn.excel:hover {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(34, 197, 94, 0.1));
          border-color: #22c55e;
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.15);
        }

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

        .table-responsive { overflow-x: auto; }

        @media (max-width: 768px) {
          .hub-controls { gap: 16px; }
          .hub-filters { flex-direction: column; gap: 12px; }
          .hub-actions { flex-direction: column; width: 100%; }
          .search-box { min-width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default AttendanceReport;
