import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem('profilePhoto') || null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    setShowDropdown(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoData = event.target.result;
        setProfilePhoto(photoData);
        localStorage.setItem('profilePhoto', photoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          📋 Attendance System
        </Link>
        <div className="nav-menu">
          {user ? (
            <>
              <div className="nav-links">
                {user.role === 'admin' ? (
                  <>
                    <Link to="/admin/dashboards" className={`nav-link ${isActive('/admin/dashboards')}`}>Dashboards</Link>
                    <Link to="/admin/employees" className={`nav-link ${isActive('/admin/employees')}`}>Employees</Link>
                    <Link to="/admin/reports" className={`nav-link ${isActive('/admin/reports')}`}>Reports</Link>
                  </>
                ) : (
                  <>
                    <Link to="/employee/dashboard" className={`nav-link ${isActive('/employee/dashboard')}`}>Dashboard</Link>
                    <Link to="/employee/dashboard" className={`nav-link ${isActive('/employee/dashboard')}`}>My Leaves</Link>
                    <Link to="/employee/dashboard" className={`nav-link ${isActive('/employee/dashboard')}`}>History</Link>
                  </>
                )}
              </div>

              <div className="profile-dropdown" ref={dropdownRef}>
                <button 
                  className="profile-icon-btn" 
                  onClick={() => setShowDropdown(!showDropdown)}
                  title="Profile Menu"
                >
                  👤
                </button>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-profile-section">
                      <div className="profile-avatar-container">
                        <div 
                          className="profile-avatar"
                          onClick={triggerFileInput}
                          style={{backgroundImage: profilePhoto ? `url(${profilePhoto})` : 'none'}}
                        >
                          {!profilePhoto && <span className="avatar-placeholder">📷</span>}
                        </div>
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handlePhotoUpload}
                          accept="image/*"
                          style={{display: 'none'}}
                        />
                      </div>
                      <div className="profile-info">
                        <div className="profile-username">{user.name}</div>
                        <div className="profile-role">{user.role.toUpperCase()}</div>
                      </div>
                    </div>
                    <hr className="dropdown-divider" />
                    <button 
                      onClick={handleLogout} 
                      className="logout-btn-dropdown"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
