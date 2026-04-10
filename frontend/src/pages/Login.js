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
      setError(err.response?.data?.error || 'Authentication denied. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="vibrant-bg">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-glow glow-1"></div>
      </div>
      
      <div className="login-container animate-fade-in">
        <div className="layer-card login-card">
          <header className="login-card-header">
            <div className="logo-wrapper-grand">
              <img src="/logo.png" alt="Creinx" className="login-logo-grand" />
            </div>
          </header>

          <form onSubmit={handleSubmit} className="login-form-minimal">
            <div className="input-layer-expanded">
              <div className="field-group">
                <span className="field-icon-svg">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </span>
                <input
                  type="email"
                  className="glass-input-grand"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER THE ID"
                  required
                />
              </div>
            </div>

            <div className="input-layer-expanded">
              <div className="field-group">
                <span className="field-icon-svg">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input
                  type="password"
                  className="glass-input-grand"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENTER PASSWORD"
                  required
                />
              </div>
            </div>

            {error && <div className="error-layer">{error}</div>}

            <button type="submit" className="login-btn-grand" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'INITIALIZE SESSION'}
              <div className="btn-overlay"></div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
