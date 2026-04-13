import React, { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, Layout, Users, BarChart3, Fingerprint, ChevronDown, Lock, User, Bell, Shield } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  if (!user || location.pathname === '/login') return null;

  const handleChangePassword = () => {
    setShowMenu(false);
    navigate('/change-password');
  };

  const handleLogout = () => {
    setShowMenu(false);
    onLogout();
  };

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
            <div className="user-text-stack">
              <span className="dock-user-name">{user.name}</span>
              <span className="dock-user-role">{user.role}</span>
            </div>

            {/* Settings Dropdown Menu */}
            <div className="user-actions-menu">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMenu(!showMenu)}
                className="menu-trigger-btn"
              >
                <Settings size={18} />
                <ChevronDown size={14} className={showMenu ? 'rotated' : ''} />
              </motion.button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="dropdown-menu"
                  >
                    {/* Account Section */}
                    <div className="menu-section">
                      <div className="section-label">ACCOUNT</div>
                      <div className="menu-item info-item">
                        <User size={16} />
                        <div className="item-text">
                          <span className="item-title">Profile Information</span>
                          <span className="item-desc">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="menu-divider"></div>

                    {/* Settings Section */}
                    <div className="menu-section">
                      <div className="section-label">SETTINGS</div>
                      <button onClick={handleChangePassword} className="menu-item">
                        <Lock size={16} />
                        <div className="item-text">
                          <span className="item-title">Change Password</span>
                          <span className="item-desc">Update security settings</span>
                        </div>
                      </button>
                      <button className="menu-item">
                        <Shield size={16} />
                        <div className="item-text">
                          <span className="item-title">Privacy & Security</span>
                          <span className="item-desc">Manage your privacy</span>
                        </div>
                      </button>
                      <button className="menu-item">
                        <Bell size={16} />
                        <div className="item-text">
                          <span className="item-title">Notifications</span>
                          <span className="item-desc">Notification preferences</span>
                        </div>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="menu-divider"></div>

                    {/* Session Section */}
                    <div className="menu-section">
                      <div className="section-label">SESSION</div>
                      <button onClick={handleLogout} className="menu-item danger">
                        <LogOut size={16} />
                        <div className="item-text">
                          <span className="item-title">Sign Out</span>
                          <span className="item-desc">End current session</span>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
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

        .user-text-stack { display: flex; flex-direction: column; align-items: flex-end; }
        .dock-user-name { color: white; font-size: 0.8rem; font-weight: 700; }
        .dock-user-role { color: var(--text-dim); font-size: 0.65rem; text-transform: uppercase; font-weight: 800; }

        /* Dropdown Menu Styles */
        .user-actions-menu {
          position: relative;
        }

        .menu-trigger-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .menu-trigger-btn:hover {
          color: var(--primary-glow);
          background: rgba(0, 210, 255, 0.05);
        }

        .menu-trigger-btn svg:last-child {
          transition: transform 0.3s ease;
        }

        .menu-trigger-btn .rotated {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 12px;
          background: rgba(10, 12, 20, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 12px 0;
          min-width: 300px;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6),
                      inset 0 0 20px rgba(0, 210, 255, 0.03);
          z-index: 10000;
          max-height: 500px;
          overflow-y: auto;
        }

        .dropdown-menu::-webkit-scrollbar {
          width: 6px;
        }

        .dropdown-menu::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .dropdown-menu::-webkit-scrollbar-thumb {
          background: rgba(0, 210, 255, 0.3);
          border-radius: 10px;
        }

        .dropdown-menu::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 210, 255, 0.5);
        }

        .menu-section {
          padding: 8px 0;
        }

        .section-label {
          font-size: 0.65rem;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 8px 16px 6px;
        }

        .menu-item {
          width: 100%;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.85rem;
          transition: all 0.2s ease;
          text-align: left;
        }

        .menu-item.info-item {
          cursor: default;
          pointer-events: none;
        }

        .menu-item:hover:not(.info-item) {
          background: rgba(255, 255, 255, 0.04);
        }

        .menu-item.danger:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .menu-item svg {
          flex-shrink: 0;
          color: rgba(255, 255, 255, 0.6);
        }

        .menu-item:hover svg {
          color: rgba(255, 255, 255, 0.8);
        }

        .menu-item.danger svg {
          color: #ef4444;
        }

        .menu-item.info-item svg {
          color: #4deaff;
        }

        .item-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .item-title {
          font-weight: 600;
          color: white;
        }

        .item-desc {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .menu-divider {
          height: 1px;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0)
          );
          margin: 8px 0;
        }

        @media (max-width: 900px) {
          .dock-item span, .brand-hq, .user-text-stack { display: none; }
          .dock-links { gap: 5px; }
          .orbital-dock { padding: 0 15px; }
          .dropdown-menu { right: -10px; min-width: 280px; }
        }
      `}</style>
    </motion.nav>
  );
};

export default Navbar;
