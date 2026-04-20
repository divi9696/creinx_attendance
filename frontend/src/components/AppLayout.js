import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileBarChart2, Settings,
  LogOut, Fingerprint, ChevronRight, Menu, X, Lock, Bell, Shield
} from 'lucide-react';
import axios from 'axios';
import API_URL from '../apiConfig';
import LiveClock from './LiveClock';

const AppLayout = ({ user, onLogout, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [unreadAnnouncement, setUnreadAnnouncement] = useState(null);

  React.useEffect(() => {
    const fetchLatestAnnouncement = async () => {
      if (!user || user.role !== 'employee') return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/announcements`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const announcements = res.data.data;
        if (announcements && announcements.length > 0) {
          const latest = announcements[0];
          const lastSeen = localStorage.getItem(`lastSeenAnnouncement_${user.id}`);
          const msgTime = new Date(latest.created_at || latest.createdAt).getTime();
          if (!lastSeen || parseInt(lastSeen) < msgTime) {
            setUnreadAnnouncement(latest);
          }
        }
      } catch (err) {
        console.error('Failed to check announcements', err);
      }
    };
    fetchLatestAnnouncement();
  }, [user]);

  const dismissAnnouncement = () => {
    if (unreadAnnouncement) {
      localStorage.setItem(
        `lastSeenAnnouncement_${user.id}`, 
        new Date(unreadAnnouncement.created_at || unreadAnnouncement.createdAt).getTime().toString()
      );
    }
    setUnreadAnnouncement(null);
  };

  const adminNav = [
    { to: '/admin/dashboards', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/employees', icon: <Users size={20} />, label: 'Staff Management' },
    { to: '/admin/reports', icon: <FileBarChart2 size={20} />, label: 'Archive & Logs' },
    { to: '/notifications', icon: <Bell size={20} />, label: 'Announcements' },
  ];

  const employeeNav = [
    { to: '/employee/dashboard', icon: <Fingerprint size={20} />, label: 'My Workspace' },
  ];

  const navItems = user?.role === 'admin' ? adminNav : employeeNav;

  const handleLogout = () => {
    setShowSettings(false);
    onLogout();
    navigate('/login');
  };

  const handleChangePassword = () => {
    setShowSettings(false);
    navigate('/change-password');
  };

  const handleNotifications = () => {
    setShowSettings(false);
    navigate('/notifications');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CR';

  return (
    <div className="app-shell">

      {/* ─── SIDEBAR ─── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="sidebar"
      >
        <div className="sidebar-logo" style={{ justifyContent: 'center', padding: '24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <img src="/logo.png" alt="Creinx" className="s-logo-img" style={{ width: '180px', height: 'auto', maxWidth: '100%' }} />
          <button className="collapse-btn" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* ─── Role Badge ─── */}
        {!collapsed && (
          <div className="role-badge-wrap">
            <div className={`role-badge ${user?.role}`}>
              {user?.role === 'admin' ? '🛡 ADMIN' : '👤 EMPLOYEE'}
            </div>
          </div>
        )}

        {/* ─── Navigation ─── */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `s-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="s-nav-icon">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="s-nav-label"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && location.pathname === item.to && (
                <motion.div layoutId="active-pill" className="active-pill" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* ─── Bottom Controls ─── */}
        <div className="sidebar-bottom">
          {/* User Profile with Settings Dropdown */}
          <div className="s-user-card">
            <div className="s-avatar">{initials}</div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="s-user-info"
                >
                  <span className="s-user-name">{user?.name || 'User'}</span>
                  <span className="s-user-role">{user?.role}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Settings Dropdown Button */}
            <div className="settings-menu-wrapper">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSettings(!showSettings)}
                className="s-settings-btn"
                title="Settings"
              >
                <Settings size={16} />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="settings-dropdown"
                  >
                    {/* Account Section */}
                    <div className="dropdown-section">
                      <div className="section-header">ACCOUNT</div>
                      <div className="menu-item info-item">
                        <span className="menu-label">Account</span>
                        <span className="menu-desc">{user?.email}</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="dropdown-divider"></div>

                    {/* Settings Section */}
                    <div className="dropdown-section">
                      <div className="section-header">SETTINGS</div>
                      <button onClick={handleChangePassword} className="menu-item">
                        <Lock size={14} />
                        <div className="menu-text">
                          <span className="menu-label">Change Password</span>
                          <span className="menu-desc">Update security</span>
                        </div>
                      </button>
                      <button onClick={handleNotifications} className="menu-item">
                        <Bell size={14} />
                        <div className="menu-text">
                          <span className="menu-label">Notifications</span>
                          <span className="menu-desc">Alert settings</span>
                        </div>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="dropdown-divider"></div>

                    {/* Session Section */}
                    <div className="dropdown-section">
                      <div className="section-header">SESSION</div>
                      <button onClick={handleLogout} className="menu-item danger">
                        <LogOut size={14} />
                        <div className="menu-text">
                          <span className="menu-label">Sign Out</span>
                          <span className="menu-desc">End session</span>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Global Toast Popup */}
      <AnimatePresence>
        {unreadAnnouncement && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="global-toast-notification"
          >
            <div className="toast-header">
              <Bell size={16} className="toast-icon" />
              <span>New Announcement</span>
              <button className="toast-close" onClick={dismissAnnouncement}><X size={14} /></button>
            </div>
            <div className="toast-body" onClick={() => { dismissAnnouncement(); handleNotifications(); }}>
              <h4>{unreadAnnouncement.title}</h4>
              <p>{unreadAnnouncement.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT ─── */}
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '24px 40px 0', width: '100%', boxSizing: 'border-box' }}>
          <LiveClock />
        </div>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="page-wrapper"
        >
          {children}
        </motion.div>
      </main>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');

        :global(body) {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }

        .app-shell {
          position: fixed;
          top: 0;
          left: 0;
          display: flex;
          height: 100vh;
          width: 100%;
          background: #070810;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
        }

        /* ─── Sidebar Base ─── */
        .sidebar {
          flex-shrink: 0;
          height: 100vh;
          position: sticky;
          top: 0;
          background: rgba(10, 12, 20, 0.98);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          padding: 20px 0;
          overflow: visible;
          z-index: 100;
          backdrop-filter: blur(20px);
        }

        /* ─── Logo ─── */
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 12px;
          position: relative;
        }

        .s-logo-img { width: 36px; height: auto; flex-shrink: 0; }

        .s-brand { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
        .s-brand-name { font-size: 0.9rem; font-weight: 900; color: #fff; letter-spacing: 2px; white-space: nowrap; }
        .s-brand-sub { font-size: 0.55rem; color: #4deaff; font-weight: 800; letter-spacing: 3px; margin-top: 2px; }

        .collapse-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.4);
          width: 26px; height: 26px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0; transition: all 0.2s;
        }
        .collapse-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }

        /* ─── Role Badge ─── */
        .role-badge-wrap { padding: 0 16px 14px; }
        .role-badge {
          font-size: 0.6rem; font-weight: 900; letter-spacing: 2px;
          padding: 5px 14px; border-radius: 20px; display: inline-block;
        }
        .role-badge.admin { background: rgba(0,210,255,0.1); color: #4deaff; border: 1px solid rgba(0,210,255,0.2); }
        .role-badge.employee { background: rgba(168,85,247,0.1); color: #a855f7; border: 1px solid rgba(168,85,247,0.2); }

        /* ─── Nav ─── */
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 10px;
          overflow-y: auto;
        }

        .s-nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 18px;
          border-radius: 16px;
          text-decoration: none;
          color: rgba(255,255,255,0.45);
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.2s ease;
          position: relative;
          white-space: nowrap;
          overflow: hidden;
          border: 1px solid transparent;
          margin-bottom: 6px;
        }
        .s-nav-item:hover {
          color: #fff;
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.1);
          transform: translateX(4px);
        }
        .s-nav-item.active {
          color: #fff;
          background: rgba(0,210,255,0.12);
          border-color: rgba(0,210,255,0.25);
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .s-nav-icon { flex-shrink: 0; display: flex; align-items: center; }
        .s-nav-item.active .s-nav-icon { color: #4deaff; }

        .s-nav-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }

        .active-pill {
          position: absolute;
          right: 14px;
          width: 6px; height: 6px;
          background: #4deaff;
          border-radius: 50%;
          box-shadow: 0 0 10px #4deaff;
        }

        /* ─── Bottom ─── */
        .sidebar-bottom {
          padding: 24px 14px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow: visible;
          position: relative;
          z-index: 100;
          margin-top: auto;
          background: linear-gradient(to top, rgba(10, 12, 20, 1), transparent);
        }

        .s-user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 10px;
          border-radius: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          overflow: visible;
          position: relative;
        }

        .s-avatar {
          width: 36px; height: 36px; flex-shrink: 0;
          border-radius: 10px;
          background: linear-gradient(135deg, #0056ff, #4deaff);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 0.8rem;
        }

        .s-user-info { flex: 1; overflow: hidden; }
        .s-user-name { display: block; font-size: 0.82rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .s-user-role { font-size: 0.62rem; color: rgba(255,255,255,0.35); text-transform: capitalize; font-weight: 600; }

        .s-logout-btn {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
          color: #ef4444;
          width: 32px; height: 32px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0; transition: all 0.2s;
        }
        .s-logout-btn:hover { background: #ef4444; color: #fff; box-shadow: 0 0 15px rgba(239,68,68,0.4); }

        /* ─── Settings Dropdown ─── */
        .settings-menu-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .s-settings-btn {
          background: rgba(0, 210, 255, 0.08);
          border: 1px solid rgba(0, 210, 255, 0.15);
          color: #4deaff;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .s-settings-btn:hover {
          background: rgba(0, 210, 255, 0.15);
          box-shadow: 0 0 15px rgba(0, 210, 255, 0.3);
        }

        .settings-dropdown {
          position: absolute;
          bottom: 100%;
          left: 0;
          margin-bottom: 12px;
          background: rgba(10, 12, 20, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 10px 0;
          min-width: 240px;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6),
                      inset 0 0 20px rgba(0, 210, 255, 0.02);
          z-index: 10001;
          max-height: 400px;
          overflow-y: auto;
        }

        .settings-dropdown::-webkit-scrollbar {
          width: 5px;
        }

        .settings-dropdown::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .settings-dropdown::-webkit-scrollbar-thumb {
          background: rgba(0, 210, 255, 0.3);
          border-radius: 10px;
        }

        .dropdown-section {
          padding: 8px 0;
        }

        .section-header {
          font-size: 0.6rem;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding: 6px 14px;
          margin-bottom: 2px;
        }

        .menu-item {
          width: 100%;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          transition: all 0.15s ease;
          text-align: left;
        }

        .menu-item.info-item {
          cursor: default;
          pointer-events: none;
          opacity: 0.7;
        }

        .menu-item:not(.info-item):hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .menu-item.danger:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .menu-item svg {
          flex-shrink: 0;
          color: rgba(255, 255, 255, 0.5);
        }

        .menu-item:hover:not(.info-item) svg {
          color: rgba(255, 255, 255, 0.8);
        }

        .menu-item.danger svg {
          color: #ef4444;
        }

        .menu-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
          flex: 1;
        }

        .menu-label {
          font-weight: 600;
          color: white;
          font-size: 0.8rem;
        }

        .menu-desc {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.35);
        }

        .dropdown-divider {
          height: 1px;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0.08),
            rgba(255, 255, 255, 0)
          );
          margin: 6px 0;
        }

        .main-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          background:
            radial-gradient(ellipse at 20% 0%, rgba(0,86,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 100%, rgba(0,210,255,0.05) 0%, transparent 60%),
            #070810;
          min-height: 100vh;
        }

        .page-wrapper {
          padding: 36px 40px;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
        }

        .global-toast-notification {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: rgba(10, 12, 20, 0.95);
          border: 1px solid rgba(0, 210, 255, 0.3);
          border-radius: 12px;
          width: 320px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 210, 255, 0.1);
          backdrop-filter: blur(20px);
          z-index: 100000;
          overflow: hidden;
        }

        .toast-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(0, 210, 255, 0.1);
          border-bottom: 1px solid rgba(0, 210, 255, 0.1);
          color: #4deaff;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .toast-close {
          margin-left: auto;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          display: flex;
          padding: 0;
        }

        .toast-close:hover {
          color: white;
        }

        .toast-body {
          padding: 16px;
          cursor: pointer;
        }

        .toast-body:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .toast-body h4 {
          margin: 0 0 6px 0;
          font-size: 0.95rem;
          color: white;
        }

        .toast-body p {
          margin: 0;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .page-wrapper { padding: 24px 28px; }
        }

        @media (max-width: 768px) {
          .app-shell { flex-direction: column; height: 100vh; overflow: hidden; }
          .sidebar { 
             width: 100% !important; 
             height: auto; 
             position: relative; 
             flex-direction: row; 
             align-items: center;
             padding: 12px 16px; 
             border-right: none;
             border-bottom: 1px solid rgba(255,255,255,0.06);
          }
          .sidebar-nav { 
             flex-direction: row; 
             flex: 1; 
             overflow-x: auto; 
             padding: 0; 
             margin: 0 12px;
             /* hide scrollbar for horizontal nav */
             scrollbar-width: none;
             -ms-overflow-style: none;
          }
          .sidebar-nav::-webkit-scrollbar { display: none; }
          .s-nav-item { padding: 8px 12px; }
          .s-nav-label { display: none; } /* Show only icons on mobile nav saves space */
          .active-pill { bottom: -2px; right: 50%; transform: translateX(50%); top: auto; }
          .sidebar-bottom { flex-direction: row; border-top: none; padding: 0; position: static; }
          .s-user-card { padding: 6px; border: none; background: transparent; }
          .s-user-info { display: none !important; }
          .s-settings-btn { width: 36px; height: 36px; }
          .sidebar-logo { border-bottom: none; margin-bottom: 0; padding: 0; flex: none; }
          .role-badge-wrap { display: none; }
          .main-content { height: calc(100vh - 70px); overflow-y: auto; }
          .page-wrapper { padding: 20px 16px; }
          
          /* Settings dropdown adjustment for mobile */
          .settings-dropdown {
             right: 16px; left: auto; top: 70px; bottom: auto; min-width: 200px;
          }
        }
        
        @media (max-width: 480px) {
          .page-wrapper { padding: 16px 12px; }
          .s-nav-item { padding: 8px 10px; }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
