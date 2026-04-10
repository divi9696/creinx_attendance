import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileBarChart2, Settings,
  LogOut, Fingerprint, ChevronRight, Menu, X
} from 'lucide-react';

const AppLayout = ({ user, onLogout, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const adminNav = [
    { to: '/admin/dashboards', icon: <LayoutDashboard size={20} />, label: 'Intelligence Hub' },
    { to: '/admin/employees', icon: <Users size={20} />, label: 'Workforce Matrix' },
    { to: '/admin/reports', icon: <FileBarChart2 size={20} />, label: 'Archive & Logs' },
  ];

  const employeeNav = [
    { to: '/employee/dashboard', icon: <Fingerprint size={20} />, label: 'My Workspace' },
  ];

  const navItems = user?.role === 'admin' ? adminNav : employeeNav;

  const handleLogout = () => {
    onLogout();
    navigate('/login');
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
        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/logo.png" alt="Creinx" className="s-logo-img" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="s-brand"
              >
                <span className="s-brand-name">CREINX</span>
                <span className="s-brand-sub">OS v3.0</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
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
          <NavLink
            to="/change-password"
            className={({ isActive }) => `s-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="s-nav-icon"><Settings size={20} /></span>
            {!collapsed && <span className="s-nav-label">Settings</span>}
          </NavLink>

          {/* User Profile */}
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
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="s-logout-btn"
              title="Logout"
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="main-content">
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

        .app-shell {
          display: flex;
          min-height: 100vh;
          width: 100vw;
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
          overflow: hidden;
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
          gap: 14px;
          padding: 12px 14px;
          border-radius: 14px;
          text-decoration: none;
          color: rgba(255,255,255,0.45);
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.2s ease;
          position: relative;
          white-space: nowrap;
          overflow: hidden;
          border: 1px solid transparent;
        }
        .s-nav-item:hover {
          color: #fff;
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.06);
        }
        .s-nav-item.active {
          color: #fff;
          background: rgba(0,210,255,0.08);
          border-color: rgba(0,210,255,0.18);
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
          padding: 10px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .s-user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 10px;
          border-radius: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
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

        /* ─── Main Content ─── */
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
          max-width: 1400px;
          width: 100%;
        }

        /* ─── Responsive ─── */
        @media (max-width: 768px) {
          .app-shell { flex-direction: column; }
          .sidebar { width: 100% !important; height: auto; position: relative; flex-direction: row; padding: 12px 16px; }
          .sidebar-nav { flex-direction: row; flex: none; }
          .sidebar-bottom { flex-direction: row; border-top: none; border-left: 1px solid rgba(255,255,255,0.05); padding-left: 12px; }
          .sidebar-logo { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
          .role-badge-wrap { display: none; }
          .page-wrapper { padding: 20px 16px; }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
