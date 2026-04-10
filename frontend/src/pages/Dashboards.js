import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import AttendanceAnalytics from '../components/AttendanceAnalytics';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, Building, Home, Activity, ChevronRight, Calendar } from 'lucide-react';

const Dashboards = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="hq-loading">
        <div className="hq-spinner"></div>
        <span>Initializing HQ...</span>
      </div>
    );
  }

  const stats = [
    { label: 'Total Staff', value: data?.stats?.totalEmployees || 0, icon: <Users size={20} />, color: 'blue' },
    { label: 'Present Today', value: data?.stats?.presentToday || 0, icon: <CheckCircle size={20} />, color: 'emerald' },
    { label: 'Office Sector', value: data?.stats?.officeToday || 0, icon: <Building size={20} />, color: 'purple' },
    { label: 'Remote Ops', value: data?.stats?.homeToday || 0, icon: <Home size={20} />, color: 'cyan' },
  ];

  return (
    <div className="hq-universe">
       <div className="hq-ambience">
         <div className="h-blob hb1"></div>
         <div className="h-blob hb2"></div>
       </div>

       <div className="hq-content">
         <motion.header 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="hq-header"
         >
           <div className="hq-id">
             <h1 className="brand-fonts">Intelligence Hub</h1>
             <p className="hq-sub">EXECUTIVE OVERVIEW & LOGISTICS</p>
           </div>
           
           <div className="hq-calendar">
              <Calendar size={16} />
              <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
           </div>
         </motion.header>

         <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="hq-stats-grid"
         >
           {stats.map((stat, idx) => (
             <motion.div 
               key={idx}
               whileHover={{ y: -5, scale: 1.02 }}
               className={`layer-card hq-stat-card ${stat.color}-theme`}
             >
               <div className="stat-visual">
                 <div className="stat-icon-wrap">{stat.icon}</div>
               </div>
               <div className="stat-data">
                 <div className="stat-val-row">
                   <span className="stat-n">{stat.value}</span>
                   <span className="trend-up">+0%</span>
                 </div>
                 <span className="stat-title">{stat.label}</span>
               </div>
             </motion.div>
           ))}
         </motion.section>

         <div className="hq-main-layout">
           <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="layer-card hq-analytics-box"
           >
             <div className="box-top">
               <div className="box-title">
                 <Activity size={18} />
                 <h3>Attendance Logistics</h3>
               </div>
               <div className="live-pill">LIVE</div>
             </div>
             <AttendanceAnalytics />
           </motion.div>

           <motion.aside 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="layer-card hq-pending-box"
           >
             <div className="box-top">
               <h3>Pending Approvals</h3>
               <button className="text-action-link">Review All</button>
             </div>
             
             <div className="hq-stream">
               <AnimatePresence>
                {data?.pendingLeaves?.length > 0 ? (
                  data.pendingLeaves.map((leave, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ x: 5 }}
                      className="hq-activity-row"
                    >
                      <div className="hq-avatar">{leave.employee_name?.[0]}</div>
                      <div className="hq-row-info">
                        <h5>{leave.employee_name}</h5>
                        <p>{leave.reason}</p>
                      </div>
                      <ChevronRight size={14} className="hq-row-arrow" />
                    </motion.div>
                  ))
                ) : (
                  <div className="hq-empty">Ops sector clear. No pending tasks.</div>
                )}
               </AnimatePresence>
             </div>
           </motion.aside>
         </div>
       </div>

       <style jsx>{`
        .hq-universe {
          min-height: 100vh;
          background: #040508;
          position: relative;
          padding: 40px 30px;
          color: white;
        }

        .hq-ambience {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
        }

        .h-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.04;
        }

        .hb1 { width: 800px; height: 800px; background: #0056ff; top: -10%; left: -10%; }
        .hb2 { width: 600px; height: 600px; background: #00d2ff; bottom: -10%; right: -10%; }

        .hq-content {
          max-width: 1440px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .hq-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding: 0 5px;
        }

        .hq-sub {
          font-size: 0.7rem;
          color: var(--primary-glow);
          letter-spacing: 4px;
          font-weight: 800;
          margin-top: 5px;
        }

        .hq-calendar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 10px 22px;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .hq-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 25px;
          margin-bottom: 30px;
        }

        .hq-stat-card {
          padding: 25px;
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .stat-icon-wrap {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .blue-theme .stat-icon-wrap { color: #3b82f6; border-color: rgba(59, 130, 246, 0.2); }
        .emerald-theme .stat-icon-wrap { color: #10b981; border-color: rgba(16, 185, 129, 0.2); }
        .purple-theme .stat-icon-wrap { color: #a855f7; border-color: rgba(168, 85, 247, 0.2); }
        .cyan-theme .stat-icon-wrap { color: #06b6d4; border-color: rgba(6, 182, 212, 0.2); }

        .stat-n { font-size: 1.8rem; font-weight: 900; display: block; }
        .trend-up { font-size: 0.65rem; color: #10b981; font-weight: 800; border-radius: 20px; background: rgba(16, 185, 129, 0.05); padding: 2px 8px; margin-left: 10px; }

        .stat-title { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }

        .hq-main-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
        }

        .box-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .hq-analytics-box, .hq-pending-box { padding: 30px; }

        .live-pill {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          font-size: 0.6rem;
          font-weight: 900;
          letter-spacing: 2px;
          padding: 4px 12px;
          border-radius: 30px;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .hq-stream { display: flex; flex-direction: column; gap: 15px; }

        .hq-activity-row {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          cursor: pointer;
          border: 1px solid transparent;
        }

        .hq-activity-row:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(0, 210, 255, 0.2);
        }

        .hq-avatar {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #0056ff, #00d2ff);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 0.8rem;
        }

        .hq-row-info h5 { font-size: 0.9rem; margin-bottom: 2px; }
        .hq-row-info p { font-size: 0.7rem; color: var(--text-muted); }

        .hq-loading { height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; font-weight: 700; color: var(--primary-glow); }
        .hq-spinner { width: 30px; height: 30px; border: 2px solid rgba(0, 210, 255, 0.1); border-top-color: var(--primary-glow); border-radius: 50%; animation: spin 1s infinite linear; }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 1200px) {
          .hq-stats-grid { grid-template-columns: 1fr 1fr; }
          .hq-main-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Dashboards;
