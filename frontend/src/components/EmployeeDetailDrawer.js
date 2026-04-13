import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Briefcase, Building, CalendarDays,
  Clock, Home, Plane, CheckCircle, XCircle, AlertCircle,
  ChevronLeft, ChevronRight, TrendingUp
} from 'lucide-react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const typeConfig = {
  work_office: { label: 'OFFICE',  color: '#4deaff', bg: 'rgba(0,210,255,0.08)'  },
  work_home:   { label: 'HOME',    color: '#a855f7', bg: 'rgba(168,85,247,0.08)' },
  leave:       { label: 'LEAVE',   color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
  absent:      { label: 'ABSENT',  color: '#ef4444', bg: 'rgba(239,68,68,0.08)'  },
};

const leaveStatusConfig = {
  pending:  { label: 'PENDING',  color: '#f59e0b', icon: AlertCircle },
  approved: { label: 'APPROVED', color: '#22c55e', icon: CheckCircle },
  declined: { label: 'DECLINED', color: '#ef4444', icon: XCircle },
};

// Compute working days (Mon–Fri) in a month up to today
const getWorkingDays = (year, month) => {
  const now = new Date();
  const todayStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');

  const days = [];
  const cursor = new Date(year, month - 1, 1);
  while (cursor.getMonth() === month - 1) {
    const dow = cursor.getDay();
    const dateStr = cursor.getFullYear() + '-' +
      String(cursor.getMonth() + 1).padStart(2, '0') + '-' +
      String(cursor.getDate()).padStart(2, '0');
    if (dow !== 0 && dow !== 6 && dateStr <= todayStr) days.push(dateStr);
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

const EmployeeDetailDrawer = ({ employee, onClose }) => {
  const [tab, setTab] = useState('attendance');
  const [loading, setLoading] = useState(true);
  const [allAttendance, setAllAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());

  // Fetch full report once when employee changes
  const fetchData = useCallback(async () => {
    if (!employee) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/employee/${employee.id}/full-report`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllAttendance(res.data.attendance || []);
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error('Employee detail error:', err);
    } finally {
      setLoading(false);
    }
  }, [employee]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset tab when employee changes
  useEffect(() => { setTab('attendance'); setMonth(now.getMonth() + 1); setYear(now.getFullYear()); }, [employee]); // eslint-disable-line

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Filter attendance to selected month/year
  const monthAttendance = allAttendance.filter(a => {
    const d = a.check_in.substring(0, 7); // YYYY-MM
    return d === `${year}-${String(month).padStart(2, '0')}`;
  });

  // Compute absent days for selected month
  const workingDays = getWorkingDays(year, month);
  const markedDays  = new Set(monthAttendance.map(a => a.check_in.substring(0, 10)));
  const absentDays  = workingDays.filter(d => !markedDays.has(d));

  // Build merged rows sorted newest first
  const rows = [
    ...monthAttendance.map(a => ({ type: 'record', dateStr: a.check_in.substring(0, 10), data: a })),
    ...absentDays.map(d => ({ type: 'absent', dateStr: d, data: null })),
  ].sort((a, b) => b.dateStr.localeCompare(a.dateStr));

  const stats = {
    working: workingDays.length,
    office:  monthAttendance.filter(a => a.attendance_type === 'work_office').length,
    home:    monthAttendance.filter(a => a.attendance_type === 'work_home').length,
    leave:   monthAttendance.filter(a => a.attendance_type === 'leave').length,
    absent:  absentDays.length,
  };

  return (
    <AnimatePresence>
      {employee && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="drawer-backdrop"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="emp-drawer"
          >
            {/* Header */}
            <div className="drawer-header">
              <div className="drawer-emp-info">
                <div className="drawer-avatar">{employee.name?.[0] || '?'}</div>
                <div>
                  <h2 className="drawer-emp-name">{employee.name}</h2>
                  <p className="drawer-emp-email">{employee.email}</p>
                </div>
              </div>
              <button className="drawer-close-btn" onClick={onClose}><X size={18} /></button>
            </div>

            {/* Employee Meta */}
            <div className="drawer-meta">
              {employee.job_role && (
                <span className="meta-chip"><Briefcase size={12} />{employee.job_role}</span>
              )}
              {employee.department && (
                <span className="meta-chip dept"><Building size={12} />{employee.department}</span>
              )}
              {employee.date_of_join && (
                <span className="meta-chip join">
                  <CalendarDays size={12} />
                  Joined {new Date(employee.date_of_join).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="drawer-tabs">
              <button className={`dtab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>
                <Clock size={14} />Attendance
              </button>
              <button className={`dtab ${tab === 'leaves' ? 'active' : ''}`} onClick={() => setTab('leaves')}>
                <Plane size={14} />Leave Requests
                {leaves.filter(l => l.status === 'pending').length > 0 && (
                  <span className="pending-dot">{leaves.filter(l => l.status === 'pending').length}</span>
                )}
              </button>
            </div>

            <div className="drawer-body">
              {tab === 'attendance' && (
                <>
                  {/* Month Navigator */}
                  <div className="drawer-month-nav">
                    <button className="drawer-nav-btn" onClick={prevMonth}><ChevronLeft size={16} /></button>
                    <span className="drawer-month-label">{MONTHS[month - 1]} {year}</span>
                    <button className="drawer-nav-btn" onClick={nextMonth}><ChevronRight size={16} /></button>
                  </div>

                  {/* Stats — 5 cards */}
                  <div className="drawer-stats">
                    {[
                      { key: 'working', label: 'Working', color: '#fff',    icon: TrendingUp },
                      { key: 'office',  label: 'Office',  color: '#4deaff', icon: Briefcase  },
                      { key: 'home',    label: 'Home',    color: '#a855f7', icon: Home       },
                      { key: 'leave',   label: 'Leave',   color: '#f97316', icon: Plane      },
                      { key: 'absent',  label: 'Absent',  color: '#ef4444', icon: AlertCircle},
                    ].map(({ key, label, color, icon: Icon }) => (
                      <div key={key} className="drawer-stat" style={{ borderColor: color + '22' }}>
                        <Icon size={13} color={color} />
                        <span className="ds-num" style={{ color }}>{stats[key]}</span>
                        <span className="ds-label">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Absent notice */}
                  {!loading && stats.absent > 0 && (
                    <div className="drawer-absent-notice">
                      <AlertCircle size={13} />
                      <span><strong>{stats.absent}</strong> day{stats.absent !== 1 ? 's' : ''} unmarked — counted as absent</span>
                    </div>
                  )}

                  {/* Table */}
                  {loading ? (
                    <div className="drawer-status">Loading...</div>
                  ) : rows.length === 0 ? (
                    <div className="drawer-status">No records for {MONTHS[month - 1]} {year}</div>
                  ) : (
                    <div className="drawer-table-wrap">
                      <table className="drawer-table">
                        <thead>
                          <tr>
                            <th>DATE</th>
                            <th>CHECK-IN</th>
                            <th>CHECK-OUT</th>
                            <th>TYPE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, idx) => {
                            if (row.type === 'absent') {
                              const d = new Date(row.dateStr + 'T00:00:00');
                              const cfg = typeConfig.absent;
                              return (
                                <tr key={`absent-${row.dateStr}`} className="drawer-row absent-row">
                                  <td>
                                    <span className="dr-date">{d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                    <span className="dr-weekday">{d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                                  </td>
                                  <td><span className="dr-time muted">—</span></td>
                                  <td><span className="dr-time muted">—</span></td>
                                  <td><span className="dr-badge" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span></td>
                                </tr>
                              );
                            }
                            const log = row.data;
                            const cfg = typeConfig[log.attendance_type] || { label: log.attendance_type, color: '#fff', bg: 'rgba(255,255,255,0.05)' };
                            const ci = new Date(log.check_in);
                            const co = log.check_out ? new Date(log.check_out) : null;
                            return (
                              <tr key={`rec-${log.id || idx}`} className="drawer-row">
                                <td>
                                  <span className="dr-date">{ci.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                  <span className="dr-weekday">{ci.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                                </td>
                                <td><span className="dr-time">{ci.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></td>
                                <td><span className="dr-time muted">{co ? co.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span></td>
                                <td><span className="dr-badge" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {tab === 'leaves' && (
                loading ? (
                  <div className="drawer-status">Loading...</div>
                ) : leaves.length === 0 ? (
                  <div className="drawer-status">No leave requests found</div>
                ) : (
                  <div className="leave-list">
                    {leaves.map((lv, idx) => {
                      const cfg = leaveStatusConfig[lv.status] || leaveStatusConfig.pending;
                      const Icon = cfg.icon;
                      return (
                        <motion.div
                          key={lv.id || idx}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="leave-card"
                          style={{ borderColor: cfg.color + '22' }}
                        >
                          <div className="leave-card-top">
                            <div className="leave-dates">
                              <span className="lv-from">{new Date(lv.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              <span className="lv-arrow">→</span>
                              <span className="lv-to">{new Date(lv.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <span className="lv-badge" style={{ color: cfg.color, background: cfg.color + '15' }}>
                              <Icon size={11} />{cfg.label}
                            </span>
                          </div>
                          <p className="lv-reason">{lv.reason}</p>
                          {lv.decline_reason && (
                            <p className="lv-decline-reason">⚠ {lv.decline_reason}</p>
                          )}
                          <span className="lv-submitted">
                            Submitted: {new Date(lv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </motion.div>
        </>
      )}

      <style>{`
        .drawer-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px); z-index: 200;
        }
        .emp-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(520px, 95vw);
          background: #0c0e1a;
          border-left: 1px solid rgba(255,255,255,0.08);
          z-index: 201; display: flex; flex-direction: column;
          overflow: hidden; box-shadow: -20px 0 60px rgba(0,0,0,0.5);
        }

        .drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 22px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
        }
        .drawer-emp-info { display: flex; align-items: center; gap: 14px; }
        .drawer-avatar {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, #0056ff, #4deaff);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 1.1rem;
        }
        .drawer-emp-name { font-size: 1rem; font-weight: 800; color: #fff; margin: 0 0 2px; }
        .drawer-emp-email { font-size: 0.72rem; color: rgba(255,255,255,0.4); margin: 0; }
        .drawer-close-btn {
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .drawer-close-btn:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }

        .drawer-meta {
          display: flex; flex-wrap: wrap; gap: 6px;
          padding: 12px 22px; border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;
        }
        .meta-chip {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.68rem; font-weight: 700; padding: 3px 9px; border-radius: 20px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
        }
        .meta-chip.dept { background: rgba(168,85,247,0.08); color: #a855f7; border-color: rgba(168,85,247,0.15); }
        .meta-chip.join { background: rgba(34,197,94,0.08); color: #22c55e; border-color: rgba(34,197,94,0.15); }

        .drawer-tabs {
          display: flex; gap: 4px; padding: 10px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;
        }
        .dtab {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 9px; border: 1px solid transparent;
          font-size: 0.78rem; font-weight: 700; color: rgba(255,255,255,0.4);
          cursor: pointer; background: transparent; transition: all 0.2s; position: relative;
        }
        .dtab:hover { color: #fff; background: rgba(255,255,255,0.04); }
        .dtab.active { color: #fff; background: rgba(0,210,255,0.08); border-color: rgba(0,210,255,0.2); }
        .pending-dot {
          min-width: 17px; height: 17px; border-radius: 9px;
          background: #f59e0b; color: #0c0e1a;
          font-size: 0.62rem; font-weight: 900;
          display: flex; align-items: center; justify-content: center; padding: 0 3px;
        }

        .drawer-body { flex: 1; overflow-y: auto; padding: 18px 22px 22px; }

        .drawer-month-nav { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .drawer-nav-btn {
          width: 28px; height: 28px; border-radius: 7px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .drawer-nav-btn:hover { background: rgba(0,210,255,0.1); color: #4deaff; border-color: rgba(0,210,255,0.2); }
        .drawer-month-label { font-size: 0.88rem; font-weight: 800; color: #fff; }

        .drawer-stats {
          display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 14px;
        }
        .drawer-stat {
          background: rgba(255,255,255,0.03); border: 1px solid;
          border-radius: 10px; padding: 10px 6px;
          display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center;
        }
        .ds-num { font-size: 1.25rem; font-weight: 900; line-height: 1; }
        .ds-label { font-size: 0.55rem; font-weight: 700; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; }

        .drawer-absent-notice {
          display: flex; align-items: center; gap: 7px;
          background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15);
          border-radius: 8px; padding: 8px 12px; margin-bottom: 12px;
          font-size: 0.74rem; color: rgba(239,68,68,0.85); font-weight: 500;
        }
        .drawer-absent-notice svg { flex-shrink: 0; }
        .drawer-absent-notice strong { font-weight: 800; }

        .drawer-table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07); }
        .drawer-table { width: 100%; border-collapse: collapse; }
        .drawer-table thead th {
          padding: 11px 13px; text-align: left;
          font-size: 0.58rem; font-weight: 900; letter-spacing: 1.5px;
          color: rgba(255,255,255,0.3); background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .drawer-row { border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.15s; }
        .drawer-row:hover { background: rgba(255,255,255,0.02); }
        .drawer-row:last-child { border-bottom: none; }
        .drawer-row td { padding: 10px 13px; }
        .absent-row { background: rgba(239,68,68,0.03); }
        .absent-row:hover { background: rgba(239,68,68,0.06) !important; }

        .dr-date { display: block; font-size: 0.8rem; font-weight: 700; color: #fff; }
        .dr-weekday { display: block; font-size: 0.62rem; font-weight: 600; color: rgba(255,255,255,0.3); }
        .dr-time { font-size: 0.78rem; font-weight: 600; color: rgba(255,255,255,0.7); }
        .dr-time.muted { color: rgba(255,255,255,0.25); }
        .dr-badge { font-size: 0.58rem; font-weight: 900; letter-spacing: 0.8px; padding: 3px 7px; border-radius: 4px; }

        .leave-list { display: flex; flex-direction: column; gap: 10px; }
        .leave-card { background: rgba(255,255,255,0.03); border: 1px solid; border-radius: 12px; padding: 14px; }
        .leave-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 7px; }
        .leave-dates { display: flex; align-items: center; gap: 7px; }
        .lv-from, .lv-to { font-size: 0.8rem; font-weight: 700; color: #fff; }
        .lv-arrow { color: rgba(255,255,255,0.3); font-size: 0.72rem; }
        .lv-badge {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.6rem; font-weight: 900; letter-spacing: 1px;
          padding: 3px 9px; border-radius: 20px;
        }
        .lv-reason { font-size: 0.78rem; color: rgba(255,255,255,0.55); margin: 0 0 7px; line-height: 1.5; }
        .lv-decline-reason { font-size: 0.72rem; color: #f97316; margin: 0 0 7px; font-style: italic; }
        .lv-submitted { font-size: 0.62rem; color: rgba(255,255,255,0.25); font-weight: 600; }

        .drawer-status { padding: 36px 16px; text-align: center; color: rgba(255,255,255,0.3); font-size: 0.85rem; }
      `}</style>
    </AnimatePresence>
  );
};

export default EmployeeDetailDrawer;
