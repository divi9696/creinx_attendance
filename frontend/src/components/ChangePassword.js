import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../apiConfig';
import '../styles/ChangePassword.css';

const ChangePassword = ({ user, onPasswordChanged }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/auth/change-password`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update localStorage to mark password as changed
      const updatedUser = { ...user, first_login: 0 };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Call callback
      if (onPasswordChanged) {
        onPasswordChanged();
      }

      // Redirect to dashboard
      if (user.role === 'admin') {
        navigate('/admin/dashboards');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-overlay">
      <div className="change-password-container">
        <div className="change-password-content">
          <h1>Set Your Password</h1>
          <p className="subtitle">Welcome! This is your first login. Please set a secure password for your account.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="change-password-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password (Default: creinx123) *</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password *</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading}
            >
              {loading ? 'Setting Password...' : 'Set Password & Continue'}
            </button>
          </form>

          <div className="password-requirements">
            <strong>Password Requirements:</strong>
            <ul>
              <li>Minimum 6 characters</li>
              <li>Strong password recommended</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
