import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';

import AdminStaffPanel from '../components/AdminStaffPanel';
import AttendanceForm from '../components/AttendanceForm';
import LeaveRequestForm from '../components/LeaveRequestForm';
import LeaveStatusWidget from '../components/LeaveStatusWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle2, Building2, Home, Activity, RefreshCcw, Clock, Calendar, MessageSquare, Briefcase } from 'lucide-react';

const Dashboards = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('workspace');
  const [workspaceRefreshKey, setWorkspaceRefreshKey] = useState(0);

  useEffect(() => { fetchDashboardData(); }, []);

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
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) return (
    <div className="adm-loading">
      <div className="adm-spinner"></div>
      <span>Fetching Intelligence...</span>
    </div>
  );

  const stats = [
    {
      label: 'Total Staff', value: data?.stats?.totalEmployees || 0,
      icon: <Users size={22} />, color: '#4deaff', bg: 'rgba(0,210,255,0.08)', border: 'rgba(0,210,255,0.15)'
    },
    {
      label: 'Present Today', value: data?.stats?.presentToday || 0,
      icon: <CheckCircle2 size={22} />, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)'
    },
    {
      label: 'Office Sector', value: data?.stats?.officeToday || 0,
      icon: <Building2 size={22} />, color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.15)'
    },
    {
      label: 'Working Remote', value: data?.stats?.homeToday || 0,
      icon: <Home size={22} />, color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.15)'
    },
  ];

  const handleAttendanceSuccess = () => setWorkspaceRefreshKey(prev => prev + 1);
  const handleLeaveSuccess = () => setWorkspaceRefreshKey(prev => prev + 1);

  return (
    <div className="adm-page">

      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="adm-header"
      >
        <div>
          <h1 className="adm-title">Dashboard</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="adm-refresh-btn"
        >
          <RefreshCcw size={16} className={refreshing ? 'spin' : ''} />
          <span>Sync</span>
        </motion.button>
      </motion.div>

      {/* ─── Admin Tabs ─── */}
      <div className="emp-tabs" style={{ marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', display: 'flex', gap: '8px' }}>
        <button
          className={`emp-tab ${activeTab === 'workspace' ? 'active' : ''}`}
          onClick={() => setActiveTab('workspace')}
        >
          <Briefcase size={15} /> Personal Workspace
        </button>
        <button
          className={`emp-tab ${activeTab === 'intelligence' ? 'active' : ''}`}
          onClick={() => setActiveTab('intelligence')}
        >
          <Activity size={15} /> Dashboard
        </button>
        <button
          className={`emp-tab ${activeTab === 'leave' ? 'active' : ''}`}
          onClick={() => setActiveTab('leave')}
        >
          <Calendar size={15} /> My Leave Requests
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'intelligence' ? (
          <motion.div key="intelligence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* ─── Stat Cards ─── */}
      <div className="adm-stats-grid">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="adm-stat-card"
            style={{ borderColor: stat.border }}
          >
            <div className="adm-stat-icon" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="adm-stat-body">
              <span className="adm-stat-num" style={{ color: stat.color }}>{stat.value}</span>
              <span className="adm-stat-label">{stat.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Full Oversight Panel ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ marginTop: '30px' }}
      >
        <AdminStaffPanel />
      </motion.div>
          </motion.div>
        ) : activeTab === 'leave' ? (
          <motion.div key="leave" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="emp-grid">
            <motion.div className="emp-card adm-section-card">
              <div className="adm-card-header" style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="adm-card-title">
                  <Calendar size={18} color="#a855f7" />
                  <h3>Request Leave</h3>
                </div>
              </div>
              <LeaveRequestForm onSuccess={handleLeaveSuccess} />
            </motion.div>

            <motion.div className="emp-card adm-section-card">
              <div className="adm-card-header" style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="adm-card-title">
                  <MessageSquare size={18} color="#22c55e" />
                  <h3>My Leave Requests</h3>
                </div>
              </div>
              <LeaveStatusWidget key={workspaceRefreshKey} />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="workspace" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="emp-grid-single-admin">
            <motion.div className="emp-card adm-section-card">
              <div className="adm-card-header" style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="adm-card-title">
                  <Clock size={18} color="#4deaff" />
                  <h3>Daily Attendance</h3>
                </div>
              </div>
              <AttendanceForm onSuccess={handleAttendanceSuccess} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .adm-page { 
          width: 100%; 
          max-width: 100%;
          display: flex; 
          flex-direction: column; 
          gap: 20px;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .adm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .adm-title { font-size: 2rem; font-weight: 900; color: #fff; margin-bottom: 4px; }
        .adm-sub { color: rgba(255,255,255,0.35); font-size: 0.82rem; font-weight: 600; }

        .adm-refresh-btn {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff; padding: 10px 20px;
          border-radius: 12px; font-size: 0.82rem;
          font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .adm-refresh-btn:hover { background: rgba(255,255,255,0.08); }
        .spin { animation: spin 1s infinite linear; }

        .adm-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
        }

        .adm-stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid;
          border-radius: 18px;
          padding: 22px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: default;
          transition: all 0.2s;
          box-sizing: border-box;
          min-width: 0; /* prevent grid blowout */
        }

        .adm-stat-icon {
          width: 50px; height: 50px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .adm-stat-body { min-width: 0; flex: 1; }

        .adm-stat-num {
          display: block;
          font-size: 2rem; font-weight: 900; line-height: 1;
          margin-bottom: 6px;
        }
        .adm-stat-label {
          font-size: 0.72rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 1px;
          color: rgba(255,255,255,0.4);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .adm-section-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 24px;
          width: 100%;
          box-sizing: border-box;
        }

        .adm-card-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 20px; padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .adm-card-title { display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,0.6); }
        .adm-card-title h3 { font-size: 1rem; font-weight: 800; color: #fff; }

        .adm-live-badge {
          font-size: 0.6rem; font-weight: 900; letter-spacing: 2px;
          background: rgba(239,68,68,0.1); color: #ef4444;
          border: 1px solid rgba(239,68,68,0.2);
          padding: 4px 12px; border-radius: 20px;
        }

        .adm-loading { height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: rgba(255,255,255,0.4); font-weight: 600; }
        .adm-spinner { width: 28px; height: 28px; border: 2px solid rgba(0,210,255,0.1); border-top-color: #4deaff; border-radius: 50%; animation: spin 1s infinite linear; }

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
          align-items: stretch;
        }

        .emp-grid-single-admin {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
        }

        .adm-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .emp-left, .emp-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 1100px) { 
          .adm-stats-grid { grid-template-columns: repeat(2, 1fr); } 
          .emp-grid { grid-template-columns: 1fr; } 
        }
        @media (max-width: 600px) { 
          .adm-stats-grid { grid-template-columns: 1fr 1fr; gap: 12px; } 
          .adm-stat-card { padding: 16px; gap: 12px; }
          .adm-stat-icon { width: 44px; height: 44px; }
          .adm-stat-num { font-size: 1.5rem; }
          .adm-title { font-size: 1.5rem; } 
        }
        @media (max-width: 400px) {
          .adm-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Dashboards;
