import React, { useState } from 'react';
import AttendanceForm from '../components/AttendanceForm';
import LeaveRequestForm from '../components/LeaveRequestForm';
import LeaveStatusWidget from '../components/LeaveStatusWidget';
import { motion } from 'framer-motion';
import { Clock, Calendar, MessageSquare } from 'lucide-react';

const EmployeeDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

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
        <div className="today-date-chip">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </motion.div>

      {/* ─── Main Grid ─── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="emp-grid"
      >
        {/* Left Column */}
        <div className="emp-left">
          {/* Attendance Card */}
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
        </div>

        {/* Right Column */}
        <aside className="emp-right">
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

          {/* Quick Info Card */}
          <motion.div variants={cardVariants} className="emp-info-card">
            <h4>Enterprise Support</h4>
            <p>Need a manual attendance correction or have policy questions? Connect with your HR team directly.</p>
            <button className="emp-support-btn">Contact HR</button>
          </motion.div>
        </aside>
      </motion.div>

      <style jsx>{`
        .emp-page { width: 100%; }

        .emp-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .emp-page-title {
          font-size: 2rem;
          font-weight: 900;
          color: #fff;
          margin-bottom: 6px;
          line-height: 1.2;
        }

        .emp-page-sub {
          color: rgba(255,255,255,0.4);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .today-date-chip {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 10px 20px;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          white-space: nowrap;
        }

        .emp-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          align-items: start;
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
          padding: 28px;
          transition: border-color 0.3s;
        }
        .emp-card:hover { border-color: rgba(255,255,255,0.12); }

        .emp-card-top {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 18px;
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
          .emp-page-title { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;
