import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import AttendanceTypeSelector from './AttendanceTypeSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, MapPin, CheckCircle2, AlertTriangle, Loader2, LogOut, Clock } from 'lucide-react';

const AttendanceForm = ({ onSuccess }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attendanceType, setAttendanceType] = useState({ type: 'work_office', leaveId: null });
  const [hasApprovedLeave, setHasApprovedLeave] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);

  useEffect(() => {
    checkApprovedLeave();
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/employee/today-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodayRecord(res.data.attendance || null);
    } catch (err) {
      console.error('Could not fetch today status');
    }
  };

  const checkApprovedLeave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Get today's date in YYYY-MM-DD format
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const activeLeave = response.data.leaves?.find(leave => {
        if (leave.status !== 'approved') return false;

        // Parse dates properly
        const startDate = new Date(leave.start_date);
        const endDate = new Date(leave.end_date);

        // Check if today falls within the leave range
        return today >= startDate && today <= endDate;
      });

      if (activeLeave) {
        setHasApprovedLeave(true);
        setAttendanceType(prev => ({ ...prev, leaveId: activeLeave.id }));
      } else {
        setHasApprovedLeave(false);
      }
    } catch (err) {
      console.error('Error checking leave status:', err);
      setHasApprovedLeave(false);
    }
  };

  const handleAttendanceTypeSelect = (type) => {
    setAttendanceType(prev => ({ ...prev, type }));
  };

  const handleMarkAttendance = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (attendanceType.type === 'work_office') {
        if (!navigator.geolocation) {
          setError('Sector Error: Geolocation not supported.');
          setLoading(false);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await submitAttendance(latitude, longitude);
          },
          () => {
            setError('Signal Lost: Enable location access for sector verification.');
            setLoading(false);
          }
        );
      } else {
        await submitAttendance(null, null);
      }
    } catch (error) {
      setError('Logistics Failure: System error during transmission.');
      setLoading(false);
    }
  };

  const submitAttendance = async (latitude = null, longitude = null) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { type: attendanceType.type, latitude, longitude, leaveRequestId: attendanceType.leaveId };
      const response = await axios.post(`${API_URL}/employee/attendance`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(response.data.message);
      setLocation(latitude && longitude ? { latitude, longitude } : null);
      setAttendanceType({ type: 'work_office', leaveId: null });
      await fetchTodayStatus();
      if (onSuccess) onSuccess();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Sector Denied: Permission issue.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/employee/checkout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Departure logged: ' + formatTime(res.data.check_out));
      await fetchTodayStatus();
      if (onSuccess) onSuccess();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Checkout failed.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatTypeLabel = (type) => {
    if (type === 'work_office') return 'Office';
    if (type === 'work_home') return 'Remote';
    if (type === 'leave') return 'Leave';
    return type;
  };

  const alreadyCheckedIn = !!todayRecord;
  const alreadyCheckedOut = !!(todayRecord?.check_out);

  return (
    <div className="attendance-form-lite">

      {/* Today's Session Status */}
      <AnimatePresence>
        {todayRecord && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="session-status-card"
          >
            <div className="session-row">
              <div className="session-item">
                <Clock size={14} />
                <span className="s-label">CHECK-IN</span>
                <span className="s-time in">{formatTime(todayRecord.check_in)}</span>
              </div>
              <div className="session-divider"></div>
              <div className="session-item">
                <Clock size={14} />
                <span className="s-label">CHECK-OUT</span>
                <span className={`s-time ${alreadyCheckedOut ? 'out' : 'pending'}`}>
                  {alreadyCheckedOut ? formatTime(todayRecord.check_out) : 'ACTIVE'}
                </span>
              </div>
              <div className="session-divider"></div>
              <div className="session-item">
                <span className="s-label">MODE</span>
                <span className="s-badge">{formatTypeLabel(todayRecord.attendance_type)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attendance Type Selector — hide if already checked in */}
      {!alreadyCheckedIn && (
        <AttendanceTypeSelector onTypeSelect={handleAttendanceTypeSelect} hasApprovedLeave={hasApprovedLeave} />
      )}

      {/* Alerts */}
      <div className="status-container-haptic">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="error-alert-haptic">
              <AlertTriangle size={18} /><span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="success-alert-haptic">
              <CheckCircle2 size={18} /><span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary Action Buttons */}
      {!alreadyCheckedIn && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMarkAttendance}
          disabled={loading || (attendanceType.type === 'leave' && !hasApprovedLeave)}
          className="mark-action-btn-elite"
        >
          {loading ? (
            <div className="action-loading"><Loader2 className="spinner-icon" /><span>VERIFYING SIGNAL...</span></div>
          ) : (
            <><ShieldCheck size={20} /><span>INITIALIZE LOGGING</span></>
          )}
        </motion.button>
      )}

      {alreadyCheckedIn && !alreadyCheckedOut && todayRecord?.attendance_type !== 'leave' && (
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(239,68,68,0.8)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="checkout-btn-elite"
        >
          {checkoutLoading ? (
            <div className="action-loading"><Loader2 className="spinner-icon" /><span>LOGGING DEPARTURE...</span></div>
          ) : (
            <><LogOut size={20} /><span>INITIALIZE DEPARTURE</span></>
          )}
        </motion.button>
      )}

      {alreadyCheckedOut && (
        <div className="session-complete-badge">
          <CheckCircle2 size={18} />
          <span>SESSION COMPLETE — Have a great day!</span>
        </div>
      )}

      {alreadyCheckedIn && todayRecord?.attendance_type === 'leave' && (
        <div className="session-complete-badge" style={{ background: 'rgba(168,85,247,0.15)', borderColor: 'rgba(168,85,247,0.3)' }}>
          <CheckCircle2 size={18} style={{ color: '#a855f7' }} />
          <span style={{ color: '#a855f7' }}>LEAVE MARKED</span>
        </div>
      )}

      {/* Location Badge */}
      <AnimatePresence>
        {location && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="coord-badge-glass">
            <MapPin size={14} />
            Sector Locked: {location.latitude.toFixed(4)}N, {location.longitude.toFixed(4)}E
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .attendance-form-lite { display: flex; flex-direction: column; gap: 20px; }

        .session-status-card {
          background: rgba(0, 210, 255, 0.05);
          border: 1px solid rgba(0, 210, 255, 0.15);
          border-radius: 18px;
          padding: 20px 25px;
        }

        .session-row {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .session-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
        }

        .session-divider {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.08);
        }

        .s-label {
          font-size: 0.6rem;
          font-weight: 900;
          letter-spacing: 2px;
          color: var(--text-dim);
        }

        .s-time {
          font-size: 1.1rem;
          font-weight: 800;
        }

        .s-time.in { color: #22c55e; }
        .s-time.out { color: #ef4444; }
        .s-time.pending { color: #4deaff; animation: pulse 2s infinite; }

        .s-badge {
          font-size: 0.7rem;
          font-weight: 800;
          color: #4deaff;
          background: rgba(0,210,255,0.1);
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid rgba(0,210,255,0.2);
        }

        .status-container-haptic { min-height: 45px; }

        .error-alert-haptic, .success-alert-haptic {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 20px; border-radius: 12px;
          font-size: 0.8rem; font-weight: 700;
        }
        .error-alert-haptic { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .success-alert-haptic { background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }

        .mark-action-btn-elite {
          height: 60px; 
          background: linear-gradient(135deg, #0056ff, #00d2ff);
          border: none; border-radius: 16px;
          color: #fff; font-weight: 800; font-size: 0.95rem;
          letter-spacing: 2px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          box-shadow: 0 15px 30px rgba(0, 86, 255, 0.3); transition: all 0.3s ease;
        }
        .mark-action-btn-elite:disabled { 
          background: #1e293b; color: #64748b; cursor: not-allowed; box-shadow: none; 
        }

        .checkout-btn-elite {
          height: 60px; background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3); border-radius: 16px;
          color: #ef4444; font-weight: 800; font-size: 0.9rem;
          letter-spacing: 1.5px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          transition: all 0.3s ease;
        }
        .checkout-btn-elite:disabled { opacity: 0.5; cursor: not-allowed; }

        .session-complete-badge {
          height: 60px; background: rgba(34,197,94,0.05);
          border: 1px solid rgba(34,197,94,0.2); border-radius: 16px;
          color: #22c55e; font-weight: 800; font-size: 0.85rem; letter-spacing: 1px;
          display: flex; align-items: center; justify-content: center; gap: 12px;
        }

        .action-loading { display: flex; align-items: center; gap: 10px; }
        .spinner-icon { animation: spin 1s infinite linear; }

        .coord-badge-glass {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
          padding: 8px 15px; border-radius: 30px;
          font-size: 0.7rem; font-weight: 800; color: var(--text-muted);
          overflow: hidden;
        }

        @media (max-width: 500px) {
          .session-row { flex-direction: column; gap: 16px; }
          .session-divider { width: 40px; height: 1px; }
          .s-time { font-size: 1rem; }
          .mark-action-btn-elite, .checkout-btn-elite, .session-complete-badge { height: 50px; font-size: 0.8rem; }
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AttendanceForm;
