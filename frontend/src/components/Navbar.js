import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut, Layout, Users, BarChart3, Fingerprint } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  if (!user || location.pathname === '/login') return null;

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="orbital-dock"
    >
      <div className="dock-content">
        <Link to="/" className="dock-brand">
          <div className="dock-logo-box">
            <img src="/logo.png" alt="Creinx" className="dock-logo" />
          </div>
          <div className="brand-hq">
            <span className="hq-main">CREINX</span>
            <span className="hq-sub">OS v3.0</span>
          </div>
        </Link>

        <div className="dock-links">
          {user.role === 'admin' ? (
            <>
              <NavLink to="/admin/dashboards" className={({ isActive }) => isActive ? 'dock-item active' : 'dock-item'}>
                <Layout size={18} />
                <span>HQ</span>
              </NavLink>
              <NavLink to="/admin/employees" className={({ isActive }) => isActive ? 'dock-item active' : 'dock-item'}>
                <Users size={18} />
                <span>Sector</span>
              </NavLink>
              <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'dock-item active' : 'dock-item'}>
                <BarChart3 size={18} />
                <span>Logs</span>
              </NavLink>
            </>
          ) : (
            <NavLink to="/employee/dashboard" className={({ isActive }) => isActive ? 'dock-item active' : 'dock-item'}>
              <Fingerprint size={18} />
              <span>Identity</span>
            </NavLink>
          )}
        </div>

        <div className="dock-user-sector">
          <div className="user-profile-stack">
            <NavLink to="/change-password" title="Security Settings" className="dock-settings-btn">
              <motion.div whileHover={{ rotate: 90 }} transition={{ type: 'spring' }}>
                <Settings size={18} />
              </motion.div>
            </NavLink>
            <div className="user-text-stack">
              <span className="dock-user-name">{user.name}</span>
              <span className="dock-user-role">{user.role}</span>
            </div>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onLogout} 
            className="dock-logout-btn"
          >
            <LogOut size={18} />
          </motion.button>
        </div>
      </div>

      <style jsx>{`
        .orbital-dock {
          position: sticky;
          top: 25px;
          margin: 0 auto;
          width: calc(100% - 60px);
          max-width: 1380px;
          height: 72px;
          background: rgba(10, 12, 18, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 22px;
          z-index: 9999;
          display: flex;
          align-items: center;
          padding: 0 25px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .dock-content {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dock-brand {
          display: flex;
          align-items: center;
          gap: 15px;
          text-decoration: none;
        }

        .dock-logo-box {
          background: rgba(255, 255, 255, 0.02);
          padding: 8px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .dock-logo { height: 28px; }

        .brand-hq { display: flex; flex-direction: column; }
        .hq-main { color: white; font-weight: 900; font-size: 1rem; letter-spacing: 1px; }
        .hq-sub { color: var(--primary-glow); font-size: 0.6rem; font-weight: 800; letter-spacing: 2px; }

        .dock-links {
          display: flex;
          gap: 10px;
          background: rgba(255, 255, 255, 0.02);
          padding: 6px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .dock-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .dock-item:hover { color: white; background: rgba(255, 255, 255, 0.03); }

        .dock-item.active {
          color: white;
          background: rgba(0, 210, 255, 0.1);
          box-shadow: inset 0 0 15px rgba(0, 210, 255, 0.05);
          position: relative;
        }

        .dock-item.active::after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 2px;
          background: var(--primary-glow);
          border-radius: 2px;
          box-shadow: 0 0 8px var(--primary-glow);
        }

        .dock-user-sector { display: flex; align-items: center; gap: 20px; }

        .user-profile-stack {
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(255, 255, 255, 0.02);
          padding: 6px 15px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .dock-settings-btn { color: var(--text-muted); transition: 0.3s; padding-top: 4px; }
        .dock-settings-btn:hover { color: var(--primary-glow); }

        .user-text-stack { display: flex; flex-direction: column; align-items: flex-end; }
        .dock-user-name { color: white; font-size: 0.8rem; font-weight: 700; }
        .dock-user-role { color: var(--text-dim); font-size: 0.65rem; text-transform: uppercase; font-weight: 800; }

        .dock-logout-btn {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
          color: #ef4444;
          width: 42px; height: 42px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dock-logout-btn:hover { background: #ef4444; color: white; box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }

        @media (max-width: 900px) {
          .dock-item span, .brand-hq, .user-text-stack { display: none; }
          .dock-links { gap: 5px; }
          .orbital-dock { padding: 0 15px; }
        }
      `}</style>
    </motion.nav>
  );
};

export default Navbar;
