import React, { useState, useEffect } from 'react';
import AttendanceReport from '../components/AttendanceReport';
import AttendanceAnalytics from '../components/AttendanceAnalytics';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Activity, Download, RefreshCcw, Database } from 'lucide-react';

const Reports = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="hq-universe">
      {/* Background Ambience */}
      <div className="hq-ambience">
        <div className="h-blob hb-top"></div>
        <div className="h-blob hb-bottom"></div>
      </div>

      <div className="reports-page">
        <motion.header 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="hq-glass-header"
        >
          <div className="hq-header-info">
            <h1 className="brand-fonts">Intelligence Archive</h1>
            <p className="hq-sub-label">SIGNAL ANALYSIS & METRIC LOGS</p>
          </div>
          <div className="hq-header-actions">
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => window.print()} 
               className="action-pill-secondary"
             >
               <Download size={16} />
               <span>Export Archive</span>
             </motion.button>
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setRefreshKey(k => k + 1)} 
               className="action-pill-primary"
             >
               <RefreshCcw size={16} className={refreshKey > 1 ? 'sync-spin' : ''} />
               <span>Re-index Logs</span>
             </motion.button>
          </div>
        </motion.header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="reports-grid-elite"
        >
          <motion.div variants={itemVariants} className="layer-card diagnostic-box">
            <div className="box-header-elite">
              <div className="icon-pod"><Activity size={20} /></div>
              <h3>Statistical Distribution</h3>
              <div className="status-dot-pulse"></div>
            </div>
            <div className="box-content-padded">
              <AttendanceAnalytics key={refreshKey} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="layer-card log-archive-box">
            <div className="box-header-elite">
              <div className="icon-pod"><FileText size={20} /></div>
              <h3>Filtered Personnel Logs</h3>
              <div className="record-count-badge">
                <Database size={12} />
                SECURE STORAGE
              </div>
            </div>
            <div className="box-content-padded">
              <AttendanceReport />
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        .hq-universe {
          min-height: 100vh;
          background: #06070a;
          position: relative;
          padding: 40px 30px;
          overflow-x: hidden;
        }

        .hq-ambience {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .h-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.04;
        }
        .hb-top { width: 800px; height: 800px; background: #0056ff; top: -10%; left: -10%; }
        .hb-bottom { width: 600px; height: 600px; background: #00d2ff; bottom: -10%; right: -10%; }

        .reports-page {
          max-width: 1440px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .hq-glass-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(13, 15, 22, 0.4);
          backdrop-filter: blur(20px);
          padding: 30px 40px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 40px;
        }

        .hq-sub-label {
          font-size: 0.65rem;
          color: var(--primary-glow);
          letter-spacing: 4px;
          font-weight: 800;
          margin-top: 5px;
        }

        .hq-header-actions {
          display: flex;
          gap: 15px;
        }

        .action-pill-primary, .action-pill-secondary {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          border-radius: 14px;
          font-size: 0.85rem;
          font-weight: 800;
          cursor: pointer;
          transition: 0.3s;
          border: 1px solid transparent;
        }

        .action-pill-primary {
          background: var(--primary-glow);
          color: #000;
        }

        .action-pill-secondary {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.05);
          color: #fff;
        }

        .action-pill-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--primary-glow);
          color: var(--primary-glow);
        }

        .reports-grid-elite {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .box-header-elite {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 25px 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .icon-pod {
          width: 44px;
          height: 44px;
          background: rgba(0, 210, 255, 0.05);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-glow);
        }

        .box-header-elite h3 {
          font-size: 1.1rem;
          font-weight: 700;
          flex: 1;
        }

        .status-dot-pulse {
          width: 10px;
          height: 10px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 10px #22c55e;
        }

        .record-count-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 1px;
        }

        .box-content-padded {
          padding: 30px;
        }

        .sync-spin {
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media print {
          .hq-glass-header, .hq-ambience { display: none; }
          .hq-universe { background: white; padding: 0; }
          .layer-card { border: none; box-shadow: none; color: black; background: white; }
          h3 { color: black; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
