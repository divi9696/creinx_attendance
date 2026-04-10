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
      
      // Automatic Redirection based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboards');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
      </div>
      
      <div className="login-container animate-fade-in">
        <div className="glass-panel login-card">
          <div className="login-header">
            <img src="/logo.png" alt="Creinx Logo" className="login-logo" />
            <h1 className="brand-fonts">Welcome Back</h1>
            <p className="subtitle">Creinx Attendance System</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="glass-input"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
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

            {error && <div className="error-badge">{error}</div>}

            <button type="submit" className="btn-primary login-btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Authenticate'}
            </button>
          </form>

          <div className="login-display">
            <p className="demo-hint">Demo: admin@company.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
