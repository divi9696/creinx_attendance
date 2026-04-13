import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const LeaveStatusWidget = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(response.data.leaves || []);
    } catch (err) {
      setError('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return {
          color: '#22c55e',
          bgColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 0.2)',
          icon: CheckCircle,
          label: 'APPROVED'
        };
      case 'declined':
        return {
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.2)',
          icon: XCircle,
          label: 'DECLINED'
        };
      default:
        return {
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.2)',
          icon: Clock,
          label: 'PENDING'
        };
    }
  };

  const filteredLeaves = filter === 'all'
    ? leaves
    : leaves.filter(leave => leave.status === filter);

  const filterCounts = {
    all: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    declined: leaves.filter(l => l.status === 'declined').length
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="leave-status-widget"
      >
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading leave requests...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="leave-status-widget"
    >
      {/* Header */}
      <div className="widget-header">
        <div className="header-content">
          <Calendar size={24} />
          <div>
            <h3>My Leave Requests</h3>
            <p>View and track your leave applications</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        {['all', 'pending', 'approved', 'declined'].map(status => (
          <motion.button
            key={status}
            onClick={() => setFilter(status)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`filter-btn ${filter === status ? 'active' : ''}`}
          >
            <span className="filter-label">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            <span className="filter-count">{filterCounts[status]}</span>
          </motion.button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-banner"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {filteredLeaves.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="empty-state"
          >
            <div className="empty-icon">
              <Calendar size={48} />
            </div>
            <h4>No leave requests found</h4>
            <p>
              {filter === 'all'
                ? 'You haven\'t submitted any leave requests yet'
                : `You have no ${filter} leave requests`}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="leaves-list"
          >
            {filteredLeaves.map((leave, index) => {
              const config = getStatusConfig(leave.status);
              const StatusIcon = config.icon;
              const startDate = new Date(leave.start_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const endDate = new Date(leave.end_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <motion.div
                  key={leave.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="leave-item"
                  style={{
                    borderLeftColor: config.color
                  }}
                >
                  {/* Status Badge */}
                  <div className="item-status" style={{ background: config.bgColor, borderColor: config.borderColor }}>
                    <StatusIcon size={18} style={{ color: config.color }} />
                  </div>

                  {/* Main Content */}
                  <div className="item-content">
                    <div className="date-range">
                      <Calendar size={16} />
                      <span className="dates">{startDate} → {endDate}</span>
                    </div>
                    <p className="reason">{leave.reason}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="status-badge" style={{ background: config.bgColor, borderColor: config.borderColor }}>
                    <span style={{ color: config.color }}>{config.label}</span>
                  </div>

                  {/* Decline Reason if applicable */}
                  {leave.status === 'declined' && leave.decline_reason && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="decline-reason"
                    >
                      <p><strong>Reason:</strong> {leave.decline_reason}</p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .leave-status-widget {
          background: linear-gradient(135deg, rgba(10, 12, 20, 0.8), rgba(20, 30, 50, 0.6));
          border: 1px solid rgba(0, 210, 255, 0.15);
          border-radius: 18px;
          padding: 28px;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                      inset 0 0 30px rgba(0, 210, 255, 0.03);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 20px;
        }

        .loader {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #4deaff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-container p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
        }

        .widget-header {
          display: flex;
          align-items: center;
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-content svg {
          color: #4deaff;
          flex-shrink: 0;
        }

        .widget-header h3 {
          color: white;
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0;
        }

        .widget-header p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          margin: 4px 0 0;
        }

        .filter-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .filter-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 10px 16px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          color: white;
        }

        .filter-btn.active {
          background: rgba(0, 210, 255, 0.15);
          border-color: #4deaff;
          color: #4deaff;
          box-shadow: 0 0 20px rgba(0, 210, 255, 0.2);
        }

        .filter-count {
          background: rgba(0, 210, 255, 0.1);
          border-radius: 8px;
          padding: 2px 8px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .filter-btn.active .filter-count {
          background: #4deaff;
          color: #000;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          padding: 14px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: rgba(0, 210, 255, 0.1);
          border: 2px solid rgba(0, 210, 255, 0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4deaff;
          margin-bottom: 20px;
        }

        .empty-state h4 {
          color: white;
          font-size: 1.1rem;
          margin: 0 0 8px;
          font-weight: 700;
        }

        .empty-state p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
          margin: 0;
        }

        .leaves-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .leave-item {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-left: 4px solid;
          border-radius: 14px;
          padding: 18px;
          transition: all 0.3s ease;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 16px;
          align-items: start;
        }

        .leave-item:hover {
          background: rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .item-status {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .item-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .date-range {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .date-range svg {
          color: #4deaff;
          flex-shrink: 0;
        }

        .dates {
          font-family: 'Courier New', monospace;
          color: white;
        }

        .reason {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          margin: 0;
          line-height: 1.5;
        }

        .status-badge {
          border: 1px solid;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .decline-reason {
          grid-column: 1 / -1;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          padding: 12px 14px;
          margin-top: 4px;
        }

        .decline-reason p {
          color: #fca5a5;
          margin: 0;
          font-size: 0.85rem;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .leaves-list {
            flex-direction: column;
          }

          .leave-item {
            grid-template-columns: 1fr;
          }

          .filter-buttons {
            gap: 8px;
          }

          .filter-btn {
            padding: 8px 12px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default LeaveStatusWidget;
