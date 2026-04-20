import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Clock, Calendar, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Loader2, AlertTriangle,
  Building, Home, FileText, Check, X, ShieldAlert,
  Briefcase, Shield
} from 'lucide-react';

const AdminStaffPanel = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance');
  const [liveToday, setLiveToday] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [reviewMsg, setReviewMsg] = useState('');
  const [latePermEmpId, setLatePermEmpId] = useState('');
  const [latePermReason, setLatePermReason] = useState('');
  const [latePermMsg, setLatePermMsg] = useState({ text: '', type: 'success' });
  const [latePermLoading, setLatePermLoading] = useState(false);

  // Grant Administrative Leave State
  const [grantLeaveEmpId, setGrantLeaveEmpId] = useState('');
  const [grantLeaveStart, setGrantLeaveStart] = useState('');
  const [grantLeaveEnd, setGrantLeaveEnd] = useState('');
  const [grantLeaveReason, setGrantLeaveReason] = useState('');
  const [grantLeaveLoading, setGrantLeaveLoading] = useState(false);
  const [grantLeaveMsg, setGrantLeaveMsg] = useState({ text: '', type: 'success' });

  useEffect(() => {
    fetchEmployees();
    fetchLiveToday();
    fetchPendingLeaves();
  }, []);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/employees`, { headers: headers() });
      setEmployees(res.data.employees || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchLiveToday = async () => {
    try {
      const now = new Date();
      const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
      const endDate = today + ' 23:59:59';
      const res = await axios.get(`${API_URL}/admin/report?startDate=${today}&endDate=${endDate}`, { headers: headers() });
      setLiveToday(res.data.attendance || []);
    } catch (e) { console.error(e); }
  };

  const fetchPendingLeaves = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/dashboard`, { headers: headers() });
      setPendingLeaves(res.data.pendingLeaves || []);
    } catch (e) { console.error(e); }
  };



  const reviewLeave = async (leaveId, status) => {
    try {
      await axios.post(`${API_URL}/admin/leave/${leaveId}/review`, { status }, { headers: headers() });
      setReviewMsg(`Leave ${status} successfully`);
      fetchPendingLeaves();

      setTimeout(() => setReviewMsg(''), 3000);
    } catch (e) { setReviewMsg('Review action failed'); }
  };

  const grantLatePermission = async () => {
    if (!latePermEmpId) {
      setLatePermMsg({ text: 'Please select an employee.', type: 'error' });
      return;
    }
    setLatePermLoading(true);
    try {
      const res = await axios.post(`${API_URL}/admin/late-permission`,
        { employee_id: parseInt(latePermEmpId), reason: latePermReason || 'Admin override' },
        { headers: headers() }
      );
      setLatePermMsg({ text: res.data.message, type: 'success' });
      setLatePermEmpId('');
      setLatePermReason('');
    } catch (e) {
      setLatePermMsg({ text: e.response?.data?.error || 'Failed to grant permission', type: 'error' });
    } finally {
      setLatePermLoading(false);
      setTimeout(() => setLatePermMsg({ text: '', type: '' }), 4000);
    }
  };

  const fmt = (dt) => {
    if (!dt) return <span style={{ color: '#475569' }}>—</span>;
    return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const fmtDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const typeIcon = (type) => {
    if (type === 'work_office') return <Building size={13} color="#4deaff" />;
    if (type === 'work_home') return <Home size={13} color="#a855f7" />;
    return <FileText size={13} color="#fbbf24" />;
  };

  const typeLabel = (type) => {
    if (type === 'work_office') return 'Office';
    if (type === 'work_home') return 'Remote';
    return 'Leave';
  };

  const typeColor = (type) => {
    if (type === 'work_office') return '#4deaff';
    if (type === 'work_home') return '#a855f7';
    return '#fbbf24';
  };



  return (
    <div className="staff-panel">

      {/* === LIVE TODAY SECTION === */}
      <div className="panel-section">
        <div className="section-title-row">
          <div className="section-icon-box"><Clock size={18} /></div>
          <h3>Live Today — Present Staff</h3>
          <span className="live-count">{liveToday.length} LOGGED</span>
        </div>

        {liveToday.length === 0 ? (
          <div className="empty-state">No attendance records for today yet.</div>
        ) : (
          <div className="live-grid">
            {liveToday.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="live-card"
              >
                <div className="live-avatar" style={{ borderColor: typeColor(rec.attendance_type) }}>
                  {(rec.employee_name || rec.name || 'E')[0]}
                </div>
                <div className="live-info">
                  <span className="live-name">{rec.employee_name || rec.name || `EMP #${rec.employee_id}`}</span>
                  <div className="live-times">
                    <span className="time-chip in">IN {fmt(rec.check_in)}</span>
                    {rec.check_out
                      ? <span className="time-chip out">OUT {fmt(rec.check_out)}</span>
                      : <span className="time-chip active">ACTIVE</span>
                    }
                  </div>
                </div>
                <div className="live-type-badge" style={{ color: typeColor(rec.attendance_type) }}>
                  {typeIcon(rec.attendance_type)} {typeLabel(rec.attendance_type)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* === PENDING LEAVE REQUESTS === */}
      <div className="panel-section">
        <div className="section-title-row">
          <div className="section-icon-box"><Calendar size={18} /></div>
          <h3>Pending Leave Requests</h3>
          <span className="pending-count">{pendingLeaves.length} PENDING</span>
        </div>

        <AnimatePresence>
          {reviewMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="review-toast">
              <CheckCircle size={14} /> {reviewMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {pendingLeaves.length === 0 ? (
          <div className="empty-state">No pending requests — sector clear.</div>
        ) : (
          <div className="leave-list">
            {pendingLeaves.map((leave, i) => (
              <motion.div
                key={leave.id}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className="leave-row"
              >
                <div className="leave-avatar">{(leave.employee_name || 'E')[0]}</div>
                <div className="leave-info">
                  <span className="leave-name">{leave.employee_name}</span>
                  <span className="leave-dates">{fmtDate(leave.start_date)} → {fmtDate(leave.end_date)}</span>
                  <span className="leave-reason">"{leave.reason}"</span>
                </div>
                <div className="leave-actions">
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => reviewLeave(leave.id, 'approved')}
                    className="approve-btn"
                  >
                    <Check size={14} /> APPROVE
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => reviewLeave(leave.id, 'declined')}
                    className="decline-btn"
                  >
                    <X size={14} /> DECLINE
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* === GRANT LATE PERMISSION SECTION === */}
      <div className="panel-section">
        <div className="section-title-row">
          <div className="section-icon-box" style={{ background: 'rgba(251,191,36,0.08)', color: '#fbbf24' }}><ShieldAlert size={18} /></div>
          <h3>Grant Late Check-In Permission</h3>
        </div>
        <p className="late-perm-desc">If an employee arrives late, grant them a one-time attendance override for today. They must use it immediately.</p>

        <AnimatePresence>
          {latePermMsg.text && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={`late-perm-toast ${latePermMsg.type}`}>
              {latePermMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              {latePermMsg.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="late-perm-form">
          <select
            className="late-perm-select"
            value={latePermEmpId}
            onChange={e => setLatePermEmpId(e.target.value)}
          >
            <option value="">— Select Employee —</option>
            {employees.filter(e => e.role === 'employee').map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_uid})</option>
            ))}
          </select>
          <input
            className="late-perm-input"
            placeholder="Reason (optional)"
            value={latePermReason}
            onChange={e => setLatePermReason(e.target.value)}
          />
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={grantLatePermission}
            disabled={latePermLoading}
            className="late-perm-btn"
          >
            {latePermLoading ? <Loader2 size={16} className="spinner-icon" /> : <ShieldAlert size={16} />}
            Grant Late Access
          </motion.button>
        </div>
      </div>

      {/* === GRANT ADMINISTRATIVE LEAVE SECTION === */}
      <div className="panel-section">
        <div className="section-title-row">
          <div className="section-icon-box" style={{ background: 'rgba(168,85,247,0.08)', color: '#a855f7' }}><Briefcase size={18} /></div>
          <h3>Grant Administrative Leave</h3>
        </div>
        <p className="late-perm-desc">Forcefully assign leave to a specific employee or the entire staff for a chosen period.</p>

        <AnimatePresence>
          {grantLeaveMsg.text && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={`late-perm-toast ${grantLeaveMsg.type}`}>
              {grantLeaveMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              {grantLeaveMsg.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="late-perm-form">
          <select
            className="late-perm-select"
            value={grantLeaveEmpId}
            onChange={e => setGrantLeaveEmpId(e.target.value)}
          >
            <option value="">— Select Recipient —</option>
            <option value="all" style={{ color: '#4deaff', fontWeight: 'bold' }}>ALL EMPLOYEES (Bulk Grant)</option>
            {employees.filter(e => e.role === 'employee').map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_uid})</option>
            ))}
          </select>
          <input
            type="date"
            className="late-perm-input"
            value={grantLeaveStart}
            onChange={e => setGrantLeaveStart(e.target.value)}
            title="Start Date"
          />
          <input
            type="date"
            className="late-perm-input"
            value={grantLeaveEnd}
            onChange={e => setGrantLeaveEnd(e.target.value)}
            title="End Date"
          />
          <input
            className="late-perm-input"
            placeholder="Reason for Administrative Grant"
            value={grantLeaveReason}
            onChange={e => setGrantLeaveReason(e.target.value)}
            style={{ flex: '2', minWidth: '250px' }}
          />
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={submitGrantLeave}
            disabled={grantLeaveLoading}
            className="late-perm-btn"
            style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', borderColor: 'rgba(168,85,247,0.3)' }}
          >
            {grantLeaveLoading ? <Loader2 size={16} className="spinner-icon" /> : <Shield size={16} />}
            Grant Leave
          </motion.button>
        </div>
      </div>



      <style jsx>{`
        .staff-panel { display: flex; flex-direction: column; gap: 30px; }

        .panel-section {
          background: rgba(13, 15, 22, 0.7);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          padding: 30px;
        }

        .section-title-row {
          display: flex; align-items: center; gap: 15px;
          margin-bottom: 25px; padding-bottom: 15px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .section-icon-box {
          width: 40px; height: 40px; 
          background: rgba(0,210,255,0.08); border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: #4deaff;
        }

        .section-title-row h3 { flex: 1; font-size: 1rem; font-weight: 800; color: #fff; }

        .live-count, .pending-count {
          font-size: 0.6rem; font-weight: 900; letter-spacing: 2px;
          padding: 5px 14px; border-radius: 20px;
        }
        .live-count { background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
        .pending-count { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }

        .live-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; }

        .live-card {
          display: flex; align-items: center; gap: 15px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px; padding: 16px;
          transition: 0.3s;
        }
        .live-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(0,210,255,0.2); }

        .live-avatar {
          width: 44px; height: 44px; border-radius: 14px;
          background: rgba(255,255,255,0.03);
          border: 2px solid; display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 1.1rem; color: #fff;
          flex-shrink: 0;
        }

        .live-info { flex: 1; }
        .live-name { display: block; font-weight: 700; font-size: 0.9rem; color: #fff; margin-bottom: 6px; }
        .live-times { display: flex; gap: 8px; flex-wrap: wrap; }

        .time-chip {
          font-size: 0.65rem; font-weight: 800; padding: 3px 10px; border-radius: 20px;
          display: flex; align-items: center; gap: 4px;
        }
        .time-chip.in { background: rgba(34,197,94,0.1); color: #22c55e; }
        .time-chip.out { background: rgba(239,68,68,0.1); color: #ef4444; }
        .time-chip.active { background: rgba(0,210,255,0.1); color: #4deaff; animation: pulse 2s infinite; }

        .live-type-badge {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.65rem; font-weight: 800;
        }

        /* Leave requests */
        .leave-list { display: flex; flex-direction: column; gap: 15px; }
        .leave-row {
          display: flex; align-items: center; gap: 15px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px; padding: 18px;
        }
        .leave-avatar {
          width: 44px; height: 44px; background: linear-gradient(135deg, #0056ff, #00d2ff);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 1rem; flex-shrink: 0;
        }
        .leave-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .leave-name { font-weight: 800; font-size: 0.95rem; color: #fff; }
        .leave-dates { font-size: 0.75rem; color: #4deaff; font-weight: 700; }
        .leave-reason { font-size: 0.75rem; color: var(--text-muted); font-style: italic; }
        .leave-actions { display: flex; gap: 10px; }

        .approve-btn, .decline-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          font-size: 0.7rem; font-weight: 900; letter-spacing: 1px;
          cursor: pointer; border: 1px solid transparent; transition: 0.3s;
        }
        .approve-btn { background: rgba(34,197,94,0.1); color: #22c55e; border-color: rgba(34,197,94,0.2); }
        .approve-btn:hover { background: #22c55e; color: #000; }
        .decline-btn { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }
        .decline-btn:hover { background: #ef4444; color: #fff; }

        .review-toast {
          display: flex; align-items: center; gap: 8px;
          background: rgba(34,197,94,0.1); color: #22c55e;
          padding: 10px 18px; border-radius: 10px; font-size: 0.8rem;
          font-weight: 700; margin-bottom: 15px;
        }

        /* Dossier */
        .emp-dossier-list { display: flex; flex-direction: column; gap: 12px; }
        .emp-dossier-block { border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }

        .emp-dossier-header {
          display: flex; align-items: center; gap: 15px;
          padding: 18px 20px; cursor: pointer;
          background: rgba(255,255,255,0.02); transition: 0.3s;
        }
        .emp-dossier-header:hover { background: rgba(255,255,255,0.04); }
        .emp-dossier-header.active { background: rgba(0,210,255,0.05); border-bottom: 1px solid rgba(0,210,255,0.1); }

        .emp-dossier-avatar {
          width: 42px; height: 42px; border-radius: 12px;
          border: 1px solid rgba(0,210,255,0.3); background: rgba(0,210,255,0.05);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; color: #4deaff;
        }
        .d-name { display: block; font-weight: 700; color: #fff; font-size: 0.95rem; }
        .d-role { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; }
        .emp-dossier-meta { flex: 1; }
        .d-action-icon { color: var(--text-muted); }

        .dossier-expand { background: rgba(0,0,0,0.3); overflow: hidden; }
        .dossier-loading { display: flex; align-items: center; gap: 10px; padding: 30px; color: var(--text-muted); font-size: 0.85rem; }

        .dossier-content { padding: 20px; }

        .dossier-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
        .d-tab {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02); color: var(--text-muted);
          font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; cursor: pointer;
          transition: 0.3s;
        }
        .d-tab:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .d-tab.active { background: rgba(0,210,255,0.1); color: #4deaff; border-color: rgba(0,210,255,0.2); }

        /* Log Table */
        .log-table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
        .log-table { width: 100%; border-collapse: collapse; }
        .log-table th { padding: 12px 16px; text-align: left; font-size: 0.6rem; color: var(--text-muted); letter-spacing: 2px; font-weight: 900; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .log-row { border-bottom: 1px solid rgba(255,255,255,0.03); transition: 0.2s; }
        .log-row:hover { background: rgba(255,255,255,0.02); }
        .log-row td { padding: 12px 16px; font-size: 0.82rem; color: #cbd5e1; }
        .t-in { color: #22c55e; font-weight: 700; }
        .t-out { color: #ef4444; font-weight: 700; }
        .t-hrs { color: #4deaff; font-weight: 800; }
        .t-na { color: #475569; }
        .t-type { display: flex; align-items: center; gap: 5px; font-weight: 700; }

        .view-more-container {
          display: flex;
          justify-content: center;
          margin-top: 15px;
          padding-bottom: 10px;
        }
        .view-more-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 210, 255, 0.08);
          color: #4deaff;
          border: 1px solid rgba(0, 210, 255, 0.2);
          padding: 8px 24px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          transition: 0.3s;
        }
        .view-more-btn:hover {
          background: rgba(0, 210, 255, 0.15);
        }

        /* Monthly */
        .monthly-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px; }
        .month-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 14px; padding: 18px;
        }
        .month-label { font-weight: 800; color: #fff; margin-bottom: 14px; font-size: 0.9rem; }
        .month-stats { display: flex; flex-direction: column; gap: 8px; }
        .m-stat { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; }
        .m-stat.office { color: #4deaff; }
        .m-stat.home { color: #a855f7; }
        .m-stat.leave { color: #fbbf24; }
        .m-stat.total { color: #fff; font-size: 0.85rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; margin-top: 4px; }

        /* Leave history */
        .leave-history { display: flex; flex-direction: column; gap: 10px; }
        .lv-row { display: flex; gap: 15px; align-items: flex-start; padding: 14px; background: rgba(255,255,255,0.02); border-radius: 12px; }
        .lv-status { font-size: 0.6rem; font-weight: 900; letter-spacing: 1px; padding: 4px 12px; border-radius: 20px; white-space: nowrap; }
        .status-approved { background: rgba(34,197,94,0.1); color: #22c55e; }
        .status-pending { background: rgba(251,191,36,0.1); color: #fbbf24; }
        .status-declined { background: rgba(239,68,68,0.1); color: #ef4444; }
        .lv-info { display: flex; flex-direction: column; gap: 4px; }
        .lv-info span { font-size: 0.8rem; color: #cbd5e1; font-weight: 600; }
        .lv-reason { font-style: italic; color: var(--text-muted) !important; }
        .lv-decline { color: #ef4444 !important; font-size: 0.72rem !important; }

        .empty-state { padding: 30px; text-align: center; color: var(--text-muted); font-size: 0.85rem; font-style: italic; }

        /* Late Permission */
        .late-perm-desc { font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-bottom: 18px; line-height: 1.6; margin-top: -10px; }
        .late-perm-toast {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 18px; border-radius: 10px;
          font-size: 0.8rem; font-weight: 700; margin-bottom: 16px;
        }
        .late-perm-toast.success { background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
        .late-perm-toast.error { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .late-perm-form { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
        .late-perm-select, .late-perm-input {
          flex: 1; min-width: 180px; height: 44px;
          background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 0 14px;
          color: #fff; font-size: 0.85rem; font-family: 'Outfit', sans-serif;
          outline: none; transition: border-color 0.2s;
        }
        .late-perm-select:focus, .late-perm-input:focus { border-color: #fbbf24; }
        .late-perm-select option { background: #0a0c14; }
        .late-perm-input::placeholder { color: rgba(255,255,255,0.25); }
        .late-perm-btn {
          display: flex; align-items: center; gap: 8px;
          background: rgba(251,191,36,0.12); color: #fbbf24;
          border: 1px solid rgba(251,191,36,0.25); border-radius: 12px;
          padding: 0 22px; height: 44px;
          font-size: 0.8rem; font-weight: 800; letter-spacing: 0.5px;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .late-perm-btn:hover { background: rgba(251,191,36,0.2); box-shadow: 0 6px 16px rgba(251,191,36,0.15); }
        .late-perm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner-icon { animation: spin 1s infinite linear; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AdminStaffPanel;
