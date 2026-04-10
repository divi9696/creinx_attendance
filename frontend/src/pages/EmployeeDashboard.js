import React, { useState } from 'react';
import AttendanceForm from '../components/AttendanceForm';
import LeaveRequestForm from '../components/LeaveRequestForm';
import LeaveStatusWidget from '../components/LeaveStatusWidget';
import { motion } from 'framer-motion';
import { Clock, Calendar, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';

const EmployeeDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAttendanceSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLeaveSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="portal-universe">
      {/* Background Ambience */}
      <div className="portal-ambience">
        <div className="ambience-blob a1"></div>
        <div className="ambience-blob a2"></div>
      </div>

      <div className="employee-portal">
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="portal-glass-header"
        >
          <div className="header-identity">
            <h1 className="brand-fonts">My Workspace</h1>
            <p className="portal-subtitle">Creinx Intelligence Platform</p>
          </div>
          <div className="system-status">
            <ShieldCheck size={16} />
            <span>SECURE SECTOR 7</span>
            <div className="status-pulse"></div>
          </div>
        </motion.header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="portal-grid"
        >
          <div className="portal-main">
            <motion.div variants={cardVariants} className="layer-card attendance-card-grand">
              <div className="card-top">
                <div className="card-icon-box"><Clock size={20} /></div>
                <h3>Daily Attendance</h3>
              </div>
              <AttendanceForm onSuccess={handleAttendanceSuccess} />
            </motion.div>

            <motion.div variants={cardVariants} className="layer-card leave-card-grand">
              <div className="card-top">
                <div className="card-icon-box"><Calendar size={20} /></div>
                <h3>Leave Management</h3>
              </div>
              <LeaveRequestForm onSuccess={handleLeaveSuccess} />
            </motion.div>
          </div>

          <aside className="portal-sidebar-modern">
            <motion.div variants={cardVariants} className="layer-card status-widget-box">
              <div className="card-top">
                <div className="card-icon-box"><MessageSquare size={18} /></div>
                <h3>Recent Activity</h3>
              </div>
              <LeaveStatusWidget key={refreshKey} />
            </motion.div>
            
            <motion.div variants={cardVariants} className="support-card-elite">
              <div className="support-content">
                <HelpCircle className="support-icon" />
                <h4>Enterprise Support</h4>
                <p>Need assistance with policies or attendance corrections?</p>
                <button className="support-action-btn">Connect with HR</button>
              </div>
            </motion.div>
          </aside>
        </motion.div>
      </div>

      <style jsx>{`
        .portal-universe {
          min-height: 100vh;
          background: #06070a;
          position: relative;
          overflow-x: hidden;
        }

        .portal-ambience {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .ambience-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.05;
        }

        .a1 { width: 600px; height: 600px; background: #00d2ff; top: -10%; right: -10%; }
        .a2 { width: 500px; height: 500px; background: #0056ff; bottom: -10%; left: -10%; }

        .employee-portal {
          position: relative;
          z-index: 10;
          padding: 40px 30px;
          max-width: 1440px;
          margin: 0 auto;
        }

        .portal-glass-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(13, 15, 22, 0.4);
          backdrop-filter: blur(20px);
          padding: 25px 40px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 40px;
        }

        .portal-subtitle {
          font-size: 0.75rem;
          color: #4deaff; /* Vibrantly Bright */
          letter-spacing: 3px;
          text-transform: uppercase;
          font-weight: 800;
          margin-top: 5px;
          text-shadow: 0 0 10px rgba(0, 210, 255, 0.3);
        }

        .brand-fonts {
          color: #ffffff !important;
          text-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          padding: 8px 18px;
          border-radius: 30px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: var(--text-muted);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .status-pulse {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 10px #22c55e;
          animation: pulse 2s infinite;
        }

        .portal-grid {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 30px;
        }

        .portal-main {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .card-icon-box {
          width: 40px;
          height: 40px;
          background: rgba(0, 210, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: var(--primary-glow);
        }

        .card-top h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .portal-sidebar-modern {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .support-card-elite {
          background: linear-gradient(135deg, rgba(0, 86, 255, 0.1), rgba(0, 210, 255, 0.05));
          border-radius: 24px;
          padding: 35px;
          text-align: center;
          border: 1px solid rgba(0, 210, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        .support-icon {
          width: 45px;
          height: 45px;
          color: var(--primary-glow);
          margin-bottom: 15px;
        }

        .support-card-elite h4 {
          margin-bottom: 10px;
          font-size: 1.1rem;
        }

        .support-card-elite p {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 25px;
          line-height: 1.6;
        }

        .support-action-btn {
          width: 100%;
          height: 50px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--primary-glow);
          color: var(--primary-glow);
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .support-action-btn:hover {
          background: var(--primary-glow);
          color: #000;
          box-shadow: 0 10px 20px rgba(0, 210, 255, 0.2);
        }

        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }

        @media (max-width: 1100px) {
          .portal-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;
