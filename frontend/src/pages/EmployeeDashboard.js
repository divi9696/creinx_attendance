import React, { useState } from 'react';
import AttendanceForm from '../components/AttendanceForm';
import LeaveRequestForm from '../components/LeaveRequestForm';
import LeaveStatusWidget from '../components/LeaveStatusWidget';
import EmployeeMonthlyReport from '../components/EmployeeMonthlyReport';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, MessageSquare, BarChart2 } from 'lucide-react';

const EmployeeDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleAttendanceSuccess = () => setRefreshKey(prev => prev + 1);
  const handleLeaveSuccess = () => setRefreshKey(prev => prev + 1);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Greet by time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="emp-page">
      {/* ─── Page Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="emp-page-header"
      >
        <div>
          <h1 className="emp-page-title">{greeting}, {user?.name?.split(' ')[0] || 'User'} 👋</h1>
          <p className="emp-page-sub">Log your attendance and manage leave requests below.</p>
        </div>
      </motion.div>

      {/* ─── Tab Bar ─── */}
      <div className="emp-tabs">
        <button
          className={`emp-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Clock size={15} /> My Workspace
        </button>
        <button
          className={`emp-tab ${activeTab === 'leave' ? 'active' : ''}`}
          onClick={() => setActiveTab('leave')}
        >
          <Calendar size={15} /> Leave Request
        </button>
        <button
          className={`emp-tab ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          <BarChart2 size={15} /> Monthly Report
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'report' ? (
          <motion.div key="report" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="emp-card" style={{ padding: '28px' }}>
            <div className="emp-card-top">
              <div className="emp-card-icon"><BarChart2 size={18} /></div>
              <div>
                <h3>My Monthly Attendance</h3>
                <p>Browse and review your attendance records by month</p>
              </div>
            </div>
            <EmployeeMonthlyReport />
          </motion.div>
        ) : activeTab === 'leave' ? (
          <motion.div key="leave" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="emp-grid"
            >
              {/* Leave Request Card */}
              <motion.div variants={cardVariants} className="emp-card">
                <div className="emp-card-top">
                  <div className="emp-card-icon leave"><Calendar size={18} /></div>
                  <div>
                    <h3>Request Leave</h3>
                    <p>Submit a leave request for approval</p>
                  </div>
                </div>
                <LeaveRequestForm onSuccess={handleLeaveSuccess} />
              </motion.div>

              {/* My Leave Requests Card */}
              <motion.div variants={cardVariants} className="emp-card">
                <div className="emp-card-top">
                  <div className="emp-card-icon status"><MessageSquare size={18} /></div>
                  <div>
                    <h3>My Leave Requests</h3>
                    <p>Track all leave statuses</p>
                  </div>
                </div>
                <LeaveStatusWidget key={refreshKey} />
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="emp-grid-single"
      >
        {/* Attendance Card - Full Width */}
        <motion.div variants={cardVariants} className="emp-card">
          <div className="emp-card-top">
            <div className="emp-card-icon"><Clock size={18} /></div>
            <div>
              <h3>Daily Attendance</h3>
              <p>Mark your work session for today</p>
            </div>
          </div>
          <AttendanceForm onSuccess={handleAttendanceSuccess} />
        </motion.div>
      </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .emp-page { width: 100%; }

        .emp-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
          padding-right: 10px;
        }

        .emp-page-title {
          font-size: 2rem;
          font-weight: 900;
          color: #fff;
          margin: 0 0 6px 0;
          line-height: 1.2;
        }

        .emp-page-sub {
          color: rgba(255,255,255,0.4);
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0;
        }

        .today-date-chip {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 10px 22px;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 700;
          color: rgba(255,255,255,0.8);
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          flex-shrink: 0;
        }

        .emp-tabs {
          display: flex; gap: 8px; margin-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 12px;
        }
        .emp-tab {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 12px; border: 1px solid transparent;
          font-size: 0.82rem; font-weight: 700; cursor: pointer;
          color: rgba(255,255,255,0.4); background: transparent;
          transition: all 0.2s; font-family: 'Outfit', sans-serif;
        }
        .emp-tab:hover { color: #fff; background: rgba(255,255,255,0.04); }
        .emp-tab.active { color: #fff; background: rgba(0,210,255,0.08); border-color: rgba(0,210,255,0.2); }

        .emp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .emp-grid-single {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .emp-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .emp-left, .emp-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .emp-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 24px;
          transition: border-color 0.3s;
        }
        .emp-card:hover { border-color: rgba(255,255,255,0.12); }

        .emp-card-top {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .emp-card-icon {
          width: 42px; height: 42px; border-radius: 12px;
          background: rgba(0,210,255,0.08); color: #4deaff;
          border: 1px solid rgba(0,210,255,0.15);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .emp-card-icon.leave { background: rgba(168,85,247,0.08); color: #a855f7; border-color: rgba(168,85,247,0.15); }
        .emp-card-icon.status { background: rgba(34,197,94,0.08); color: #22c55e; border-color: rgba(34,197,94,0.15); }

        .emp-card-top h3 { font-size: 1rem; font-weight: 800; color: #fff; margin-bottom: 3px; }
        .emp-card-top p { font-size: 0.75rem; color: rgba(255,255,255,0.35); font-weight: 500; }

        .emp-info-card {
          background: linear-gradient(135deg, rgba(0,86,255,0.08), rgba(0,210,255,0.05));
          border: 1px solid rgba(0,210,255,0.12);
          border-radius: 20px;
          padding: 28px;
          text-align: center;
        }
        .emp-info-card h4 { font-size: 1rem; font-weight: 800; color: #fff; margin-bottom: 10px; }
        .emp-info-card p { font-size: 0.8rem; color: rgba(255,255,255,0.4); line-height: 1.6; margin-bottom: 20px; }

        .emp-support-btn {
          width: 100%; height: 46px;
          background: transparent;
          border: 1px solid rgba(0,210,255,0.3);
          color: #4deaff;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.82rem;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .emp-support-btn:hover { background: rgba(0,210,255,0.1); }

        @media (max-width: 1100px) {
          .emp-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .emp-page-header { flex-direction: column; align-items: stretch; gap: 12px; }
          .today-date-chip { align-self: flex-start; }
          .emp-page-title { font-size: 1.5rem; }
          .emp-tabs { overflow-x: auto; white-space: nowrap; padding-bottom: 8px; }
          .emp-card { padding: 20px; }
          .emp-card-top { gap: 12px; }
          .emp-card-icon { width: 36px; height: 36px; }
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;
