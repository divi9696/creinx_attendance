import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Globe, User, ShieldCheck } from 'lucide-react';
import '../styles/Login.css';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mouse tilt tracking
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;
    const rotateXValue = (y - centerY) / 20;
    const rotateYValue = (centerX - x) / 20;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      onLoginSuccess(user);
      
      if (user.role === 'admin') {
        navigate('/admin/dashboards');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Access Denied: Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-universe">
      {/* 3D Floating Elements */}
      <div className="parallax-bg">
        <motion.div 
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="float-obj cube-1"
        ></motion.div>
        <motion.div 
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="float-obj orb-1"
        ></motion.div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="bg-glow"
        ></motion.div>
      </div>

      <motion.div 
        className="login-perspective"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1000 }}
      >
        <motion.div 
          className="login-card-layered"
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* Logo Section */}
          <div className="card-header-premium">
            <motion.div 
              style={{ transform: 'translateZ(50px)' }}
              className="logo-container-3d"
            >
              <img src="/logo.png" alt="Creinx" className="logo-main" />
            </motion.div>
            <motion.div style={{ transform: 'translateZ(30px)' }}>
              <p className="auth-label">SECURE AUTHENTICATION</p>
            </motion.div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form-3d" style={{ transform: 'translateZ(40px)' }}>
            <div className="input-group-3d">
              <label>Work ID</label>
              <div className="input-field">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="input-group-3d">
              <label>Security Key</label>
              <div className="input-field">
                <Lock size={18} className="field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button" 
                  className="show-pwd-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: [ -10, 10, -10, 10, 0 ], opacity: 1 }}
                  className="error-shake"
                >
                  <ShieldCheck size={16} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="login-submit-premium"
              disabled={loading}
            >
              {loading ? <div className="loader-dots"><span>.</span><span>.</span><span>.</span></div> : 'INITIALIZE SESSION'}
            </motion.button>
          </form>

          {/* Social Links (UI Only) */}
          <div className="social-divider" style={{ transform: 'translateZ(20px)' }}>
            <span>OR ACCESS WITH</span>
          </div>
          
          <div className="social-actions-3d" style={{ transform: 'translateZ(30px)' }}>
            <motion.button whileHover={{ y: -2 }} className="social-btn"><Globe size={20} /></motion.button>
            <motion.button whileHover={{ y: -2 }} className="social-btn"><User size={20} /></motion.button>
          </div>

          <div className="card-footer-3d" style={{ transform: 'translateZ(10px)' }}>
             <a href="#forgot" className="footer-link">Lost Credentials?</a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
