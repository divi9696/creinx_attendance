import React, { useState } from 'react';
import AttendanceReport from '../components/AttendanceReport';
import DeepDiveReports from '../components/DeepDiveReports';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, RefreshCcw, Download, Users, Layers } from 'lucide-react';

const Reports = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="rpt-page">
      {/* ─── Header ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rpt-header">
        <div>
          <h1 className="rpt-title">Archive & Logs</h1>
          <p className="rpt-sub">Access comprehensive attendance archives and individual personnel analytics</p>
        </div>
        <div className="rpt-actions">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRefresh} className="rpt-btn primary">
            <RefreshCcw size={16} className={refreshing ? 'spin' : ''} /><span>Sync Data</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ─── TABS ─── */}
      <div className="emp-tabs" style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', display: 'flex', gap: '8px' }}>
        <button
          className={`emp-tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Layers size={15} /> Personnel Logs
        </button>
        <button
          className={`emp-tab ${activeTab === 'deepdive' ? 'active' : ''}`}
          onClick={() => setActiveTab('deepdive')}
        >
          <Users size={15} /> Deep-Dive Reports
        </button>
      </div>

      {/* ─── Tab Content ─── */}
      <AnimatePresence mode="wait">
        {activeTab === 'logs' ? (
          <motion.div 
            key="logs"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="rpt-card"
          >
            <div className="rpt-card-header">
              <div className="rpt-card-title"><FileText size={18} /><h3>Personnel Attendance Logs</h3></div>
            </div>
            <AttendanceReport />
          </motion.div>
        ) : (
          <motion.div 
            key="deepdive"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="rpt-card"
          >
            <div className="rpt-card-header">
              <div className="rpt-card-title"><Users size={18} /><h3>Individual Personnel Analytics</h3></div>
            </div>
            <DeepDiveReports />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .rpt-page { width: 100%; display: flex; flex-direction: column; gap: 20px; }

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

        .emp-tab {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 12px; border: 1px solid transparent;
          font-size: 0.82rem; font-weight: 700; cursor: pointer;
          color: rgba(255,255,255,0.4); background: transparent;
          transition: all 0.2s; font-family: 'Outfit', sans-serif;
        }
        .emp-tab:hover { color: #fff; background: rgba(255,255,255,0.04); }
        .emp-tab.active { color: #fff; background: rgba(0,210,255,0.08); border-color: rgba(0,210,255,0.2); }

        .spin { animation: spin 1s infinite linear; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media print {
          .rpt-header, .rpt-actions { display: none; }
          .rpt-card { border: none; padding: 0; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
