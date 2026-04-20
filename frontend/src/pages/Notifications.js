import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Check, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import API_URL from '../apiConfig';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // The backend announcement controller wraps the array in `data.data`
      setNotifications(response.data.data || []);
    } catch (error) {
      console.log('No notifications yet');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };


  const sendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/announcements`,
        { title: announcementTitle, message: announcementText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnnouncementTitle('');
      setAnnouncementText('');
      setShowAnnounceForm(false);
      fetchNotifications();
    } catch (error) {
       console.error('Failed to send announcement', error);
       alert(error.response?.data?.error || 'Failed to send announcement');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification', error);
      alert('Failed to delete announcement');
    }
  };

  return (
    <div className="settings-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="settings-container"
      >
        {/* Header */}
        <div className="settings-header">
          <div className="header-icon">
            <Bell size={28} />
          </div>
          <div>
            <h1>Notifications Center</h1>
          </div>
        </div>

        {/* Admin Announcement Section */}
        {user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="settings-card admin-section"
          >
            <div className="card-header">
              <h2>Send Announcement</h2>
              <span className="badge-admin">ADMIN ONLY</span>
            </div>

            {!showAnnounceForm ? (
              <button
                onClick={() => setShowAnnounceForm(true)}
                className="btn-primary"
              >
                <Send size={16} /> Create Announcement
              </button>
            ) : (
              <div className="form-group">
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Announcement Title..."
                  className="form-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '10px',
                    fontFamily: 'inherit',
                  }}
                />
                <textarea
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Type your announcement..."
                  className="form-textarea"
                  rows="4"
                />
                <div className="form-actions">
                  <button onClick={sendAnnouncement} className="btn-success">
                    <Check size={16} /> Send
                  </button>
                  <button
                    onClick={() => setShowAnnounceForm(false)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Notifications List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-card">
          <div className="card-header">
            <h2>Announcements & Notifications</h2>
            <span className="count-badge">{notifications.length}</span>
          </div>

          {loading ? (
            <div className="loading-spinner">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={40} />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notif, idx) => (
                <motion.div
                  key={notif.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="notification-item"
                >
                  <div className="notif-content">
                    {notif.title && <h3 style={{color: '#4deaff', margin: '0 0 4px', fontSize: '1rem'}}>{notif.title}</h3>}
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-time">
                      {new Date(notif.created_at || notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {user?.role === 'admin' && (
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="btn-delete"
                    title="Delete"
                  >
                    <X size={16} />
                  </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </motion.div>

      <style jsx>{`
        .settings-page {
          padding: 0;
          overflow: hidden !important;
          display: flex;
          flex-direction: column;
        }

        .settings-container {
          max-width: 1000px;
          width: 100%;
          margin: 0 auto;
          padding: 0 30px;
        }

        .settings-header {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-icon {
          width: 60px;
          height: 60px;
          background: rgba(0, 210, 255, 0.1);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4deaff;
          flex-shrink: 0;
        }

        .settings-header h1 {
          font-size: 2rem;
          color: white;
          margin: 0 0 8px;
        }

        .settings-header p {
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        .settings-card {
          background: rgba(10, 12, 20, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 15px;
          backdrop-filter: blur(20px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header h2 {
          font-size: 1.2rem;
          color: white;
          margin: 0;
        }

        .badge-admin {
          background: rgba(0, 210, 255, 0.1);
          border: 1px solid rgba(0, 210, 255, 0.3);
          color: #4deaff;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.65rem;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .count-badge {
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: #a855f7;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0056ff, #4deaff);
          border: none;
          color: white;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          justify-content: center;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 210, 255, 0.3);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-textarea {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 12px;
          border-radius: 10px;
          font-family: inherit;
          resize: vertical;
          min-height: 100px;
        }

        .form-textarea::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .form-textarea:focus {
          outline: none;
          border-color: #4deaff;
          box-shadow: 0 0 20px rgba(77, 234, 255, 0.2);
        }

        .form-actions {
          display: flex;
          gap: 10px;
        }

        .btn-success,
        .btn-cancel {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-success {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .btn-success:hover {
          background: rgba(34, 197, 94, 0.2);
        }

        .btn-cancel {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-cancel:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notification-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
        }

        .notification-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .notif-content {
          flex: 1;
        }

        .notif-message {
          color: white;
          margin: 0 0 8px;
        }

        .notif-time {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.85rem;
        }

        .btn-delete {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .btn-delete:hover {
          background: #ef4444;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: rgba(255, 255, 255, 0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .empty-state svg {
          opacity: 0.3;
        }

        .loading-spinner {
          text-align: center;
          padding: 40px;
          color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
          .settings-container {
            padding: 20px 16px;
          }

          .settings-header {
            flex-direction: column;
            text-align: center;
          }

          .header-icon {
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Notifications;
