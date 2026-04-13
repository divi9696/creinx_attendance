import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { useNavigate } from 'react-router-dom';

// Password validation function
const validatePassword = (password) => {
  const requirements = {
    minLength: password && password.length >= 8,
    uppercase: /[A-Z]/.test(password || ''),
    lowercase: /[a-z]/.test(password || ''),
    numbers: /[0-9]/.test(password || ''),
    symbols: /[!@#$%^&*()_+=\[\]{}|;:,.<>?-]/.test(password || '')
  };

  const allMet = Object.values(requirements).every(v => v === true);
  return { requirements, allMet };
};

const ChangePassword = ({ user, onPasswordChanged, isManual }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({ requirements: {}, allMet: false });
  const navigate = useNavigate();

  // Update password validation as user types
  useEffect(() => {
    if (formData.newPassword) {
      setPasswordValidation(validatePassword(formData.newPassword));
    } else {
      setPasswordValidation({ requirements: {}, allMet: false });
    }
  }, [formData.newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrors([]);

    // Validate new password and confirm match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!passwordValidation.allMet) {
      setError('Password does not meet all security requirements');
      setLoading(false);
      return;
    }

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
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        setErrors(data.errors);
      }
      setError(data?.error || 'Update failed. Check your current password.');
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
            />
          </div>

          {/* Password Requirements */}
          {formData.newPassword && (
            <div className="pwd-requirements-box">
              <div className="req-title">Password Requirements</div>
              <div className="req-checklist">
                <div className={`req-item ${passwordValidation.requirements.minLength ? 'met' : ''}`}>
                  <span className="req-icon">{passwordValidation.requirements.minLength ? '✓' : '✕'}</span>
                  <span>At least 8 characters</span>
                </div>
                <div className={`req-item ${passwordValidation.requirements.uppercase ? 'met' : ''}`}>
                  <span className="req-icon">{passwordValidation.requirements.uppercase ? '✓' : '✕'}</span>
                  <span>One uppercase letter (A-Z)</span>
                </div>
                <div className={`req-item ${passwordValidation.requirements.lowercase ? 'met' : ''}`}>
                  <span className="req-icon">{passwordValidation.requirements.lowercase ? '✓' : '✕'}</span>
                  <span>One lowercase letter (a-z)</span>
                </div>
                <div className={`req-item ${passwordValidation.requirements.numbers ? 'met' : ''}`}>
                  <span className="req-icon">{passwordValidation.requirements.numbers ? '✓' : '✕'}</span>
                  <span>One number (0-9)</span>
                </div>
                <div className={`req-item ${passwordValidation.requirements.symbols ? 'met' : ''}`}>
                  <span className="req-icon">{passwordValidation.requirements.symbols ? '✓' : '✕'}</span>
                  <span>One special character (!@#$%^&*)</span>
                </div>
              </div>
            </div>
          )}

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
          {errors.length > 0 && (
            <div className="errors-container">
              {errors.map((err, idx) => (
                <div key={idx} className="error-toast">{err}</div>
              ))}
            </div>
          )}
          {success && <div className="success-toast">{success}</div>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !passwordValidation.allMet || formData.newPassword !== formData.confirmPassword}
          >
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
          max-height: 90vh;
          overflow-y: auto;
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

        .pwd-requirements-box {
          background: rgba(79, 172, 254, 0.05);
          border: 1px solid rgba(79, 172, 254, 0.15);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
        }

        .req-title {
          font-size: 0.7rem;
          font-weight: 700;
          color: #4facfe;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .req-checklist {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .req-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          transition: color 0.2s;
        }

        .req-item.met {
          color: #22c55e;
        }

        .req-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          font-weight: 900;
        }

        .errors-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 15px;
        }

        .btn-primary {
          width: 100%;
          margin-top: 10px;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-toast { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 12px; border-radius: 8px; font-size: 0.8rem; margin-bottom: 15px; border: 1px solid rgba(239, 68, 68, 0.2); text-align: center; }
        .success-toast { background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 12px; border-radius: 8px; margin-bottom: 15px; border: 1px solid rgba(34, 197, 94, 0.2); text-align: center; }
      `}</style>
    </div>
  );
};

export default ChangePassword;
