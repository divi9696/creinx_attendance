import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { useNavigate } from 'react-router-dom';

const ChangePassword = ({ user, onPasswordChanged, isManual }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/auth/change-password`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Security credentials updated successfully!');
      onPasswordChanged();
      
      if (isManual) {
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed. Check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page animate-fade-in">
      <div className="glass-panel settings-card">
        <header className="settings-header">
          <div className="settings-icon">🛡️</div>
          <h2>Security Settings</h2>
          <p>Update your access credentials</p>
        </header>

        <form onSubmit={handleSubmit} className="premium-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              className="glass-input"
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              className="glass-input"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirm Identity</label>
            <input
              type="password"
              className="glass-input"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>

          {error && <div className="error-toast">{error}</div>}
          {success && <div className="success-toast">{success}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Optimizing...' : 'Rotate Password'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .change-password-page {
          height: calc(100vh - 150px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .settings-card {
          width: 450px;
          padding: 40px;
        }

        .settings-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .settings-icon {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }

        .settings-header h2 {
          font-size: 1.5rem;
          margin-bottom: 5px;
        }

        .settings-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .glass-input {
          width: 100%;
        }

        .btn-primary {
          width: 100%;
          margin-top: 10px;
        }

        .error-toast { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 12px; border-radius: 8px; font-size: 0.8rem; margin-bottom: 15px; border: 1px solid rgba(239, 68, 68, 0.2); text-align: center; }
        .success-toast { background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 12px; border-radius: 8px; margin-bottom: 15px; border: 1px solid rgba(34, 197, 94, 0.2); text-align: center; }
      `}</style>
    </div>
  );
};

export default ChangePassword;
