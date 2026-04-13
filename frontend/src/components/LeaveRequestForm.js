import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { motion } from 'framer-motion';
import { Calendar, FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';

const LeaveRequestForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/leaves/submit`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Leave request submitted successfully!');
      setFormData({ startDate: '', endDate: '', reason: '' });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="leave-request-form-container"
    >
      <div className="leave-request-form">
        {/* Header Section */}
        <div className="form-header">
          <div className="header-icon">
            <Calendar size={24} />
          </div>
          <div>
            <h3>Request Leave</h3>
            <p>Submit a leave request for approval</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="message error-message"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="message success-message"
          >
            <CheckCircle size={18} />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="form-content">
          {/* Date Fields Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">
                <Calendar size={16} />
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                disabled={loading}
                className="date-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">
                <Calendar size={16} />
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                disabled={loading}
                className="date-input"
              />
            </div>
          </div>

          {/* Reason Field */}
          <div className="form-group full-width">
            <label htmlFor="reason">
              <FileText size={16} />
              Reason for Leave
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="4"
              placeholder="Explain the reason for your leave request..."
              required
              disabled={loading}
              className="textarea-input"
            />
            <div className="char-count">
              {formData.reason.length} / 500 characters
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="submit-btn"
          >
            <Send size={18} />
            {loading ? 'Submitting...' : 'Submit Leave Request'}
          </motion.button>
        </form>
      </div>

      <style jsx>{`
        .leave-request-form-container {
          width: 100%;
        }

        .leave-request-form {
          background: linear-gradient(135deg, rgba(10, 12, 20, 0.8), rgba(20, 30, 50, 0.6));
          border: 1px solid rgba(0, 210, 255, 0.15);
          border-radius: 18px;
          padding: 32px;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                      inset 0 0 30px rgba(0, 210, 255, 0.03);
        }

        .form-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
        }

        .header-icon {
          width: 50px;
          height: 50px;
          background: rgba(0, 210, 255, 0.1);
          border: 1px solid rgba(0, 210, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4deaff;
          flex-shrink: 0;
        }

        .form-header h3 {
          color: white;
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0;
        }

        .form-header p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          margin: 4px 0 0;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .success-message {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #86efac;
        }

        .form-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .form-group label svg {
          color: #4deaff;
          flex-shrink: 0;
        }

        .date-input,
        .textarea-input {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          font-size: 0.9rem;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .date-input:focus,
        .textarea-input:focus {
          outline: none;
          border-color: #4deaff;
          background: rgba(0, 210, 255, 0.05);
          box-shadow: 0 0 20px rgba(0, 210, 255, 0.2);
        }

        .date-input:disabled,
        .textarea-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .textarea-input {
          resize: vertical;
          min-height: 100px;
          padding: 14px 16px;
        }

        .textarea-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .char-count {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          text-align: right;
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #0056ff, #4deaff);
          border: none;
          border-radius: 12px;
          padding: 14px 28px;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
        }

        .submit-btn:hover:not(:disabled) {
          box-shadow: 0 10px 30px rgba(0, 210, 255, 0.3);
          transform: translateY(-2px);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .leave-request-form {
            padding: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-icon {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default LeaveRequestForm;
