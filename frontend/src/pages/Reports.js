import React, { useState, useEffect } from 'react';
import AttendanceReport from '../components/AttendanceReport';
import AttendanceAnalytics from '../components/AttendanceAnalytics';
import { motion } from 'framer-motion';
import { FileText, Activity, RefreshCcw, Download } from 'lucide-react';

const Reports = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { setRefreshKey(prev => prev + 1); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey(k => k + 1);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="rpt-page">
      {/* ─── Header ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rpt-header">
        <div>
          <h1 className="rpt-title">Archive & Logs</h1>
          <p className="rpt-sub">Attendance analytics, filtered logs, and statistical distribution</p>
        </div>
        <div className="rpt-actions">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => window.print()} className="rpt-btn secondary">
            <Download size={16} /><span>Export PDF</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRefresh} className="rpt-btn primary">
            <RefreshCcw size={16} className={refreshing ? 'spin' : ''} /><span>Sync Data</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ─── Analytics Chart ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rpt-card">
        <div className="rpt-card-header">
          <div className="rpt-card-title"><Activity size={18} /><h3>Statistical Distribution</h3></div>
          <div className="rpt-live-dot"></div>
        </div>
        <AttendanceAnalytics key={refreshKey} />
      </motion.div>

      {/* ─── Detailed Logs ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rpt-card">
        <div className="rpt-card-header">
          <div className="rpt-card-title"><FileText size={18} /><h3>Personnel Attendance Logs</h3></div>
        </div>
        <AttendanceReport />
      </motion.div>

      <style jsx>{`
        .rpt-page { width: 100%; display: flex; flex-direction: column; gap: 28px; }

        .rpt-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
        .rpt-title { font-size: 2rem; font-weight: 900; color: #fff; margin-bottom: 4px; }
        .rpt-sub { font-size: 0.82rem; color: rgba(255,255,255,0.35); font-weight: 500; }

        .rpt-actions { display: flex; gap: 12px; }
        .rpt-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 12px;
          font-size: 0.82rem; font-weight: 700;
          cursor: pointer; transition: 0.2s; border: 1px solid transparent;
        }
        .rpt-btn.primary { background: #4deaff; color: #000; }
        .rpt-btn.primary:hover { background: #00d2ff; box-shadow: 0 8px 20px rgba(0,210,255,0.25); }
        .rpt-btn.secondary { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); color: #fff; }
        .rpt-btn.secondary:hover { background: rgba(255,255,255,0.08); }

        .rpt-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px; }

        .rpt-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .rpt-card-title { display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,0.5); }
        .rpt-card-title h3 { font-size: 1rem; font-weight: 800; color: #fff; }

        .rpt-live-dot { width: 10px; height: 10px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; animation: pulse 2s infinite; }

        .spin { animation: spin 1s infinite linear; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }

        @media print {
          .rpt-header, .rpt-actions { display: none; }
          .rpt-card { border: none; padding: 0; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
