import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IdCard, Lock, Eye, EyeOff, ShieldCheck, KeyRound, RefreshCcw } from 'lucide-react';
import '../styles/Login.css';

const Login = ({ onLoginSuccess }) => {
  const [employeeUid, setEmployeeUid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notVerified, setNotVerified] = useState(false); // account activation needed
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotVerified(false);

    try {
      const uid = employeeUid.trim().toUpperCase();
      // Retrieve the device token stored at activation for this employee
      const deviceToken = localStorage.getItem(`crx_device_token_${uid}`) || null;

      const response = await axios.post(`${API_URL}/auth/login`, {
        employee_uid: uid,
        password,
        device_token: deviceToken
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onLoginSuccess(user);
      navigate(user.role === 'admin' ? '/admin/dashboards' : '/employee/dashboard');
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.code === 'NOT_VERIFIED') {
        setNotVerified(true);
        setError('Account not activated. Check your email for the activation OTP.');
      } else {
        const errorVal = errData?.error;
        if (typeof errorVal === 'object' && errorVal !== null) {
          setError(errorVal.message || JSON.stringify(errorVal));
        } else {
          setError(errorVal || (err?.message || 'Access Denied: Invalid Credentials'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-universe">
      {/* Background elements */}
      <div className="parallax-bg">
        <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="float-obj cube-1" />
        <motion.div animate={{ y: [0, 30, 0], x: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity, delay: 1 }} className="float-obj orb-1" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 5, repeat: Infinity }} className="bg-glow" />
      </div>

      <div className="login-perspective">
        <div className="login-card-layered">
          {/* Logo */}
          <div className="card-header-premium">
            <div className="logo-container">
              <img src="/logo.png" alt="Creinx" className="logo-main" />
            </div>
            <div>
              <p className="auth-label">SECURE AUTHENTICATION</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Employee ID</label>
              <div className="input-field">
                <IdCard size={18} className="field-icon" />
                <input
                  type="text"
                  value={employeeUid}
                  onChange={(e) => setEmployeeUid(e.target.value.toUpperCase())}
                  placeholder="e.g. CRX0001"
                  required
                  autoComplete="username"
                  style={{ textTransform: 'uppercase', letterSpacing: '2px' }}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Security Key</label>
              <div className="input-field">
                <Lock size={18} className="field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="show-pwd-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: [-10, 10, -10, 10, 0], opacity: 1 }}
                  className="error-shake"
                >
                  <ShieldCheck size={16} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="login-submit-premium"
              disabled={loading}
            >
              {loading
                ? <div className="loader-dots"><span>.</span><span>.</span><span>.</span></div>
                : 'INITIALIZE SESSION'}
            </motion.button>

            {/* Footer links */}
            <div className="login-footer-links">
              {notVerified ? (
                <button
                  type="button"
                  className="login-link activate"
                  onClick={() => navigate('/activate')}
                >
                  <KeyRound size={14} /> Activate My Account
                </button>
              ) : (
                <button
                  type="button"
                  className="login-link"
                  onClick={() => navigate('/activate')}
                >
                  <KeyRound size={14} /> Activate New Account
                </button>
              )}
              <button
                type="button"
                className="login-link"
                onClick={() => navigate('/forgot-password')}
              >
                <RefreshCcw size={14} /> Forgot Password
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .login-footer-links {
          display: flex;
          justify-content: space-between;
          margin-top: 16px;
          gap: 8px;
          flex-wrap: wrap;
        }
        .login-link {
          display: flex;
          align-items: center;
          gap: 5px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.35);
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s;
          padding: 4px;
          font-family: 'Outfit', sans-serif;
        }
        .login-link:hover { color: #4deaff; }
        .login-link.activate { color: rgba(249,115,22,0.7); }
        .login-link.activate:hover { color: #f97316; }
      `}</style>
    </div>
  );
};

export default Login;
