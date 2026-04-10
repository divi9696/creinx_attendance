import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  if (!user || location.pathname === '/login') return null;

  return (
    <nav className="navbar-glass">
      <div className="nav-content">
        <Link to="/" className="nav-brand">
          <img src="/logo.png" alt="Creinx" className="nav-logo" />
          <div className="brand-text">
            <span className="brand-main">CREINX</span>
            <span className="brand-sub">ATTENDANCE</span>
          </div>
        </Link>

        <div className="nav-links">
          {user.role === 'admin' ? (
            <>
              <NavLink to="/admin/dashboards" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/employees" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                Employees
              </NavLink>
              <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                Reports
              </NavLink>
            </>
          ) : (
            <NavLink to="/employee/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              My Attendance
            </NavLink>
          )}
        </div>

        <div className="nav-user">
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
          </div>
          <button onClick={onLogout} className="logout-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        .navbar-glass {
          position: sticky;
          top: 20px;
          margin: 0 20px;
          height: 70px;
          background: rgba(18, 20, 29, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          z-index: 1000;
          display: flex;
          align-items: center;
          padding: 0 24px;
        }

        .nav-content {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .nav-logo {
          height: 36px;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-main {
          color: white;
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: 1px;
          line-height: 1;
        }

        .brand-sub {
          color: var(--primary-glow);
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 2px;
        }

        .nav-links {
          display: flex;
          gap: 32px;
        }

        .nav-item {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: var(--transition);
          position: relative;
          padding: 8px 0;
        }

        .nav-item:hover {
          color: white;
        }

        .nav-item.active {
          color: white;
        }

        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--primary-glow);
          box-shadow: 0 0 10px var(--primary-glow);
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-name {
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .user-role {
          color: var(--text-muted);
          font-size: 0.7rem;
          text-transform: capitalize;
        }

        .logout-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted);
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .logout-btn svg {
          width: 18px;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
