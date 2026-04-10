import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Movable Elements (Background) */}
      <div className="vibrant-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-glow glow-1"></div>
        <div className="floating-glow glow-2"></div>
      </div>
      
      <div className="login-container animate-fade-in">
        <div className="glass-panel login-card">
          <div className="login-header">
            <div className="logo-badge">
              <img src="/logo.png" alt="Creinx" className="login-logo" />
            </div>
            <h1 className="brand-fonts">Enterprise Access</h1>
            <div className="security-status">
               <span className="dot"></span> SECURE SESSION
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Work Email</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  type="email"
                  id="email"
                  className="glass-input"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@creinx.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Security Credential</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  className="glass-input"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button type="submit" className="login-btn-premium" disabled={loading}>
              <div className="btn-shine"></div>
              {loading ? <span className="spinner"></span> : 'INITIALIZE LOGIN'}
            </button>
          </form>

          <footer className="login-footer-clean">
            <p>© 2024 Creinx International. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
