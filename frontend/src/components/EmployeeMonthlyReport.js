import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Briefcase, Home, Plane, TrendingUp,
  ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const typeConfig = {
  work_office: { label: 'OFFICE',  color: '#4deaff', bg: 'rgba(0,210,255,0.08)',  border: 'rgba(0,210,255,0.25)'  },
  work_home:   { label: 'HOME',    color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)' },
  leave:       { label: 'LEAVE',   color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' },
  absent:      { label: 'ABSENT',  color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)'  },
};


const EmployeeMonthlyReport = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/employee/monthly-report`, {
        params: { month, year },
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Monthly report error', err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const stats = data?.stats || { working: 0, office: 0, home: 0, leave: 0, absent: 0 };

  // Merge real attendance rows + absent-day synthetic rows, sort by date desc
  const buildRows = () => {
    const attendanceRows = (data?.attendance || []).map(a => ({
      type: 'record',
      dateStr: a.check_in.substring(0, 10),
      data: a,
    }));

    const absentRows = (data?.absentDays || []).map(d => ({
      type: 'absent',
      dateStr: d,
      data: null,
    }));

    return [...attendanceRows, ...absentRows]
      .sort((a, b) => b.dateStr.localeCompare(a.dateStr)); // newest first
  };

  const rows = buildRows();

  const statCards = [
    { key: 'working', label: 'Working Days', color: '#fff',    bg: 'rgba(255,255,255,0.05)', icon: TrendingUp  },
    { key: 'office',  label: 'Office',        color: '#4deaff', bg: 'rgba(0,210,255,0.08)',  icon: Briefcase   },
    { key: 'home',    label: 'Work from Home',color: '#a855f7', bg: 'rgba(168,85,247,0.08)', icon: Home        },
    { key: 'leave',   label: 'Leave Marked',  color: '#f97316', bg: 'rgba(249,115,22,0.08)', icon: Plane       },
    { key: 'absent',  label: 'Absent',        color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  icon: AlertCircle },
  ];

  return (
    <div className="mr-wrap">
      {/* ─── Month Navigator ─── */}
      <div className="mr-nav">
        <button className="mr-nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
        <div className="mr-month-label">
          <CalendarDays size={16} />
          <span>{MONTHS[month - 1]} {year}</span>
        </div>
        <button className="mr-nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="mr-stats">
        {statCards.map(({ key, label, color, bg, icon: Icon }) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mr-stat-card"
            style={{ background: bg, borderColor: color + '33' }}
          >
            <Icon size={16} color={color} />
            <span className="mr-stat-num" style={{ color }}>{stats[key] ?? 0}</span>
            <span className="mr-stat-label">{label}</span>
          </motion.div>
        ))}
      </div>

      {/* ─── Absent Notice ─── */}
      {!loading && stats.absent > 0 && (
        <div className="mr-absent-notice">
          <AlertCircle size={14} />
          <span>
            <strong>{stats.absent}</strong> working day{stats.absent !== 1 ? 's' : ''} with no attendance record
            — shown as <strong>ABSENT</strong> below.
          </span>
        </div>
      )}

      {/* ─── Attendance Table ─── */}
      <div className="mr-table-wrap">
        {loading ? (
          <div className="mr-status">Loading report...</div>
        ) : rows.length === 0 ? (
          <div className="mr-status">
            {(() => {
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              if (user.date_of_join) {
                const joinDate = new Date(user.date_of_join);
                const viewDate = new Date(year, month - 1, 1);
                const joinMonth = new Date(joinDate.getFullYear(), joinDate.getMonth(), 1);
                
                if (viewDate < joinMonth) {
                  return "No record is found (Prior to Joining Date)";
                }
              }
              return `No records found for ${MONTHS[month - 1]} ${year}`;
            })()}
          </div>
        ) : (
          <table className="mr-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>CHECK-IN</th>
                <th>CHECK-OUT</th>
                <th>TYPE</th>
                <th>HOURS</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {rows.map((row, idx) => {
                  if (row.type === 'absent') {
                    const d = new Date(row.dateStr + 'T00:00:00');
                    const cfg = typeConfig.absent;
                    return (
                      <motion.tr
                        key={`absent-${row.dateStr}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="mr-row absent-row"
                      >
                        <td>
                          <div className="mr-date-cell">
                            <span className="mr-day">{d.getDate()}</span>
                            <span className="mr-weekday">{d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                          </div>
                        </td>
                        <td><span className="mr-time muted">—</span></td>
                        <td><span className="mr-time muted">—</span></td>
                        <td>
                          <span className="mr-badge" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
                            {cfg.label}
                          </span>
                        </td>
                        <td><span className="mr-hours" style={{ color: 'rgba(239,68,68,0.5)' }}>0h</span></td>
                      </motion.tr>
                    );
                  }

                  // Normal attendance record
                  const log = row.data;
                  const cfg = typeConfig[log.attendance_type] || { label: log.attendance_type, color: '#fff', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
                  const checkIn  = new Date(log.check_in);
                  const checkOut = log.check_out ? new Date(log.check_out) : null;
                  const hours    = checkOut ? ((checkOut - checkIn) / 3600000).toFixed(1) : '—';

                  return (
                    <motion.tr
                      key={`rec-${log.id || idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="mr-row"
                    >
                      <td>
                        <div className="mr-date-cell">
                          <span className="mr-day">{checkIn.getDate()}</span>
                          <span className="mr-weekday">{checkIn.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                        </div>
                      </td>
                      <td><span className="mr-time">{checkIn.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></td>
                      <td><span className="mr-time out">{checkOut ? checkOut.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span></td>
                      <td>
                        <span className="mr-badge" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td>
                        <span className="mr-hours" style={{ color: checkOut ? '#22c55e' : 'rgba(255,255,255,0.3)' }}>
                          {hours}{checkOut ? 'h' : ''}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .mr-wrap { width: 100%; }

        .mr-nav {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 24px;
        }
        .mr-nav-btn {
          width: 34px; height: 34px; border-radius: 10px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .mr-nav-btn:hover { background: rgba(0,210,255,0.1); color: #4deaff; border-color: rgba(0,210,255,0.2); }
        .mr-month-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 1rem; font-weight: 800; color: #fff;
        }
        .mr-month-label svg { color: #4deaff; }

        .mr-stats {
          display: grid; grid-template-columns: repeat(5, 1fr);
          gap: 12px; margin-bottom: 20px;
        }
        .mr-stat-card {
          border-radius: 14px; border: 1px solid;
          padding: 16px 12px;
          display: flex; flex-direction: column; align-items: center; gap: 7px;
          text-align: center;
        }
        .mr-stat-num { font-size: 1.8rem; font-weight: 900; line-height: 1; }
        .mr-stat-label { font-size: 0.62rem; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; }

        .mr-absent-notice {
          display: flex; align-items: center; gap: 8px;
          background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15);
          border-radius: 10px; padding: 10px 14px; margin-bottom: 16px;
          font-size: 0.78rem; color: rgba(239,68,68,0.85); font-weight: 500;
        }
        .mr-absent-notice svg { flex-shrink: 0; color: #ef4444; }
        .mr-absent-notice strong { font-weight: 800; }

        .mr-table-wrap { overflow-x: auto; border-radius: 14px; border: 1px solid rgba(255,255,255,0.07); }
        .mr-table { width: 100%; border-collapse: collapse; }
        .mr-table thead th {
          padding: 13px 16px; text-align: left;
          font-size: 0.6rem; font-weight: 900; letter-spacing: 2px;
          color: rgba(255,255,255,0.3); background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .mr-row { border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.15s; }
        .mr-row:hover { background: rgba(255,255,255,0.02); }
        .mr-row:last-child { border-bottom: none; }
        .mr-row td { padding: 12px 16px; }
        .absent-row { background: rgba(239,68,68,0.03); }
        .absent-row:hover { background: rgba(239,68,68,0.06) !important; }

        .mr-date-cell { display: flex; align-items: center; gap: 8px; }
        .mr-day { font-size: 1.05rem; font-weight: 900; color: #fff; }
        .mr-weekday { font-size: 0.68rem; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; }

        .mr-time { font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.7); }
        .mr-time.out { color: rgba(255,255,255,0.4); }
        .mr-time.muted { color: rgba(255,255,255,0.2); }

        .mr-badge {
          font-size: 0.62rem; font-weight: 900; letter-spacing: 1px;
          padding: 3px 9px; border-radius: 5px; border: 1px solid;
        }

        .mr-hours { font-size: 0.82rem; font-weight: 700; }
        .mr-status { padding: 40px; text-align: center; color: rgba(255,255,255,0.3); font-size: 0.9rem; }

        @media (max-width: 900px)  { .mr-stats { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 600px)  { .mr-stats { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
};

export default EmployeeMonthlyReport;
